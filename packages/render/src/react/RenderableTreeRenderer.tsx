'use client'

import type { RenderableNode, RenderableTree } from '@mycelia/core';
import type { ComponentRegistry } from '../shared/types';
import { useRegistry } from '../shared/context';
import {
  LinkRenderer,
  MetaRenderer,
} from './primitives/index';
import { MinimalLeafRenderer } from './primitives/MinimalLeafRenderer';
import { MinimalBranchRenderer } from './primitives/MinimalBranchRenderer';
import { MinimalTrunkRenderer } from './primitives/MinimalTrunkRenderer';

/**
 * Props for the renderable tree renderer
 */
export interface RenderableTreeRendererProps {
  tree: RenderableTree;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Props for individual node rendering
 */
export interface NodeRendererProps {
  node: RenderableNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Default component registry mapping primitives to minimal renderers
 */
export const DEFAULT_PRIMITIVE_REGISTRY: ComponentRegistry = {
  'Leaf': MinimalLeafRenderer,
  'Branch': MinimalBranchRenderer,
  'Trunk': MinimalTrunkRenderer,
  'Link': LinkRenderer,
  'Meta': MetaRenderer,
};

/**
 * Renders a complete renderable tree
 */
export function RenderableTreeRenderer({ 
  tree, 
  className = '', 
  style 
}: RenderableTreeRendererProps) {
  return (
    <div 
      className={`mycelia-tree ${className}`} 
      style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        lineHeight: 1.5,
        ...style
      }}
    >
      <NodeRenderer node={tree.root} />
      
      {/* Tree metadata - minimal warning display */}
      {tree.meta.unresolvedRefs.length > 0 && (
        <div 
          className="mycelia-tree__warnings" 
          style={{
            marginTop: '2rem',
            borderLeft: '4px solid #f59e0b',
            paddingLeft: '1rem',
            fontSize: '0.875rem',
          }}
        >
          <h4 style={{ 
            margin: '0 0 0.5rem 0', 
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#92400e' 
          }}>
            Unresolved References
          </h4>
          <ul style={{ 
            margin: 0, 
            paddingLeft: '1rem',
            listStyle: 'disc',
            color: '#6b7280'
          }}>
            {tree.meta.unresolvedRefs.map((ref, index) => (
              <li key={index}>
                {ref.sourceNodeId} → {ref.targetId}: {ref.reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Renders an individual node with its children
 */
export function NodeRenderer({ node, className = '', style }: NodeRendererProps) {
  const customRegistry = useRegistry();

  // Get the appropriate component for this node
  const getComponent = () => {
    // First check if there's a custom component for this specific type
    if (customRegistry[node.type]) {
      return customRegistry[node.type];
    }

    // Then check if there's a custom component for this primitive
    if (customRegistry[node.primitive]) {
      return customRegistry[node.primitive];
    }

    // Fall back to default primitive renderer
    return DEFAULT_PRIMITIVE_REGISTRY[node.primitive];
  };

  const Component = getComponent();

  if (!Component) {
    // Fallback renderer for unknown primitives - minimal style
    return (
      <div 
        className={`mycelia-unknown ${className}`}
        style={{
          borderLeft: '4px solid #dc2626',
          paddingLeft: '0.5rem',
          fontSize: '0.875rem',
          color: '#991b1b',
          marginBottom: '0.5rem',
          ...style,
        }}
      >
        Unknown primitive: {node.primitive} (type: {node.type})
      </div>
    );
  }

  // Render children recursively
  const childrenElements = node.children.map((child) => (
    <NodeRenderer key={child.id} node={child} />
  ));

  // For container types (Branch, Trunk), pass children as prop
  if (node.primitive === 'Branch' || node.primitive === 'Trunk') {
    // Cast to ContainerRenderProps component type
    const ContainerComponent = Component as React.ComponentType<any>;
    return (
      <ContainerComponent 
        node={node} 
        className={className} 
        style={style}
      >
        {childrenElements}
      </ContainerComponent>
    );
  }

  // For non-container types, render children after the component
  return (
    <>
      <Component node={node} className={className} style={style} />
      {childrenElements.length > 0 && (
        <div className="mycelia-node-children" style={{ marginLeft: '1rem' }}>
          {childrenElements}
        </div>
      )}
    </>
  );
}