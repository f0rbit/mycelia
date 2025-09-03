import type { MyceliaNode } from './primitives.js';

/**
 * Edge representing relationships between nodes
 */
export interface MyceliaEdge {
  id: string;
  from: string; // Source node ID
  to: string;   // Target node ID
  type: EdgeType;
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
 * Complete graph representation
 */
export interface MyceliaGraph {
  nodes: Record<string, MyceliaNode>;
  edges: MyceliaEdge[];
  indexes: GraphIndexes;
  meta: GraphMetadata;
}

/**
 * Indexes for fast lookups and queries
 */
export interface GraphIndexes {
  byType: Record<string, string[]>;      // Type -> node IDs
  byTag: Record<string, string[]>;       // Tag -> node IDs  
  byPrimitive: Record<string, string[]>; // Primitive -> node IDs
  bySource: Record<string, string[]>;    // Source file -> node IDs
  inbound: Record<string, string[]>;     // Node -> incoming edge IDs
  outbound: Record<string, string[]>;    // Node -> outgoing edge IDs
}

/**
 * Graph metadata and statistics
 */
export interface GraphMetadata {
  generatedAt: string;
  version: string;
  files: number;
  sources: string[];
  stats: {
    nodeCount: number;
    edgeCount: number;
    typeBreakdown: Record<string, number>;
  };
}