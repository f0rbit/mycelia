import { join } from 'path';
import { MyceliaContentProvider } from '../shared/content-provider';
import type { MyceliaConfig, NextJS } from '../types/index';

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
 * Includes both file-based content and hierarchical node routes
 * Excludes 'index' since it's handled by the dedicated home page
 */
export async function generateMyceliaStaticParams(): Promise<NextJS.StaticParams[]> {
  const provider = getMyceliaProvider();
  
  // Get both file-based slugs and hierarchical routes
  const [fileSlugs, hierarchicalRoutes] = await Promise.all([
    provider.getAllSlugs(),
    provider.getAllHierarchicalRoutes()
  ]);
  
  // Combine all routes, but filter out 'index' since it's handled by the home page
  const allRoutes = [...fileSlugs, ...hierarchicalRoutes].filter(route => route !== 'index');
  
  return allRoutes.map(route => ({
    slug: route.replace(/^\/+/, '').split('/'),
  }));
}

/**
 * Get content by slug for Next.js page rendering
 * Handles both file-based content and individual graph nodes
 */
export async function getMyceliaContent(slug?: string[]) {
  const provider = getMyceliaProvider();
  const routeStr = slug?.join('/') || 'index';
  
  try {
    // First try to get file-based content
    const fileContent = await provider.getContentBySlug(routeStr);
    if (fileContent) {
      return fileContent;
    }
    
    // If not found, try to get node-based content
    // For routes like /project/burning-blends, try the ID part (burning-blends)
    if (provider.getContentByNodeId) {
      const nodeId = slug && slug.length > 1 ? slug[slug.length - 1] : routeStr;
      if (nodeId) {
        return await provider.getContentByNodeId(nodeId);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error in getMyceliaContent for route:', routeStr, error);
    return null;
  }
}

/**
 * Get all content for listing pages
 */
export async function getAllMyceliaContent() {
  const provider = getMyceliaProvider();
  return await provider.getAllContent();
}