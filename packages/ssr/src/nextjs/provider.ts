import { join } from 'path';
import { MyceliaContentProvider } from '../shared/content-provider';
import type { MyceliaConfig, NextJS } from '../types';

/**
 * Singleton content provider for Next.js applications
 */
let globalProvider: MyceliaContentProvider | null = null;

/**
 * Initialize Mycelia for Next.js
 */
export function initializeMycelia(config: Partial<MyceliaConfig> = {}): MyceliaContentProvider {
  const defaultConfig: MyceliaConfig = {
    contentDir: join(process.cwd(), 'content'),
    basePath: '',
    dev: process.env.NODE_ENV === 'development',
    cache: process.env.NODE_ENV === 'production',
  };

  const finalConfig = { ...defaultConfig, ...config };

  if (!globalProvider) {
    globalProvider = new MyceliaContentProvider(finalConfig);
  }

  return globalProvider;
}

/**
 * Get the current Mycelia provider instance
 */
export function getMyceliaProvider(): MyceliaContentProvider {
  if (!globalProvider) {
    return initializeMycelia();
  }
  return globalProvider;
}

/**
 * Generate static params for Next.js static generation
 * Excludes 'index' since it's handled by the dedicated home page
 */
export async function generateMyceliaStaticParams(): Promise<NextJS.StaticParams[]> {
  const provider = getMyceliaProvider();
  const slugs = await provider.getAllSlugs();
  
  // Filter out 'index' since it's handled by the home page
  const filteredSlugs = slugs.filter(slug => slug !== 'index');
  
  return filteredSlugs.map(slug => ({
    slug: slug.split('/'),
  }));
}

/**
 * Get content by slug for Next.js page rendering
 */
export async function getMyceliaContent(slug?: string[]) {
  const provider = getMyceliaProvider();
  const slugStr = slug?.join('/') || 'index';
  
  return await provider.getContentBySlug(slugStr);
}

/**
 * Get all content for listing pages
 */
export async function getAllMyceliaContent() {
  const provider = getMyceliaProvider();
  return await provider.getAllContent();
}