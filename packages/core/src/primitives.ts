/**
 * Simplified core primitives for the Mycelia system
 * Reduced from 6 to 3 types for clarity and maintainability
 */

export type NodePrimitive = 'Content' | 'Reference' | 'Meta';

/**
 * Source file reference for tracking where content originated
 */
export interface SourceReference {
  /** Path to the source file (relative or absolute) */
  file: string;
  /** Starting position in the file */
  start?: Position;
  /** Ending position in the file */
  end?: Position;
}

/**
 * Position within a source file
 */
export interface Position {
  /** Line number (1-indexed) */
  line: number;
  /** Column number (1-indexed) */
  column: number;
  /** Character offset from start of file (0-indexed) */
  offset?: number;
}

/**
 * Base interface for all nodes in the Mycelia system
 */
export interface BaseNode {
  /** Unique identifier for this node (auto-generated or from id attribute) */
  id: string;
  /** Node type from the tag name (e.g., 'project', 'essay', 'person') */
  type: string;
  /** Primitive classification: Content, Reference, or Meta */
  primitive: NodePrimitive;
  /** ISO 8601 timestamp of when the node was created */
  created_at?: string;
  /** ISO 8601 timestamp of when the node was last updated */
  updated_at?: string;
  /** Source file location where this node was defined */
  source: SourceReference;
}

/**
 * Content node - Any content-bearing node (projects, essays, tasks, people, etc.)
 * 
 * @example
 * ```typescript
 * const project: ContentNode = {
 *   id: 'my-project',
 *   type: 'project',
 *   primitive: 'Content',
 *   title: 'My Project',
 *   content: 'Description of the project',
 *   children: ['task-1', 'task-2'],
 *   attributes: { status: 'active' },
 *   source: { file: 'content.mdx' }
 * }
 * ```
 */
export interface ContentNode extends BaseNode {
  primitive: 'Content';
  /** Human-readable title extracted from first line or title attribute */
  title?: string;
  /** Full text content excluding nested semantic tags */
  content?: string;
  /** Atomic value for simple content types (e.g., tag values, dates) */
  value?: string;
  /** IDs of direct child nodes in document hierarchy */
  children: string[];
  /** All MDX attributes preserved as key-value pairs */
  attributes: Record<string, any>;
}

/**
 * Reference node - Link/pointer to another node
 * 
 * @example
 * ```typescript
 * const link: ReferenceNode = {
 *   id: 'ref-1',
 *   type: 'link',
 *   primitive: 'Reference',
 *   target: 'other-node',
 *   link_type: 'citation',
 *   attributes: { page: 42 },
 *   source: { file: 'content.mdx' }
 * }
 * ```
 */
export interface ReferenceNode extends BaseNode {
  primitive: 'Reference';
  /** ID of the target node this references */
  target: string;
  /** Type of relationship (e.g., 'citation', 'see-also', 'requires') */
  link_type: string;
  /** Additional attributes for the reference */
  attributes: Record<string, any>;
}

/**
 * Meta node - Annotation/tag about content
 * 
 * @example
 * ```typescript
 * const tag: MetaNode = {
 *   id: 'tag-1',
 *   type: 'tag',
 *   primitive: 'Meta',
 *   meta_type: 'tag',
 *   value: 'typescript',
 *   target: 'my-project',
 *   attributes: {},
 *   source: { file: 'content.mdx' }
 * }
 * ```
 */
export interface MetaNode extends BaseNode {
  primitive: 'Meta';
  /** Type of metadata (e.g., 'tag', 'comment', 'annotation') */
  meta_type: string;
  /** The metadata value (e.g., tag name, comment text) */
  value: string;
  /** Optional ID of node this metadata annotates */
  target?: string;
  /** Additional attributes for the metadata */
  attributes: Record<string, any>;
}

/**
 * Union type for all node types
 */
export type MyceliaNode = ContentNode | ReferenceNode | MetaNode;