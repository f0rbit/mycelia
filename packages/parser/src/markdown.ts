import { readFile } from 'fs/promises';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import { visit } from 'unist-util-visit';

import glob from 'fast-glob';

import type { MyceliaGraph } from '@mycelia/core';

import { createRegistry } from '@mycelia/core';

import type { Parser, ParserConfig, ParseResult, ParseError } from './types.js';
import { generateNodeId, extractAttributes, createNodeFromMapping, normalizeDate } from './utils.js';

export class MarkdownParser implements Parser {
  private processor = unified().use(remarkParse).use(remarkMdx);

  async parse(files: string[] | string, config: ParserConfig = {}): Promise<ParseResult> {
    const fileList = typeof files === 'string' ? await glob(files) : files;
    
    const graph: MyceliaGraph = {
      nodes: {},
      edges: [],
      indexes: {
        byType: {},
        byTag: {},
        byPrimitive: {},
        bySource: {},
        inbound: {},
        outbound: {}
      },
      meta: {
        generatedAt: new Date().toISOString(),
        version: '0.1.0',
        files: fileList.length,
        sources: fileList,
        stats: {
          nodeCount: 0,
          edgeCount: 0,
          typeBreakdown: {}
        }
      }
    };

    const errors: ParseError[] = [];
    const warnings: string[] = [];
    
    // Parse all files
    for (const filePath of fileList) {
      try {
        const content = await readFile(filePath, 'utf-8');
        const fileResult = await this.parseContent(content, filePath, config);
        
        // Merge results
        Object.assign(graph.nodes, fileResult.graph.nodes);
        graph.edges.push(...fileResult.graph.edges);
        errors.push(...fileResult.errors);
        warnings.push(...fileResult.warnings);
        
      } catch (error) {
        errors.push({
          message: `Failed to read file: ${error}`,
          file: filePath,
          severity: 'error'
        });
      }
    }

    // Build indexes and update stats AFTER all processing is complete  
    this.buildIndexes(graph);

    // Update stats
    graph.meta.stats.nodeCount = Object.keys(graph.nodes).length;
    graph.meta.stats.edgeCount = graph.edges.length;
    
    // Update type breakdown
    for (const node of Object.values(graph.nodes)) {
      graph.meta.stats.typeBreakdown[node.type] = (graph.meta.stats.typeBreakdown[node.type] || 0) + 1;
    }
    
    return {
      graph,
      errors,
      warnings
    };
  }

  async parseContent(content: string, filename: string, config: ParserConfig = {}): Promise<ParseResult> {
    const registry = config.registry || createRegistry();
    const errors: ParseError[] = [];
    const warnings: string[] = [];
    
    const graph: MyceliaGraph = {
      nodes: {},
      edges: [],
      indexes: { byType: {}, byTag: {}, byPrimitive: {}, bySource: {}, inbound: {}, outbound: {} },
      meta: {
        generatedAt: new Date().toISOString(),
        version: '0.1.0',
        files: 1,
        sources: [filename],
        stats: { nodeCount: 0, edgeCount: 0, typeBreakdown: {} }
      }
    };

    try {
      const ast = this.processor.parse(content);
      
      // Map AST nodes to their semantic node IDs for hierarchy building
      const astNodeToSemanticId = new Map();
      
      // First pass: Create all nodes without relationships
      visit(ast, (node) => {
        if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
          const tagName = node.name;
          if (!tagName) return;

          // Look up mapping with case-insensitive tag name
          const mapping = registry[tagName.toLowerCase()];
          if (!mapping) {
            warnings.push(`Unknown tag '${tagName}' in ${filename}`);
            return;
          }

          const attributes = extractAttributes(node.attributes);
          const textContent = this.extractDirectTextContent(node, createRegistry());
          const nodeId = generateNodeId(
            tagName.toLowerCase(), 
            attributes.id, 
            textContent
          );

          const source = {
            file: filename,
            start: node.position?.start,
            end: node.position?.end
          };

          // Create the node
          const myceliaNode = createNodeFromMapping(
            nodeId,
            tagName,
            mapping,
            attributes,
            textContent,
            source
          );

          // Add timestamps if available
          if (attributes.created_at || attributes.createdAt) {
            myceliaNode.created_at = normalizeDate(attributes.created_at || attributes.createdAt);
          }
          if (attributes.updated_at || attributes.updatedAt) {
            myceliaNode.updated_at = normalizeDate(attributes.updated_at || attributes.updatedAt);
          }

          graph.nodes[nodeId] = myceliaNode;
          
          // Map AST node to semantic node ID for hierarchy building
          astNodeToSemanticId.set(node, nodeId);

          // Handle special attributes that create edges
          if (attributes.parent) {
            const edgeId = `${attributes.parent}-contains-${nodeId}`;
            graph.edges.push({
              id: edgeId,
              from: attributes.parent,
              to: nodeId,
              type: 'contains'
            });
          }

          if (attributes.to || attributes.target) {
            const targetId = attributes.to || attributes.target;
            const edgeId = `${nodeId}-references-${targetId}`;
            graph.edges.push({
              id: edgeId,
              from: nodeId,
              to: targetId,
              type: 'references'
            });
          }
        }
      });

      // Second pass: Build containment relationships using manual traversal to track parents
      const buildHierarchy = (node: any, semanticParentId?: string) => {
        const nodeId = astNodeToSemanticId.get(node);
        let currentSemanticParent = semanticParentId;

        // If this node is a semantic node and has a semantic parent, create containment
        if (nodeId && currentSemanticParent) {
          const parentNode = graph.nodes[currentSemanticParent];
          const childNode = graph.nodes[nodeId];
          
          if (parentNode && childNode && ('children' in parentNode)) {
            parentNode.children.push(nodeId);
            
            // Add containment edge
            const edgeId = `${currentSemanticParent}-contains-${nodeId}`;
            graph.edges.push({
              id: edgeId,
              from: currentSemanticParent,
              to: nodeId,
              type: 'contains'
            });
          }
        }

        // If this node is semantic, it becomes the parent for its children
        if (nodeId) {
          currentSemanticParent = nodeId;
        }

        // Recursively process children
        if (node.children) {
          for (const child of node.children) {
            buildHierarchy(child, currentSemanticParent);
          }
        }
      };

      // Start hierarchy building from root
      buildHierarchy(ast);

      // Post-processing: create reference edges based on content
      this.createReferenceEdges(graph, errors, warnings);
      
    } catch (error) {
      errors.push({
        message: `Parse error: ${error}`,
        file: filename,
        severity: 'error'
      });
    }



    // Build indexes and update stats AFTER all processing is complete
    this.buildIndexes(graph);
    
    // Update stats
    graph.meta.stats.nodeCount = Object.keys(graph.nodes).length;
    graph.meta.stats.edgeCount = graph.edges.length;
    
    // Update type breakdown
    for (const node of Object.values(graph.nodes)) {
      graph.meta.stats.typeBreakdown[node.type] = (graph.meta.stats.typeBreakdown[node.type] || 0) + 1;
    }

    return {
      graph,
      errors,
      warnings
    };
  }

  private createReferenceEdges(graph: MyceliaGraph, _errors: ParseError[], _warnings: string[]): void {
    const allIds = Object.keys(graph.nodes);
    
    for (const [nodeId, node] of Object.entries(graph.nodes)) {
      if (!('content' in node) || !node.content) continue;
      
      // Simple reference detection - look for node IDs in content
      for (const candidateId of allIds) {
        if (candidateId === nodeId) continue;
        
        if (node.content.includes(candidateId)) {
          const edgeId = `${nodeId}-references-${candidateId}`;
          
          // Check if edge already exists
          const exists = graph.edges.some(e => 
            e.from === nodeId && e.to === candidateId && e.type === 'references'
          );
          
          if (!exists) {
            graph.edges.push({
              id: edgeId,
              from: nodeId,
              to: candidateId,
              type: 'references'
            });
          }
        }
      }
    }
  }

  private buildIndexes(graph: MyceliaGraph): void {
    // Initialize indexes
    graph.indexes = {
      byType: {},
      byTag: {},
      byPrimitive: {},
      bySource: {},
      inbound: {},
      outbound: {}
    };

    // Index nodes
    for (const [nodeId, node] of Object.entries(graph.nodes)) {
      // By type
      if (!graph.indexes.byType[node.type]) {
        graph.indexes.byType[node.type] = [];
      }
      graph.indexes.byType[node.type].push(nodeId);

      // By primitive
      if (!graph.indexes.byPrimitive[node.primitive]) {
        graph.indexes.byPrimitive[node.primitive] = [];
      }
      graph.indexes.byPrimitive[node.primitive].push(nodeId);

      // By source file
      const sourceFile = node.source.file;
      if (!graph.indexes.bySource[sourceFile]) {
        graph.indexes.bySource[sourceFile] = [];
      }
      graph.indexes.bySource[sourceFile].push(nodeId);

      // Initialize edge indexes
      graph.indexes.inbound[nodeId] = [];
      graph.indexes.outbound[nodeId] = [];
    }

    // Index edges
    for (const edge of graph.edges) {
      // Ensure edge nodes exist in the indexes
      if (!graph.indexes.outbound[edge.from]) {
        graph.indexes.outbound[edge.from] = [];
      }
      if (!graph.indexes.inbound[edge.to]) {
        graph.indexes.inbound[edge.to] = [];
      }
      
      graph.indexes.outbound[edge.from].push(edge.id);
      graph.indexes.inbound[edge.to].push(edge.id);
    }
  }





  /**
   * Extract only the direct text content of a node, excluding text from nested semantic tags
   */
  private extractDirectTextContent(node: any, registry: any): string {
    if (!node.children) return '';

    const textParts: string[] = [];

    const collectDirectText = (currentNode: any) => {
      if (currentNode.type === 'text') {
        textParts.push(currentNode.value);
      } else if (currentNode.type === 'mdxJsxFlowElement' || currentNode.type === 'mdxJsxTextElement') {
        // Skip semantic tags - don't include their text content
        const tagName = currentNode.name;
        if (tagName && registry[tagName.toLowerCase()]) {
          return; // Skip this entire subtree
        }
        // For non-semantic tags, continue processing children
        if (currentNode.children) {
          currentNode.children.forEach(collectDirectText);
        }
      } else if (currentNode.children) {
        // For other node types (paragraphs, emphasis, etc.), process children
        currentNode.children.forEach(collectDirectText);
      }
    };

    node.children.forEach(collectDirectText);
    
    return textParts
      .join('')
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }
}