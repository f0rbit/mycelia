import type { NodePrimitive } from './primitives.js';

/**
 * Tag mapping configuration for a specific user-facing tag
 */
export interface TagMapping {
  /** Which primitive this tag maps to */
  primitive: NodePrimitive;
  /** Default attributes to apply to nodes of this type */
  attributes?: Record<string, any>;
  /** Optional validation function for tag attributes */
  validate?: (attributes: Record<string, any>) => boolean;
  /** Optional transformation function for attributes */
  transform?: (attributes: Record<string, any>) => Record<string, any>;
}

/**
 * Registry mapping user-facing tag names to their primitive types
 * 
 * @example
 * ```typescript
 * const registry: TagRegistry = {
 *   'project': { primitive: 'Content' },
 *   'link': { primitive: 'Reference' },
 *   'tag': { primitive: 'Meta' }
 * }
 * ```
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
 * Create a tag registry with default mappings
 * 
 * @returns A new registry object with all default tag mappings
 * 
 * @example
 * ```typescript
 * const registry = createRegistry()
 * console.log(registry['project']) // { primitive: 'Content' }
 * ```
 */
export function createRegistry(): TagRegistry {
  return { ...DEFAULT_TAG_MAPPINGS };
}

/**
 * Register a new tag mapping (mutates registry)
 * 
 * @param registry - The registry to modify
 * @param tag_name - The tag name to register
 * @param mapping - The tag mapping configuration
 * 
 * @example
 * ```typescript
 * const registry = createRegistry()
 * registerTag(registry, 'recipe', {
 *   primitive: 'Content',
 *   attributes: { cuisine: 'italian' },
 *   validate: (attrs) => typeof attrs.servings === 'number'
 * })
 * ```
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
 * 
 * @param registry - The registry to query
 * @param tag_name - The tag name to look up
 * @returns The tag mapping if found, undefined otherwise
 * 
 * @example
 * ```typescript
 * const registry = createRegistry()
 * const mapping = getTagMapping(registry, 'project')
 * if (mapping) {
 *   console.log(mapping.primitive) // 'Content'
 * }
 * ```
 */
export function getTagMapping(
  registry: TagRegistry, 
  tag_name: string
): TagMapping | undefined {
  return registry[tag_name];
}