import type { MyceliaGraph } from '@mycelia/core';

/**
 * Configuration for Mycelia SSR integration
 */
export interface MyceliaConfig {
  /** Directory containing MDX content files */
  contentDir: string;
  /** Base path for routes (default: '') */
  basePath?: string;
  /** Enable development mode features like file watching */
  dev?: boolean;
  /** Custom route mapping function */
  routeMapper?: (filePath: string) => string;
  /** Cache parsed content (default: true in production) */
  cache?: boolean;
}

/**
 * Simplified parsed content with metadata - graph only
 */
export interface ParsedContent {
  /** File path relative to content directory */
  filePath: string;
  /** Generated route slug */
  slug: string;
  /** Frontmatter metadata */
  frontmatter: Record<string, any>;
  /** Raw MDX content */
  content: string;
  /** Processed HTML content for rendering */
  htmlContent?: string;
  /** Parsed graph structure - single data model */
  graph: MyceliaGraph;
  /** File modification time */
  mtime: Date;
}

/**
 * Simplified content cache entry
 */
export interface ContentCacheEntry extends ParsedContent {
  /** Cache timestamp - optional for flexibility */
  cachedAt?: Date;
}

/**
 * Simplified content provider interface
 */
export interface ContentProvider {
  /** Get all available content */
  getAllContent(): Promise<ParsedContent[]>;
  /** Get content by file-based slug */
  getContentBySlug(slug: string): Promise<ParsedContent | null>;
  /** Get all file-based slugs */
  getAllSlugs(): Promise<string[]>;
  /** Get content by node ID with simple paths */
  getContentByNodeId?(nodeId: string): Promise<ParsedContent | null>;
  /** Get all nodes of a specific type with paths */
  getNodesByType?(nodeType: string): Promise<Array<{ node: any; path: string }>>;
  /** Get all simple routes for static generation */
  getAllHierarchicalRoutes?(): Promise<string[]>;
  /** Get simple breadcrumb trail for a node */
  getBreadcrumbs?(nodeId: string): Promise<Array<{ id: string; title: string; path: string }>>;
  /** Find all nodes that reference this node */
  getBacklinks?(nodeId: string): Promise<Array<{ node: any; path: string }>>;
}

/**
 * Next.js specific types
 */
export namespace NextJS {
  export interface PageProps {
    params: Promise<{ slug?: string[] }>;
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
  }

  export interface StaticParams {
    slug: string[];
  }

  export interface LayoutProps {
    children: React.ReactNode;
    params: Promise<{ slug?: string[] }>;
  }
}