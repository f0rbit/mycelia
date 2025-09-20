import type { NodePrimitive } from './primitives.js';

/**
 * Tag mapping configuration for a specific user-facing tag
 */
export interface TagMapping {
  primitive: NodePrimitive;
  attributes?: Record<string, any>;
  validate?: (attributes: Record<string, any>) => boolean;
  transform?: (attributes: Record<string, any>) => Record<string, any>;
}

/**
 * Registry of all user-facing tags mapped to their primitives
 */
export interface TagRegistry {
  [tagName: string]: TagMapping;
}

/**
 * Default tag mappings for simplified primitives
 */
export const DEFAULT_TAG_MAPPINGS: TagRegistry = {
  // Content types - all content-bearing nodes
  'skill': { primitive: 'Content' },
  'project': { primitive: 'Content' },
  'essay': { primitive: 'Content' },
  'task': { primitive: 'Content' },
  'note': { primitive: 'Content' },
  'article': { primitive: 'Content' },
  'section': { primitive: 'Content' },
  'portfolio': { primitive: 'Content' },
  'collection': { primitive: 'Content' },
  'document': { primitive: 'Content' },
  'reading-list': { primitive: 'Content' },
  'playlist': { primitive: 'Content' },
  'resources': { primitive: 'Content' },
  'person': { primitive: 'Content' },
  'book': { primitive: 'Content' },
  'course': { primitive: 'Content' },
  'company': { primitive: 'Content' },
  'date': { primitive: 'Content' },
  'song': { primitive: 'Content' },
  'research': { primitive: 'Content' },
  'achievement': { primitive: 'Content' },
  'collaborator': { primitive: 'Content' },
  
  // Reference types - links between content
  'link': { primitive: 'Reference' },
  'reference': { primitive: 'Reference' },
  
  // Meta types - annotations and tags
  'tag': { primitive: 'Meta' },
  'meta': { primitive: 'Meta' },
  'comment': { primitive: 'Meta' },
  'annotation': { primitive: 'Meta' },
};

/**
 * Create the default tag registry with simplified primitive mappings
 * Most content types map to 'Content' primitive
 */
export function createRegistry(): TagRegistry {
  return { ...DEFAULT_TAG_MAPPINGS };
}

/**
 * Register a new tag mapping
 */
export function registerTag(
  registry: TagRegistry, 
  tag_name: string, 
  mapping: TagMapping
): void {
  registry[tag_name] = mapping;
}

/**
 * Get tag mapping or undefined if not found
 */
export function getTagMapping(
  registry: TagRegistry, 
  tag_name: string
): TagMapping | undefined {
  return registry[tag_name];
}