import { readFile, stat } from 'fs/promises';
import { join, relative, parse, sep } from 'path';
import * as glob from 'fast-glob';
import * as matter from 'gray-matter';
// File watcher removed for now to avoid bundling issues
import { markdown } from '@mycelia/parser';
import type { MyceliaConfig, ParsedContent, ContentCacheEntry, ContentProvider } from '../types';

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