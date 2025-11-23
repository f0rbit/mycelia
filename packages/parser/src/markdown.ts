import { readFile } from 'fs/promises';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import { visit } from 'unist-util-visit';
import glob from 'fast-glob';
import type { MyceliaGraph, MyceliaNode, MyceliaEdge, ContentNode, TagMapping } from '@mycelia/core';
import { createRegistry } from '@mycelia/core';
import type { Parser, ParserConfig, ParseResult, ParseError } from './types.js';
import * as u from './utils.js';

const processor = unified().use(remarkParse).use(remarkMdx);

interface Semantic {
  ast_node: any;
  tag_name: string;
  attributes: Record<string, any>;
  text: string;
  node_id: string;
  mapping: TagMapping;
  source: any;
}

const ast = (content: string) => processor.parse(content);

const extract = (ast_tree: any, filename: string, registry: any): Semantic[] => {
  const nodes: Semantic[] = [];
  
  visit(ast_tree, (node) => {
    if (!u.semantic(node, registry)) return;
    
    const tag_name = node.name.toLowerCase();
    const attributes = u.attrs(node.attributes);
    const text_content = u.text(node, registry);
    
    nodes.push({
      ast_node: node,
      tag_name,
      attributes,
      text: text_content,
      node_id: attributes.id || u.id(tag_name, text_content),
      mapping: registry[tag_name],
      source: { file: filename, start: node.position?.start, end: node.position?.end }
    });
  });
  
  return nodes;
};

const node = (s: Semantic): MyceliaNode => {
  const base = {
    id: s.node_id,
    type: s.attributes.type || s.tag_name,
    primitive: s.mapping.primitive,
    source: s.source,
    attributes: { ...(s.mapping.attributes || {}), ...s.attributes }
  };
  
  const created = u.date(s.attributes.created_at || s.attributes.createdAt);
  const updated = u.date(s.attributes.updated_at || s.attributes.updatedAt);
  if (created) (base as any).created_at = created;
  if (updated) (base as any).updated_at = updated;
  
  switch (s.mapping.primitive) {
    case 'Content':
      return {
        ...base, primitive: 'Content',
        title: s.attributes.title || s.attributes.name || s.text.split('\n')[0] || s.node_id,
        content: s.text,
        value: s.attributes.value,
        children: [],
        attributes: base.attributes
      };
    case 'Reference':
      return {
        ...base, primitive: 'Reference',
        target: s.attributes.to || s.attributes.target || '',
        link_type: s.attributes.link_type || 'references',
        attributes: base.attributes
      };
    case 'Meta':
      return {
        ...base, primitive: 'Meta',
        meta_type: s.attributes.meta_type || 'tag',
        value: s.text || s.attributes.value || '',
        target: s.attributes.target,
        attributes: base.attributes
      };
    default:
      throw new Error(`Unknown primitive: ${s.mapping.primitive}`);
  }
};

const hierarchy = (
  ast_tree: any,
  semantics: Semantic[],
  nodes: MyceliaNode[]
): { nodes: MyceliaNode[]; edges: MyceliaEdge[] } => {
  const ast_map = new Map(semantics.map(s => [s.ast_node, s.node_id]));
  const node_map = new Map(nodes.map(n => [n.id, n]));
  const edges: MyceliaEdge[] = [];
  
  const traverse = (ast_node: any, parent_id?: string) => {
    const current_id = ast_map.get(ast_node);
    
    if (current_id && parent_id) {
      const parent = node_map.get(parent_id);
      const child = node_map.get(current_id);
      
      if (parent && child && parent.primitive === 'Content') {
        (parent as ContentNode).children.push(current_id);
        edges.push({
          id: u.edge(parent_id, current_id, 'contains'),
          from: parent_id,
          to: current_id,
          type: 'contains'
        });
      }
    }
    
    const next_parent = current_id || parent_id;
    if (ast_node.children) {
      ast_node.children.forEach((c: any) => traverse(c, next_parent));
    }
  };
  
  traverse(ast_tree);
  return { nodes, edges };
};

const edges = {
  attrs: (nodes: MyceliaNode[]): MyceliaEdge[] => {
    const result: MyceliaEdge[] = [];
    nodes.forEach(n => {
      const a = n.attributes;
      if (a.parent) {
        result.push({ id: u.edge(a.parent, n.id, 'contains'), from: a.parent, to: n.id, type: 'contains' });
      }
      if (a.to || a.target) {
        const target = a.to || a.target;
        result.push({ id: u.edge(n.id, target, 'references'), from: n.id, to: target, type: 'references' });
      }
    });
    return result;
  },
  
  content: (nodes: MyceliaNode[]): MyceliaEdge[] => {
    const result: MyceliaEdge[] = [];
    const ids = nodes.map(n => n.id);
    nodes.forEach(n => {
      if (n.primitive !== 'Content' || !n.content) return;
      ids.forEach(cid => {
        if (cid !== n.id && n.content!.includes(cid)) {
          result.push({ id: u.edge(n.id, cid, 'references'), from: n.id, to: cid, type: 'references' });
        }
      });
    });
    return result;
  },
  
  dedupe: (edges: MyceliaEdge[]): MyceliaEdge[] => {
    const seen = new Set<string>();
    return edges.filter(e => {
      if (seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    });
  }
};

const indexes = (nodes: MyceliaNode[], edges_list: MyceliaEdge[]) => {
  const idx = {
    byType: u.group(nodes, 'type'),
    byPrimitive: u.group(nodes, 'primitive'),
    byTag: {} as Record<string, string[]>,
    bySource: {} as Record<string, string[]>,
    inbound: {} as Record<string, string[]>,
    outbound: {} as Record<string, string[]>
  };
  
  nodes.forEach(n => {
    const file = n.source.file;
    if (!idx.bySource[file]) idx.bySource[file] = [];
    idx.bySource[file].push(n.id);
    idx.inbound[n.id] = [];
    idx.outbound[n.id] = [];
  });
  
  edges_list.forEach(e => {
    if (!idx.outbound[e.from]) idx.outbound[e.from] = [];
    if (!idx.inbound[e.to]) idx.inbound[e.to] = [];
    idx.outbound[e.from].push(e.id);
    idx.inbound[e.to].push(e.id);
  });
  
  return idx;
};

const graph = (nodes: MyceliaNode[], edges_list: MyceliaEdge[], sources: string[]): MyceliaGraph => {
  const type_breakdown: Record<string, number> = {};
  nodes.forEach(n => type_breakdown[n.type] = (type_breakdown[n.type] || 0) + 1);
  
  return {
    nodes: Object.fromEntries(nodes.map(n => [n.id, n])),
    edges: edges_list,
    indexes: indexes(nodes, edges_list),
    meta: {
      generatedAt: new Date().toISOString(),
      version: '0.1.0',
      files: sources.length,
      sources,
      stats: { nodeCount: nodes.length, edgeCount: edges_list.length, typeBreakdown: type_breakdown }
    }
  };
};

const empty = (): MyceliaGraph => ({
  nodes: {},
  edges: [],
  indexes: { byType: {}, byTag: {}, byPrimitive: {}, bySource: {}, inbound: {}, outbound: {} },
  meta: { generatedAt: new Date().toISOString(), version: '0.1.0', files: 0, sources: [], stats: { nodeCount: 0, edgeCount: 0, typeBreakdown: {} } }
});

export const parseContent = async (content: string, filename: string, config: ParserConfig = {}): Promise<ParseResult> => {
  const registry = config.registry || createRegistry();
  const errors: ParseError[] = [];
  const warnings: string[] = [];
  
  try {
    const ast_tree = ast(content);
    const semantics = extract(ast_tree, filename, registry);
    
    visit(ast_tree, (n) => {
      if ((n.type === 'mdxJsxFlowElement' || n.type === 'mdxJsxTextElement') && n.name) {
        if (!registry[n.name.toLowerCase()]) warnings.push(`Unknown tag '${n.name}' in ${filename}`);
      }
    });
    
    const nodes = semantics.map(node);
    const { nodes: nodes_hier, edges: edges_hier } = hierarchy(ast_tree, semantics, nodes);
    const all_edges = edges.dedupe([...edges_hier, ...edges.attrs(nodes_hier), ...edges.content(nodes_hier)]);
    
    return { graph: graph(nodes_hier, all_edges, [filename]), errors, warnings };
  } catch (error) {
    errors.push({ message: `Parse error: ${error}`, file: filename, severity: 'error' });
    return { graph: empty(), errors, warnings };
  }
};

export const parse = async (files: string[] | string, config: ParserConfig = {}): Promise<ParseResult> => {
  const file_list = typeof files === 'string' ? await glob(files) : files;
  const errors: ParseError[] = [];
  const warnings: string[] = [];
  const all_nodes: MyceliaNode[] = [];
  const all_edges: MyceliaEdge[] = [];
  
  for (const path of file_list) {
    try {
      const content = await readFile(path, 'utf-8');
      const result = await parseContent(content, path, config);
      all_nodes.push(...Object.values(result.graph.nodes));
      all_edges.push(...result.graph.edges);
      errors.push(...result.errors);
      warnings.push(...result.warnings);
    } catch (error) {
      errors.push({ message: `Failed to read file: ${error}`, file: path, severity: 'error' });
    }
  }
  
  return { graph: graph(all_nodes, edges.dedupe(all_edges), file_list), errors, warnings };
};

export class MarkdownParser implements Parser {
  parse = parse;
  parseContent = parseContent;
}

export const FunctionalMarkdownParser = MarkdownParser;
