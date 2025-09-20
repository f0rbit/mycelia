/**
 * Simplified core primitives for the Mycelia system
 * Reduced from 6 to 3 types for clarity and maintainability
 */

export type NodePrimitive = 'Content' | 'Reference' | 'Meta';

/**
 * Source file reference for tracking where content originated
 */
export interface SourceReference {
  file: string;
  start?: Position;
  end?: Position;
}

export interface Position {
  line: number;
  column: number;
  offset?: number;
}

/**
 * Base interface for all nodes in the Mycelia system
 */
export interface BaseNode {
  id: string;
  type: string;
  primitive: NodePrimitive;
  created_at?: string;
  updated_at?: string;
  source: SourceReference;
}

/**
 * Content - Any content-bearing node (projects, essays, skills, etc.)
 * Replaces: Leaf, Branch, Trunk, List
 */
export interface ContentNode extends BaseNode {
  primitive: 'Content';
  title?: string;
  content?: string;
  value?: string; // For atomic values
  children: string[]; // IDs of child nodes
  attributes: Record<string, any>;
}

/**
 * Reference - Link/pointer to another node
 * Simplified from LinkNode
 */
export interface ReferenceNode extends BaseNode {
  primitive: 'Reference';
  target: string; // ID of target node
  link_type: string; // Type of relationship
  attributes: Record<string, any>;
}

/**
 * Meta - Annotation/tag about content
 * Tags, notes, comments, etc.
 */
export interface MetaNode extends BaseNode {
  primitive: 'Meta';
  meta_type: string; // e.g. 'tag', 'note', 'comment'
  value: string;
  target?: string; // ID of node this annotates
  attributes: Record<string, any>;
}

/**
 * Union type for all node types
 */
export type MyceliaNode = ContentNode | ReferenceNode | MetaNode;