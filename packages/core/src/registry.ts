import type { NodePrimitive } from './primitives.js';

/**
 * Configuration for mapping user tags to primitives
 */
export interface TagMapping {
  primitive: NodePrimitive;
  defaultProps?: Record<string, any>;
  validator?: (props: Record<string, any>) => boolean;
  description?: string;
}

/**
 * Registry for custom tag mappings
 */
export interface TagRegistry {
  [tagName: string]: TagMapping;
}

/**
 * Default tag mappings for common content types
 */
export const DEFAULT_TAG_MAPPINGS: TagRegistry = {
  // Project management
  'Project': { primitive: 'Branch', defaultProps: { type: 'project' } },
  'Task': { primitive: 'Leaf', defaultProps: { type: 'task' } },
  
  // Content types
  'Essay': { primitive: 'Branch', defaultProps: { type: 'essay' } },
  'Research': { primitive: 'Branch', defaultProps: { type: 'research' } },
  'Note': { primitive: 'Leaf', defaultProps: { type: 'note' } },
  'Log': { primitive: 'Leaf', defaultProps: { type: 'log' } },
  
  // Media
  'Song': { primitive: 'Leaf', defaultProps: { type: 'song' } },
  'Track': { primitive: 'Leaf', defaultProps: { type: 'track' } },
  'Book': { primitive: 'Leaf', defaultProps: { type: 'book' } },
  'Film': { primitive: 'Leaf', defaultProps: { type: 'film' } },
  
  // People and relationships
  'Person': { primitive: 'Leaf', defaultProps: { type: 'person' } },
  'Collaborator': { primitive: 'Link', defaultProps: { linkType: 'collaborates' } },
  
  // Metadata
  'Tag': { primitive: 'Meta', defaultProps: { metaType: 'tag' } },
  'Date': { primitive: 'Meta', defaultProps: { metaType: 'date' } },
  'Status': { primitive: 'Meta', defaultProps: { metaType: 'status' } },
  
  // References
  'Ref': { primitive: 'Link', defaultProps: { linkType: 'references' } },
  'Link': { primitive: 'Link', defaultProps: { linkType: 'references' } },
};

/**
 * Create a new tag registry with default mappings
 */
export function createRegistry(customMappings?: TagRegistry): TagRegistry {
  return { ...DEFAULT_TAG_MAPPINGS, ...customMappings };
}

/**
 * Register a new tag mapping
 */
export function registerTag(
  registry: TagRegistry, 
  tagName: string, 
  mapping: TagMapping
): void {
  registry[tagName] = mapping;
}

/**
 * Get tag mapping or undefined if not found
 */
export function getTagMapping(
  registry: TagRegistry, 
  tagName: string
): TagMapping | undefined {
  return registry[tagName];
}