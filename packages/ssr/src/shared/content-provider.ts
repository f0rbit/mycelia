import { readFile, stat } from 'fs/promises';
import { join, relative, parse, sep } from 'path';
import { glob } from 'fast-glob';
const matter = require('gray-matter');
// File watcher removed for now to avoid bundling issues
import { markdown } from '@mycelia/parser';
import type { MyceliaConfig, ParsedContent, ContentCacheEntry, ContentProvider } from '../types';

/**
 * Convert a string to a URL-friendly slug
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Transform a node ID to a hierarchical URL path with intelligent nesting
 */
function nodeIdToPath(nodeId: string, node?: any): string {
  if (!node) return nodeId;
  
  const type = node.type;
  if (!type) return nodeId;

  // Extract clean ID (remove type prefix if present)
  let cleanId = nodeId;
  if (nodeId.startsWith(`${type}-`)) {
    cleanId = nodeId.substring(type.length + 1);
  }

  // For tags/skills/projects, try to use the value/name/title for better URLs
  if (type === 'tag' && node.attributes?.value) {
    cleanId = slugify(String(node.attributes.value));
  } else if (type === 'skill' && node.attributes?.name) {
    cleanId = slugify(String(node.attributes.name));
  } else if ((type === 'project' || type === 'essay') && node.attributes?.title) {
    cleanId = slugify(String(node.attributes.title));
  }

  return `/${type}/${cleanId}`;
}

/**
 * Build deep hierarchical path for a node based on its containment relationships
 */
function buildDeepNodePath(nodeId: string, allContent: ParsedContent[]): string {
  // Find the node and build its containment chain
  let targetNode = null;
  for (const content of allContent) {
    if (content.graph.nodes[nodeId]) {
      targetNode = content.graph.nodes[nodeId];
      break;
    }
  }
  
  if (!targetNode) return nodeId;

  // Build the hierarchy path
  const pathSegments: Array<{ type: string; cleanId: string; originalId: string }> = [];
  let currentId = nodeId;
  const visited = new Set<string>();
  
  // Walk up the containment chain
  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    
    // Find current node
    let currentNode = null;
    for (const content of allContent) {
      if (content.graph.nodes[currentId]) {
        currentNode = content.graph.nodes[currentId];
        break;
      }
    }
    
    if (!currentNode) break;
    
    // Extract clean ID for current node
    let cleanId = currentId;
    const type = currentNode.type;
    
    if (currentId.startsWith(`${type}-`)) {
      cleanId = currentId.substring(type.length + 1);
    }

    // Use better identifiers when available
    if (type === 'tag' && currentNode.attributes?.value) {
      cleanId = slugify(String(currentNode.attributes.value));
    } else if (type === 'skill' && currentNode.attributes?.name) {
      cleanId = slugify(String(currentNode.attributes.name));
    } else if ((type === 'project' || type === 'essay') && currentNode.attributes?.title) {
      cleanId = slugify(String(currentNode.attributes.title));
    }

    // Add to path segments (we'll reverse later)
    pathSegments.unshift({ type, cleanId, originalId: currentId });
    
    // Find parent
    let parentId = '';
    for (const content of allContent) {
      if (content.graph.edges) {
        const parentEdge = content.graph.edges.find(edge => 
          edge.to === currentId && edge.type === 'contains'
        );
        if (parentEdge) {
          parentId = parentEdge.from;
          break;
        }
      }
    }
    
    currentId = parentId;
  }

  // Build intelligent nested path
  return buildIntelligentNestedPath(pathSegments);
}

/**
 * Build intelligent nested path with logical groupings
 */
function buildIntelligentNestedPath(pathSegments: Array<{ type: string; cleanId: string; originalId: string }>): string {
  if (pathSegments.length === 0) return '/';
  if (pathSegments.length === 1 && pathSegments[0]) {
    return `/${pathSegments[0].type}/${pathSegments[0].cleanId}`;
  }
  
  const result: string[] = [];
  
  for (let i = 0; i < pathSegments.length; i++) {
    const segment = pathSegments[i];
    const parent = i > 0 ? pathSegments[i - 1] : null;
    
    if (!segment) continue; // Safety check
    
    if (i === 0) {
      // Root segment - always include type
      result.push(segment.type, segment.cleanId);
    } else if (parent && shouldNestUnderParent(segment, parent)) {
      // Nested segment - use logical grouping
      const groupName = getLogicalGrouping(segment, parent);
      result.push(groupName, segment.cleanId);
    } else {
      // Independent segment
      result.push(segment.type, segment.cleanId);
    }
  }
  
  return '/' + result.join('/');
}

/**
 * Determine if content should be nested under parent
 */
function shouldNestUnderParent(segment: { type: string; cleanId: string; originalId: string }, parent: { type: string; cleanId: string; originalId: string }): boolean {
  if (!segment || !parent) return false;
  
  // Blog/essay content under projects
  if (parent.type === 'project' && segment.type === 'essay') {
    return true;
  }
  
  // Project blog series under projects  
  if (parent.type === 'project' && segment.type === 'project' && segment.cleanId.includes('blog')) {
    return true;
  }
  
  // Tasks under projects
  if (parent.type === 'project' && segment.type === 'task') {
    return true;
  }
  
  return false;
}

/**
 * Get logical group name for nested content
 */
function getLogicalGrouping(segment: { type: string; cleanId: string; originalId: string }, parent: { type: string; cleanId: string; originalId: string }): string {
  if (!segment || !parent) return 'unknown';
  
  // DevPad blog series becomes "blog"
  if (parent.type === 'project' && segment.originalId === 'devpad-blog-series') {
    return 'blog';
  }
  
  // General essay under project becomes "articles"
  if (parent.type === 'project' && segment.type === 'essay') {
    if (segment.cleanId.includes('blog') || segment.cleanId.includes('series')) {
      return 'blog';
    }
    return 'articles';
  }
  
  // Tasks under project
  if (parent.type === 'project' && segment.type === 'task') {
    return 'tasks';
  }
  
  return segment.type;
}

/**
 * Extract hierarchical path components from a URL path
 */
function parseHierarchicalPath(path: string): { type: string; id: string } | null {
  const segments = path.replace(/^\/+/, '').split('/');
  if (segments.length === 2 && segments[0] && segments[1]) {
    return { type: segments[0], id: segments[1] };
  }
  return null;
}

/**
 * Shared content provider that handles MDX file discovery, parsing, and caching
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
   * Default route mapper: converts file paths to URL slugs
   */
  private defaultRouteMapper(filePath: string): string {
    const parsed = parse(filePath);
    let slug = join(parsed.dir, parsed.name);
    
    // Convert to web-friendly format
    slug = slug.split(sep).join('/');
    
    // Handle index files
    if (parsed.name === 'index') {
      slug = parsed.dir.split(sep).join('/');
    }
    
    // Remove leading slash and ensure no trailing slash
    slug = slug.replace(/^\/+/, '').replace(/\/+$/, '');
    
    // Add base path
    if (this.config.basePath) {
      slug = `${this.config.basePath}/${slug}`.replace(/\/+/g, '/');
    }
    
    return slug || 'index';
  }

  /**
   * Discover all MDX files in the content directory
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
   * Parse a single MDX file
   */
  private async parseFile(filePath: string): Promise<ParsedContent> {
    const content = await readFile(filePath, 'utf-8');
    const stats = await stat(filePath);
    
    // Extract frontmatter
    const { data: frontmatter, content: mdxContent } = matter(content);
    
    // Generate slug
    const relativePath = relative(this.config.contentDir, filePath);
    const slug = this.config.routeMapper(relativePath);
    
    // Parse with Mycelia
    const parseResult = await markdown.parseContent(mdxContent, filePath);
    
    return {
      filePath: relativePath,
      slug,
      frontmatter,
      content: mdxContent,
      graph: parseResult.graph,
      renderTree: parseResult.renderTree,
      mtime: stats.mtime,
    };
  }

  /**
   * Get content from cache or parse if needed
   */
  private async getOrParseContent(filePath: string): Promise<ParsedContent> {
    const fullPath = join(this.config.contentDir, filePath);
    const stats = await stat(fullPath);
    
    // Check cache
    if (this.config.cache && this.cache.has(filePath)) {
      const cached = this.cache.get(filePath)!;
      if (cached.mtime >= stats.mtime) {
        return cached;
      }
    }
    
    // Parse and cache
    const parsed = await this.parseFile(fullPath);
    
    if (this.config.cache) {
      this.cache.set(filePath, {
        ...parsed,
        cachedAt: new Date(),
      });
    }
    
    return parsed;
  }

  /**
   * Get all available content
   */
  async getAllContent(): Promise<ParsedContent[]> {
    const files = await this.discoverFiles();
    const content = await Promise.all(
      files.map(async (filePath) => {
        const relativePath = relative(this.config.contentDir, filePath);
        return this.getOrParseContent(relativePath);
      })
    );
    
    // Sort by slug for consistent ordering
    return content.sort((a, b) => a.slug.localeCompare(b.slug));
  }

  /**
   * Get content by slug
   */
  async getContentBySlug(slug: string): Promise<ParsedContent | null> {
    const allContent = await this.getAllContent();
    return allContent.find(content => content.slug === slug) || null;
  }

  /**
   * Get all available slugs for static generation
   */
  async getAllSlugs(): Promise<string[]> {
    const content = await this.getAllContent();
    return content.map(c => c.slug);
  }

  /**
   * Get all graph nodes for page generation
   */
  async getAllGraphNodes(): Promise<string[]> {
    const content = await this.getAllContent();
    const allNodeIds = new Set<string>();
    
    // Collect all node IDs from all content graphs
    content.forEach(item => {
      Object.keys(item.graph.nodes).forEach(nodeId => {
        allNodeIds.add(nodeId);
      });
    });
    
    return Array.from(allNodeIds).sort();
  }

  /**
   * Get all hierarchical routes for static generation
   * Returns both individual node routes and type index routes
   */
  async getAllHierarchicalRoutes(): Promise<string[]> {
    const nodesByType = await this.getNodesByType();
    const routes: string[] = [];

    // Add type index routes (e.g., /project, /tag, /skill)
    for (const type of Object.keys(nodesByType)) {
      routes.push(`/${type}`);
    }

    // Add individual node routes with deep nesting (e.g., /project/devpad, /project/devpad/blog/series)
    for (const [type, nodes] of Object.entries(nodesByType)) {
      for (const node of nodes) {
        if (node.hierarchicalPath) {
          routes.push(node.hierarchicalPath);
        }
      }
    }

    return routes.sort();
  }

  /**
   * Get breadcrumb trail for a node by walking up containment edges (simplified)
   */
  async getBreadcrumbs(nodeId: string): Promise<Array<{ id: string; title: string; path: string }>> {
    const allContent = await this.getAllContent();
    const breadcrumbs: Array<{ id: string; title: string; path: string }> = [];
    let currentId = nodeId;

    // Walk up the containment hierarchy
    while (currentId) {
      // Find the current node
      let currentNode = null;
      for (const content of allContent) {
        if (content.graph.nodes[currentId]) {
          currentNode = content.graph.nodes[currentId];
          break;
        }
      }
      
      if (!currentNode) break;

      breadcrumbs.unshift({
        id: currentId,
        title: String(currentNode.attributes?.title || currentNode.attributes?.name || currentId),
        path: buildDeepNodePath(currentId, allContent)
      });

      // Find parent (node that contains this one)
      let parentId = '';
      for (const content of allContent) {
        if (content.graph.edges) {
          const parentEdge = content.graph.edges.find(edge => 
            edge.to === currentId && edge.type === 'contains'
          );
          if (parentEdge) {
            parentId = parentEdge.from;
            break;
          }
        }
      }
      
      currentId = parentId;
    }

    return breadcrumbs;
  }

  /**
   * Find all nodes that reference this node (backlinks)
   */
  async getBacklinks(nodeId: string): Promise<Array<{ id: string; title: string; path: string; type: string; relation: string }>> {
    const allContent = await this.getAllContent();
    const backlinks: Array<{ id: string; title: string; path: string; type: string; relation: string }> = [];
    
    // Look for edges that point TO this node
    for (const content of allContent) {
      if (content.graph.edges) {
        for (const edge of content.graph.edges) {
          if (edge.to === nodeId && edge.from !== nodeId) { // Avoid self-references
            // Find the source node details
            let sourceNode = null;
            for (const contentItem of allContent) {
              if (contentItem.graph.nodes[edge.from]) {
                sourceNode = contentItem.graph.nodes[edge.from];
                break;
              }
            }
            
            if (sourceNode) {
              const title = sourceNode.attributes?.title || sourceNode.attributes?.name || edge.from;
              const path = buildDeepNodePath(edge.from, allContent);
              
              backlinks.push({
                id: edge.from,
                title: String(title),
                path,
                type: sourceNode.type || 'unknown',
                relation: edge.type || 'references'
              });
            }
          }
        }
      }
    }

    // Remove duplicates and sort by type then title
    const uniqueBacklinks = backlinks.filter((link, index, array) => 
      array.findIndex(l => l.id === link.id) === index
    );

    return uniqueBacklinks.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type.localeCompare(b.type);
      }
      return a.title.localeCompare(b.title);
    });
  }

  /**
   * Get content by node ID (creates virtual content for individual graph nodes)
   * Supports both hierarchical paths (e.g., /project/devpad) and direct node IDs
   */
  async getContentByNodeId(nodeId: string): Promise<ParsedContent | null> {
    try {
      const allContent = await this.getAllContent();
      
      // Try to parse as hierarchical path first
      const hierarchical = parseHierarchicalPath(nodeId);
      let actualNodeId = nodeId;
      
      if (hierarchical) {
        // Find node by type and clean ID
        const foundNodeId = await this.findNodeIdByTypeAndCleanId(hierarchical.type, hierarchical.id, allContent);
        if (!foundNodeId) {
          return null;
        }
        actualNodeId = foundNodeId;
      }
      
      // Find the content that contains this node
      let sourceContent: ParsedContent | null = null;
      let targetNode: any = null;
      
      for (const content of allContent) {
        if (content.graph.nodes[actualNodeId]) {
          sourceContent = content;
          targetNode = content.graph.nodes[actualNodeId];
          break;
        }
      }
      
      if (!sourceContent || !targetNode) {
        return null;
      }

      // Use hierarchical path as slug if available, otherwise use node ID
      const slug = hierarchical ? nodeId : nodeIdToPath(actualNodeId, targetNode);

      // Create virtual content for this node
      const nodeContent: ParsedContent = {
        filePath: sourceContent.filePath,
        slug,
        frontmatter: {
          title: targetNode.attributes?.title || targetNode.attributes?.name || actualNodeId,
          type: targetNode.type,
          ...targetNode.attributes
        },
        content: targetNode.value || targetNode.content || '',
        graph: sourceContent.graph,
        renderTree: {
          root: {
            id: actualNodeId,
            type: targetNode.type,
            primitive: targetNode.primitive,
            props: targetNode.attributes || {},
            children: [],
            content: targetNode.value || targetNode.content || 'No content available.',
            resolvedRefs: []
          },
          meta: {
            totalNodes: 1,
            unresolvedRefs: [],
            warnings: []
          }
        },
        mtime: sourceContent.mtime
      };
      
      return nodeContent;
    } catch (error) {
      console.error('Error in getContentByNodeId:', error);
      return null;
    }
  }

  /**
   * Find a node ID by type and clean ID (used for hierarchical URL resolution)
   */
  private async findNodeIdByTypeAndCleanId(type: string, cleanId: string, allContent?: ParsedContent[]): Promise<string | null> {
    if (!allContent) {
      allContent = await this.getAllContent();
    }

    for (const content of allContent) {
      for (const [nodeId, node] of Object.entries(content.graph.nodes)) {
        if (node.type !== type) continue;

        // Try exact match first
        if (nodeId === cleanId || nodeId === `${type}-${cleanId}`) {
          return nodeId;
        }

        // Try matching by slugified attributes
        if (type === 'tag' && node.attributes?.value) {
          if (slugify(String(node.attributes.value)) === cleanId) {
            return nodeId;
          }
        } else if (type === 'skill' && node.attributes?.name) {
          if (slugify(String(node.attributes.name)) === cleanId) {
            return nodeId;
          }
        } else if (type === 'project' && node.attributes?.title) {
          if (slugify(String(node.attributes.title)) === cleanId) {
            return nodeId;
          }
        }
      }
    }

    return null;
  }

  /**
   * Get all nodes grouped by type
   */
  async getNodesByType(): Promise<Record<string, any[]>> {
    const allContent = await this.getAllContent();
    const nodesByType: Record<string, any[]> = {};

    for (const content of allContent) {
      for (const [nodeId, node] of Object.entries(content.graph.nodes)) {
        if (!node.type) continue;

        if (!nodesByType[node.type]) {
          nodesByType[node.type] = [];
        }

        const nodeArray = nodesByType[node.type];
        if (nodeArray) {
          nodeArray.push({
            ...node,
            hierarchicalPath: buildDeepNodePath(nodeId, allContent)
          });
        }
      }
    }

    // Sort nodes within each type
    for (const type in nodesByType) {
      if (nodesByType[type]) {
        nodesByType[type].sort((a, b) => {
          const titleA = a.attributes?.title || a.attributes?.name || a.id;
          const titleB = b.attributes?.title || b.attributes?.name || b.id;
          return String(titleA).localeCompare(String(titleB));
        });
      }
    }

    return nodesByType;
  }

  /**
   * Watch for content changes (development mode)
   * NOTE: File watching temporarily disabled to avoid bundling issues
   */
  watch(_callback: (changed: ParsedContent[]) => void): () => void {
    console.log('File watching not yet implemented - manual refresh required');
    return () => {}; // No-op for now
  }

  /**
   * Clear all cached content
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }
}