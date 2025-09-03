/**
 * Core structural primitives for the Mycelia system
 * All user-facing tags map to these primitives
 */

export type NodePrimitive = 'Leaf' | 'Branch' | 'Trunk' | 'Link' | 'Meta';

/**
 * Base interface for all nodes in the Mycelia system
 */
export interface BaseNode {
  id: string;
  type: string;
  primitive: NodePrimitive;
  createdAt?: string;
  updatedAt?: string;
  source: SourceReference;
}

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
 * Leaf - Atomic value, no children (e.g. Song, Date, Number)
 */
export interface LeafNode extends BaseNode {
  primitive: 'Leaf';
  value?: string;
  attributes: Record<string, any>;
}

/**
 * Branch - Ordered or unordered collection of children (e.g. Project, Essay)
 */
export interface BranchNode extends BaseNode {
  primitive: 'Branch';
  title?: string;
  content?: string;
  children: string[]; // IDs of child nodes
  attributes: Record<string, any>;
}

/**
 * Trunk - Container that establishes scope/context (e.g. Document, Collection)
 */
export interface TrunkNode extends BaseNode {
  primitive: 'Trunk';
  title?: string;
  description?: string;
  children: string[]; // IDs of child nodes
  attributes: Record<string, any>;
}

/**
 * Link - Reference/pointer to another node
 */
export interface LinkNode extends BaseNode {
  primitive: 'Link';
  target: string; // ID of target node
  linkType: string; // Type of relationship
  attributes: Record<string, any>;
}

/**
 * Meta - Annotation about the parent node
 */
export interface MetaNode extends BaseNode {
  primitive: 'Meta';
  metaType: string; // e.g. 'tag', 'note', 'comment'
  value: string;
  target?: string; // ID of node this annotates
  attributes: Record<string, any>;
}

/**
 * Union type for all node types
 */
export type MyceliaNode = LeafNode | BranchNode | TrunkNode | LinkNode | MetaNode;