import { readFile, stat } from 'fs/promises';
import { join, relative, parse, sep } from 'path';
import * as glob from 'fast-glob';
const matter = require('gray-matter');
import { markdown } from '@mycelia/parser';
import type { MyceliaGraph } from '@mycelia/core';
// import { processMarkdownToHtml } from './mdx-processor';
import type { MyceliaConfig, ParsedContent, ContentCacheEntry, ContentProvider } from '../types';

/**
 * Convert text to URL-friendly slug
 * Pure function for consistent slugification
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Create simple, predictable URL path from node data
 * Format: /{type}/{id} - no complex nesting
 */
function createSimplePath(node_type: string | undefined, node_id: string | undefined): string {
  const safe_type = node_type || 'unknown';
  const safe_id = node_id || 'unknown';
  const clean_type = slugify(safe_type);
  const clean_id = slugify(safe_id);
  return `/${clean_type}/${clean_id}`;
}

/**
 * Extract type and ID from a simple path
 * Reverse of createSimplePath function
 */
function parseSimplePath(path: string): { type: string; id: string } | null {
  const segments = path.replace(/^\/+/, '').split('/').filter(Boolean);
  if (segments.length === 2 && segments[0] && segments[1]) {
    return { type: segments[0], id: segments[1] };
  }
  return null;
}

/**
 * Simplified content provider with minimal complexity
 * Single data model, simple URLs, unified resolution
 */
export class MyceliaContentProvider implements ContentProvider {
  private config: Required<MyceliaConfig>;
  private cache = new Map<string, ContentCacheEntry>();

  constructor(config: MyceliaConfig) {
    this.config = {
      basePath: '',
      dev: process.env.NODE_ENV === 'development',
      cache: process.env.NODE_ENV === 'production',
      routeMapper: this.defaultRouteMapper.bind(this),
      ...config,
    };
  }

  /**
   * Default route mapper: simple file path to slug conversion
   */
  private defaultRouteMapper(file_path: string): string {
    const parsed = parse(file_path);
    let slug = join(parsed.dir, parsed.name);
    
    // Convert to web-friendly format
    slug = slug.split(sep).join('/');
    
    // Handle index files
    if (parsed.name === 'index') {
      slug = parsed.dir.split(sep).join('/');
    }
    
    // Clean up path
    slug = slug.replace(/^\/+/, '').replace(/\/+$/, '');
    
    // Add base path if configured
    if (this.config.basePath) {
      slug = `${this.config.basePath}/${slug}`.replace(/\/+/g, '/');
    }
    
    return slug || 'index';
  }

  /**
   * Discover all content files
   */
  private async discoverFiles(): Promise<string[]> {
    const pattern = join(this.config.contentDir, '**/*.{md,mdx}');
    const files = await glob(pattern, {
      absolute: true,
      ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**'],
    });
    return files;
  }

  /**
   * Parse a single file into content with graph
   */
  private async parseFile(file_path: string): Promise<ParsedContent> {
    const content = await readFile(file_path, 'utf-8');
    const stats = await stat(file_path);
    
    // Extract frontmatter
    const { data: frontmatter, content: mdx_content } = matter(content);
    
    // Generate slug
    const relative_path = relative(this.config.contentDir, file_path);
    const slug = this.config.routeMapper(relative_path);
    
    // Parse with Mycelia - now returns only graph
    const parse_result = await markdown.parseContent(mdx_content, file_path);
    
    // For now, just pass the raw content - we'll process it in the component
    // const htmlContent = await processMarkdownToHtml(mdx_content);
    
    return {
      filePath: relative_path,
      slug,
      frontmatter,
      content: mdx_content,
      // htmlContent, // Add processed HTML later
      graph: parse_result.graph,
      mtime: stats.mtime,
    };
  }

  /**
   * Filter a graph to only include nodes related to a specific node
   * Includes: the node itself, its children, nodes it references, and nodes that reference it
   */
  private filterGraphForNode(node_id: string, full_graph: MyceliaGraph): MyceliaGraph {
    const filtered_nodes: Record<string, any> = {};
    const filtered_edges: any[] = [];
    const related_node_ids = new Set<string>();
    
    // Always include the main node
    related_node_ids.add(node_id);
    
    // Find all edges involving this node
    for (const edge of full_graph.edges) {
      if (edge.from === node_id || edge.to === node_id) {
        filtered_edges.push(edge);
        
        // Add the other node in the relationship
        if (edge.from === node_id) {
          related_node_ids.add(edge.to);
        } else {
          related_node_ids.add(edge.from);
        }
      }
    }
    
    // If this node has children, include them
    const main_node = full_graph.nodes[node_id];
    if (main_node && 'children' in main_node && Array.isArray(main_node.children)) {
      for (const child_id of main_node.children) {
        related_node_ids.add(child_id);
        // Also add edges for these children
        for (const edge of full_graph.edges) {
          if ((edge.from === node_id && edge.to === child_id) || 
              (edge.from === child_id && edge.to === node_id)) {
            if (!filtered_edges.some(e => e.id === edge.id)) {
              filtered_edges.push(edge);
            }
          }
        }
      }
    }
    
    // Copy only the related nodes
    for (const id of related_node_ids) {
      if (full_graph.nodes[id]) {
        filtered_nodes[id] = full_graph.nodes[id];
      }
    }
    
    // Create filtered graph
    return {
      nodes: filtered_nodes,
      edges: filtered_edges,
      indexes: {
        byType: {},
        byTag: {},
        byPrimitive: {},
        bySource: {},
        inbound: {},
        outbound: {}
      },
      meta: {
        ...full_graph.meta,
        stats: {
          nodeCount: Object.keys(filtered_nodes).length,
          edgeCount: filtered_edges.length,
          typeBreakdown: {}
        }
      }
    };
  }

  /**
   * Get all content with caching
   */
  async getAllContent(): Promise<ParsedContent[]> {
    const cache_key = '__all_content__';
    
    // In dev mode, use a simple in-memory cache that persists across requests
    if (this.cache.has(cache_key)) {
      const cached = this.cache.get(cache_key)!;
      if (Array.isArray(cached.content)) {
        return cached.content;
      }
    }

    console.log('[Mycelia] Parsing all content files...');
    const files = await this.discoverFiles();
    const all_content: ParsedContent[] = [];

    // Parse all files in parallel
    const parse_promises = files.map(file => this.parseFile(file));
    const results = await Promise.all(parse_promises);
    all_content.push(...results);

    console.log(`[Mycelia] Parsed ${all_content.length} files, caching results`);
    
    // Always cache results to avoid re-parsing on every request
    this.cache.set(cache_key, {
        filePath: '',
        slug: '',
        frontmatter: {},
        content: all_content as any, // Store array in content field
        graph: { nodes: {}, edges: [], indexes: { byType: {}, byTag: {}, byPrimitive: {}, bySource: {}, inbound: {}, outbound: {} }, meta: { generatedAt: '', version: '', files: 0, sources: [], stats: { nodeCount: 0, edgeCount: 0, typeBreakdown: {} } } },
        mtime: new Date(),
        cachedAt: new Date(),
      });

    return all_content;
  }

  /**
   * Get content by file-based slug
   */
  async getContentBySlug(slug: string): Promise<ParsedContent | null> {
    const all_content = await this.getAllContent();
    return all_content.find(content => content.slug === slug) || null;
  }

  /**
   * Get content by node ID from graph
   * This creates a virtual content entry for individual nodes
   */
  async getContentByNodeId(node_id: string): Promise<ParsedContent | null> {
    const all_content = await this.getAllContent();
    
    // Find the node across all content files
    for (const content of all_content) {
      const node = content.graph.nodes[node_id];
      if (node) {
        // Create a filtered graph with only related nodes
        const filteredGraph = this.filterGraphForNode(node_id, content.graph);
        
        // Create virtual content for this specific node
        return {
          filePath: content.filePath,
          slug: createSimplePath(node.type, node.id),
          frontmatter: { title: this.getNodeTitle(node) },
          content: this.getNodeContent(node) || '',
          graph: filteredGraph, // Use filtered graph instead of full graph
          mtime: content.mtime,
        };
      }
    }
    
    return null;
  }

  /**
   * Get all node-based routes for static generation
   */
  async getAllHierarchicalRoutes(): Promise<string[]> {
    const all_content = await this.getAllContent();
    const routes: string[] = [];
    
    // Generate simple routes for all nodes
    for (const content of all_content) {
      for (const node of Object.values(content.graph.nodes)) {
        const route = createSimplePath(node.type, node.id);
        routes.push(route);
      }
    }
    
    return routes;
  }

  /**
   * Get all file-based slugs
   */
  async getAllSlugs(): Promise<string[]> {
    const all_content = await this.getAllContent();
    return all_content.map(content => content.slug);
  }

  /**
   * Get nodes by type with simple URLs
   */
  async getNodesByType(node_type: string): Promise<Array<{ node: any; path: string }>> {
    const all_content = await this.getAllContent();
    const nodes: Array<{ node: any; path: string }> = [];
    
    for (const content of all_content) {
      for (const node of Object.values(content.graph.nodes)) {
        if (node.type === node_type) {
          nodes.push({
            node,
            path: createSimplePath(node.type, node.id)
          });
        }
      }
    }
    
    return nodes;
  }

  /**
   * Build simple breadcrumbs from containment hierarchy
   */
  async getBreadcrumbs(node_id: string): Promise<Array<{ id: string; title: string; path: string }>> {
    const all_content = await this.getAllContent();
    const breadcrumbs: Array<{ id: string; title: string; path: string }> = [];
    
    let current_id = node_id;
    const visited = new Set<string>();
    
    // Walk up containment chain
    while (current_id && !visited.has(current_id)) {
      visited.add(current_id);
      
      // Find current node
      let current_node = null;
      for (const content of all_content) {
        if (content.graph.nodes[current_id]) {
          current_node = content.graph.nodes[current_id];
          break;
        }
      }
      
      if (!current_node) break;
      
      // Add to breadcrumbs
      breadcrumbs.unshift({
        id: current_id,
        title: this.getNodeTitle(current_node),
        path: createSimplePath(current_node.type, current_node.id)
      });
      
      // Find parent (node that contains this one)
      let parent_id = '';
      for (const content of all_content) {
        const parent_edge = content.graph.edges?.find(edge => 
          edge.to === current_id && edge.type === 'contains'
        );
        if (parent_edge) {
          parent_id = parent_edge.from;
          break;
        }
      }
      
      current_id = parent_id;
    }
    
    return breadcrumbs;
  }

  /**
   * Get backlinks to a node
   */
  async getBacklinks(node_id: string): Promise<Array<{ node: any; path: string }>> {
    const all_content = await this.getAllContent();
    const backlinks: Array<{ node: any; path: string }> = [];
    
    for (const content of all_content) {
      // Find reference edges pointing to this node
      const referring_edges = content.graph.edges?.filter(edge => 
        edge.to === node_id && edge.type === 'references'
      ) || [];
      
      for (const edge of referring_edges) {
        const referring_node = content.graph.nodes[edge.from];
        if (referring_node) {
          backlinks.push({
            node: referring_node,
            path: createSimplePath(referring_node.type, referring_node.id)
          });
        }
      }
    }
    
    return backlinks;
  }

  // Helper methods
  private getNodeTitle(node: any): string {
    if (node.primitive === 'Content' && node.title) return node.title;
    if (node.primitive === 'Meta' && node.value) return node.value;
    if (node.attributes?.title) return node.attributes.title;
    if (node.attributes?.name) return node.attributes.name;
    return node.id;
  }

  private getNodeContent(node: any): string | null {
    if (node.primitive === 'Content' && node.content) return node.content;
    if (node.primitive === 'Content' && node.value) return node.value;
    if (node.primitive === 'Meta' && node.value) return node.value;
    return null;
  }
}