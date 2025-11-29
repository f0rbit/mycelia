import type { Metadata } from 'next';
import type { ParsedContent } from '../types/index';

/**
 * Generate Next.js metadata from Mycelia content
 */
export function generateContentMetadata(content: ParsedContent): Metadata {
  const firstNodeId = Object.keys(content.graph.nodes)[0];
  const title = content.frontmatter.title || 
               (firstNodeId ? content.graph.nodes[firstNodeId]?.attributes?.title : undefined) ||
               content.slug;
  
  const description = content.frontmatter.description ||
                     content.frontmatter.summary ||
                     `Content from ${content.filePath}`;

  return {
    title,
    description,
    ...(content.frontmatter.image && { 
      openGraph: {
        images: [{ url: content.frontmatter.image }]
      }
    }),
    ...(content.frontmatter.date && {
      other: {
        'article:published_time': content.frontmatter.date
      }
    })
  };
}

/**
 * Extract content summary for listings
 */
export function getContentSummary(content: ParsedContent, maxLength = 160): string {
  if (content.frontmatter.description) {
    return content.frontmatter.description;
  }

  if (content.frontmatter.summary) {
    return content.frontmatter.summary;
  }

  // Extract from content
  const text = content.content
    .replace(/^#+ .*/gm, '') // Remove headers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
    .replace(/[*_`]/g, '') // Remove markdown formatting
    .trim();

  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

/**
 * Sort content by date (newest first)
 */
export function sortByDate(a: ParsedContent, b: ParsedContent): number {
  const dateA = a.frontmatter.date ? new Date(a.frontmatter.date) : a.mtime;
  const dateB = b.frontmatter.date ? new Date(b.frontmatter.date) : b.mtime;
  return dateB.getTime() - dateA.getTime();
}

/**
 * Sort content alphabetically by title
 */
export function sortByTitle(a: ParsedContent, b: ParsedContent): number {
  const getTitleForSort = (content: ParsedContent) => {
    const firstNodeId = Object.keys(content.graph.nodes)[0];
    return content.frontmatter.title || 
           (firstNodeId ? content.graph.nodes[firstNodeId]?.attributes?.title : undefined) ||
           content.slug;
  };

  return getTitleForSort(a).localeCompare(getTitleForSort(b));
}

/**
 * Filter content by category
 */
export function filterByCategory(category: string) {
  return (content: ParsedContent) => content.frontmatter.category === category;
}

/**
 * Filter content by tag
 */
export function filterByTag(tag: string) {
  return (content: ParsedContent) => {
    const tags = content.frontmatter.tags;
    return Array.isArray(tags) && tags.includes(tag);
  };
}

/**
 * Filter published content only
 */
export function filterPublished(content: ParsedContent): boolean {
  return content.frontmatter.draft !== true && content.frontmatter.published !== false;
}

/**
 * Get unique categories from content array
 */
export function getCategories(content: ParsedContent[]): string[] {
  const categories = new Set<string>();
  content.forEach(item => {
    if (item.frontmatter.category) {
      categories.add(item.frontmatter.category);
    }
  });
  return Array.from(categories).sort();
}

/**
 * Get unique tags from content array
 */
export function getTags(content: ParsedContent[]): string[] {
  const tags = new Set<string>();
  content.forEach(item => {
    if (Array.isArray(item.frontmatter.tags)) {
      item.frontmatter.tags.forEach((tag: string) => tags.add(tag));
    }
  });
  return Array.from(tags).sort();
}