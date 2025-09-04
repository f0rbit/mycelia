import type { ComponentRegistry } from '../shared/types';
import { DEFAULT_TAG_MAPPINGS } from '@mycelia/core';
import {
  LeafRenderer,
  BranchRenderer,
  TrunkRenderer,
  LinkRenderer,
  MetaRenderer,
} from './primitives/index';

/**
 * Create a component registry with default mappings
 */
export function createComponentRegistry(customComponents: Partial<ComponentRegistry> = {}): ComponentRegistry {
  // Start with primitive mappings
  const registry: ComponentRegistry = {
    'Leaf': LeafRenderer,
    'Branch': BranchRenderer,
    'Trunk': TrunkRenderer,
    'Link': LinkRenderer,
    'Meta': MetaRenderer,
  };

  // Add type-specific mappings based on the tag registry
  Object.entries(DEFAULT_TAG_MAPPINGS).forEach(([tagName, mapping]) => {
    const nodeType = tagName.toLowerCase();
    
    // If no custom component is provided for this type, use the primitive renderer
    if (!customComponents[nodeType]) {
      const primitiveComponent = registry[mapping.primitive];
      if (primitiveComponent) {
        registry[nodeType] = primitiveComponent;
      }
    }
  });

  // Add custom components (can override defaults)
  Object.assign(registry, customComponents);

  return registry;
}

/**
 * Default component registry with all standard mappings
 */
export const DEFAULT_COMPONENT_REGISTRY = createComponentRegistry();

/**
 * Individual component exports for custom usage
 */
export const Components = {
  // Primitives
  Leaf: LeafRenderer,
  Branch: BranchRenderer,
  Trunk: TrunkRenderer,
  Link: LinkRenderer,
  Meta: MetaRenderer,

  // Common type aliases
  Project: BranchRenderer,
  Essay: BranchRenderer,
  Research: BranchRenderer,
  Task: LeafRenderer,
  Person: LeafRenderer,
  Song: LeafRenderer,
  Track: LeafRenderer,
  Note: LeafRenderer,
  Book: LeafRenderer,
  Film: LeafRenderer,
  Tag: MetaRenderer,
  Date: MetaRenderer,
  Status: MetaRenderer,
  Ref: LinkRenderer,
  Collaborator: LinkRenderer,
};

/**
 * Register a custom component for a node type
 */
export function registerComponent(
  registry: ComponentRegistry, 
  nodeType: string, 
  component: React.ComponentType<any>
): void {
  registry[nodeType] = component;
}

/**
 * Get component for a node type from registry
 */
export function getComponent(registry: ComponentRegistry, nodeType: string): React.ComponentType<any> | undefined {
  return registry[nodeType];
}