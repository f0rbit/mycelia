import type { MyceliaGraph, RenderableTree } from '@mycelia/core';

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
 * Parsed content with metadata
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
  /** Parsed graph structure */
  graph: MyceliaGraph;
  /** Renderable tree for components */
  renderTree: RenderableTree;
  /** File modification time */
  mtime: Date;
}

/**
 * Content cache entry
 */
export interface ContentCacheEntry extends ParsedContent {
  /** Cache timestamp */
  cachedAt: Date;
}

/**
 * Framework-agnostic content provider interface
 */
export interface ContentProvider {
  /** Get all available content */
  getAllContent(): Promise<ParsedContent[]>;
  /** Get content by slug */
  getContentBySlug(slug: string): Promise<ParsedContent | null>;
  /** Get all available slugs */
  getAllSlugs(): Promise<string[]>;
  /** Watch for content changes (development mode) */
  watch?(callback: (changed: ParsedContent[]) => void): () => void;
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