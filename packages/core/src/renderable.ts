import type { NodePrimitive } from './primitives.js';

/**
 * Renderable tree structure optimized for component rendering
 * This is the second output format from parsers
 */
export interface RenderableNode {
  id: string;
  type: string;
  primitive: NodePrimitive;
  props: Record<string, any>;
  children: RenderableNode[];
  content?: string;
  resolvedRefs: ResolvedReference[];
}

/**
 * Reference that has been resolved to include target data
 */
export interface ResolvedReference {
  id: string;
  type: string;
  primitive: NodePrimitive;
  title: string;
  url?: string;        // For deep linking
  preview?: string;    // Brief preview content
  exists: boolean;     // Whether target node exists
}

/**
 * Complete renderable tree with metadata
 */
export interface RenderableTree {
  root: RenderableNode;
  meta: {
    totalNodes: number;
    unresolvedRefs: UnresolvedReference[];
    warnings: string[];
  };
}

/**
 * Reference that couldn't be resolved
 */
export interface UnresolvedReference {
  sourceNodeId: string;
  targetId: string;
  reason: string;
}