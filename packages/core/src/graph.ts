import type { MyceliaNode } from './primitives.js';

/**
 * Edge representing a relationship between two nodes
 * 
 * @example
 * ```typescript
 * const edge: MyceliaEdge = {
 *   id: 'project-contains-task-1',
 *   from: 'my-project',
 *   to: 'task-1',
 *   type: 'contains'
 * }
 * ```
 */
export interface MyceliaEdge {
  /** Unique identifier for this edge (typically "{from}-{type}-{to}") */
  id: string;
  /** Source node ID */
  from: string;
  /** Target node ID */
  to: string;
  /** Type of relationship */
  type: EdgeType;
  /** Optional attributes for the edge (e.g., weight, metadata) */
  attributes?: Record<string, any>;
}

/**
 * Standard edge types for relationships
 */
export type EdgeType = 
  | 'contains'      // Parent contains child (project -> leaf)
  | 'references'    // Node references another node
  | 'mentions'      // Node mentions another (leaf -> person/concept)
  | 'collaborates'  // Bidirectional collaboration
  | 'derives'       // Time inheritance, aggregated data
  | 'tags'          // Node is tagged with meta
  | 'custom';       // User-defined edge type

/**
 * Complete knowledge graph representation
 * 
 * This is the primary output format of the @mycelia/parser package.
 * 
 * @example
 * ```typescript
 * const graph: MyceliaGraph = {
 *   nodes: {
 *     'project-1': { id: 'project-1', type: 'project', ... },
 *     'task-1': { id: 'task-1', type: 'task', ... }
 *   },
 *   edges: [
 *     { id: 'edge-1', from: 'project-1', to: 'task-1', type: 'contains' }
 *   ],
 *   indexes: { byType: { project: ['project-1'], task: ['task-1'] }, ... },
 *   meta: { generatedAt: '2024-11-29T...', ... }
 * }
 * ```
 */
export interface MyceliaGraph {
  /** All nodes indexed by their ID */
  nodes: Record<string, MyceliaNode>;
  /** All edges/relationships between nodes */
  edges: MyceliaEdge[];
  /** Pre-computed indexes for fast queries */
  indexes: GraphIndexes;
  /** Metadata about the graph generation */
  meta: GraphMetadata;
}

/**
 * Pre-computed indexes for fast lookups and queries
 */
export interface GraphIndexes {
  /** Index of node IDs grouped by type (e.g., 'project' -> ['proj-1', 'proj-2']) */
  byType: Record<string, string[]>;
  /** Index of node IDs grouped by tag (e.g., 'typescript' -> ['proj-1', 'essay-1']) */
  byTag: Record<string, string[]>;
  /** Index of node IDs grouped by primitive (e.g., 'Content' -> [...]) */
  byPrimitive: Record<string, string[]>;
  /** Index of node IDs grouped by source file */
  bySource: Record<string, string[]>;
  /** Index of incoming edge IDs for each node */
  inbound: Record<string, string[]>;
  /** Index of outgoing edge IDs for each node */
  outbound: Record<string, string[]>;
}

/**
 * Graph metadata and statistics
 */
export interface GraphMetadata {
  /** ISO 8601 timestamp of when the graph was generated */
  generatedAt: string;
  /** Mycelia version that generated this graph */
  version: string;
  /** Number of source files parsed */
  files: number;
  /** List of source file paths */
  sources: string[];
  /** Statistics about the graph contents */
  stats: {
    /** Total number of nodes */
    nodeCount: number;
    /** Total number of edges */
    edgeCount: number;
    /** Count of nodes by type */
    typeBreakdown: Record<string, number>;
  };
}