import type { RenderableNode, RenderableTree } from '@mycelia/core';
import type { ComponentRegistry } from '../shared/types';
import { useRegistry } from '../shared/context';
import {
  LeafRenderer,
  BranchRenderer,
  TrunkRenderer,
  LinkRenderer,
  MetaRenderer,
} from './primitives/index';

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
 * Default component registry mapping primitives to renderers
 */
export const DEFAULT_PRIMITIVE_REGISTRY: ComponentRegistry = {
  'Leaf': LeafRenderer,
  'Branch': BranchRenderer,
  'Trunk': TrunkRenderer,
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
      
      {/* Tree metadata (optional debug info) */}
      {tree.meta.unresolvedRefs.length > 0 && (
        <div className="mycelia-tree__warnings" style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#92400e' }}>
            ⚠️ Unresolved References
          </h4>
          <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
            {tree.meta.unresolvedRefs.map((ref, index) => (
              <li key={index} style={{ color: '#92400e' }}>
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
    // Fallback renderer for unknown primitives
    return (
      <div 
        className={`mycelia-unknown ${className}`}
        style={{
          padding: '0.5rem',
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '0.25rem',
          fontSize: '0.875rem',
          color: '#991b1b',
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