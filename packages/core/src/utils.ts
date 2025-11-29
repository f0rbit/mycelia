import type { MyceliaNode, ContentNode, ReferenceNode, MetaNode, SourceReference } from './primitives.js';
import type { MyceliaGraph, MyceliaEdge, GraphIndexes } from './graph.js';
import type { TagRegistry, TagMapping } from './registry.js';

/**
 * Type guard to check if a node is a ContentNode
 */
export function isContentNode(node: MyceliaNode): node is ContentNode {
  return node.primitive === 'Content';
}

/**
 * Type guard to check if a node is a ReferenceNode
 */
export function isReferenceNode(node: MyceliaNode): node is ReferenceNode {
  return node.primitive === 'Reference';
}

/**
 * Type guard to check if a node is a MetaNode
 */
export function isMetaNode(node: MyceliaNode): node is MetaNode {
  return node.primitive === 'Meta';
}

/**
 * Create a ContentNode with defaults
 */
export function createContentNode(params: {
  id: string;
  type: string;
  source: SourceReference;
  title?: string;
  content?: string;
  value?: string;
  children?: string[];
  attributes?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}): ContentNode {
  return {
    primitive: 'Content',
    children: [],
    attributes: {},
    ...params,
  };
}

/**
 * Create a ReferenceNode with defaults
 */
export function createReferenceNode(params: {
  id: string;
  type: string;
  source: SourceReference;
  target: string;
  link_type: string;
  attributes?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}): ReferenceNode {
  return {
    primitive: 'Reference',
    attributes: {},
    ...params,
  };
}

/**
 * Create a MetaNode with defaults
 */
export function createMetaNode(params: {
  id: string;
  type: string;
  source: SourceReference;
  meta_type: string;
  value: string;
  target?: string;
  attributes?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}): MetaNode {
  return {
    primitive: 'Meta',
    attributes: {},
    ...params,
  };
}

/**
 * Create an empty graph with initialized structures
 */
export function createEmptyGraph(version: string = '0.1.0'): MyceliaGraph {
  return {
    nodes: {},
    edges: [],
    indexes: {
      byType: {},
      byTag: {},
      byPrimitive: {},
      bySource: {},
      inbound: {},
      outbound: {},
    },
    meta: {
      generatedAt: new Date().toISOString(),
      version,
      files: 0,
      sources: [],
      stats: {
        nodeCount: 0,
        edgeCount: 0,
        typeBreakdown: {},
      },
    },
  };
}

/**
 * Validation result for graph structure
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate graph structure (pure - returns result)
 */
export function validateGraph(graph: MyceliaGraph): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for broken edge references
  for (const edge of graph.edges) {
    if (!graph.nodes[edge.from]) {
      errors.push(`Edge "${edge.id}" references missing source node "${edge.from}"`);
    }
    if (!graph.nodes[edge.to]) {
      errors.push(`Edge "${edge.id}" references missing target node "${edge.to}"`);
    }
  }

  // Check for orphaned index entries
  for (const [type, nodeIds] of Object.entries(graph.indexes.byType)) {
    for (const nodeId of nodeIds) {
      if (!graph.nodes[nodeId]) {
        warnings.push(`Index byType["${type}"] references missing node "${nodeId}"`);
      }
    }
  }

  // Validate stats match actual data
  const actualNodeCount = Object.keys(graph.nodes).length;
  if (graph.meta.stats.nodeCount !== actualNodeCount) {
    warnings.push(`Metadata nodeCount (${graph.meta.stats.nodeCount}) doesn't match actual (${actualNodeCount})`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Merge two graphs (pure - returns new graph)
 */
export function mergeGraphs(g1: MyceliaGraph, g2: MyceliaGraph): MyceliaGraph {
  // Combine nodes (g2 overwrites g1 on conflicts)
  const nodes = { ...g1.nodes, ...g2.nodes };

  // Combine edges and deduplicate by ID
  const edgeMap = new Map<string, MyceliaEdge>();
  for (const edge of [...g1.edges, ...g2.edges]) {
    edgeMap.set(edge.id, edge);
  }
  const edges = Array.from(edgeMap.values());

  // Rebuild indexes from scratch
  const indexes = rebuildIndexes(nodes, edges);

  // Combine sources
  const sources = Array.from(new Set([...g1.meta.sources, ...g2.meta.sources]));

  // Recalculate stats
  const typeBreakdown: Record<string, number> = {};
  for (const node of Object.values(nodes)) {
    typeBreakdown[node.type] = (typeBreakdown[node.type] || 0) + 1;
  }

  return {
    nodes,
    edges,
    indexes,
    meta: {
      generatedAt: new Date().toISOString(),
      version: g1.meta.version,
      files: g1.meta.files + g2.meta.files,
      sources,
      stats: {
        nodeCount: Object.keys(nodes).length,
        edgeCount: edges.length,
        typeBreakdown,
      },
    },
  };
}

/**
 * Rebuild all indexes from nodes and edges
 */
function rebuildIndexes(nodes: Record<string, MyceliaNode>, edges: MyceliaEdge[]): GraphIndexes {
  const indexes: GraphIndexes = {
    byType: {},
    byTag: {},
    byPrimitive: {},
    bySource: {},
    inbound: {},
    outbound: {},
  };

  // Index nodes
  for (const [id, node] of Object.entries(nodes)) {
    // byType
    if (!indexes.byType[node.type]) indexes.byType[node.type] = [];
    indexes.byType[node.type].push(id);

    // byPrimitive
    if (!indexes.byPrimitive[node.primitive]) indexes.byPrimitive[node.primitive] = [];
    indexes.byPrimitive[node.primitive].push(id);

    // bySource
    if (!indexes.bySource[node.source.file]) indexes.bySource[node.source.file] = [];
    indexes.bySource[node.source.file].push(id);

    // byTag (for meta nodes)
    if (isMetaNode(node) && node.meta_type === 'tag') {
      if (!indexes.byTag[node.value]) indexes.byTag[node.value] = [];
      if (node.target) indexes.byTag[node.value].push(node.target);
    }
  }

  // Index edges
  for (const edge of edges) {
    // inbound
    if (!indexes.inbound[edge.to]) indexes.inbound[edge.to] = [];
    indexes.inbound[edge.to].push(edge.id);

    // outbound
    if (!indexes.outbound[edge.from]) indexes.outbound[edge.from] = [];
    indexes.outbound[edge.from].push(edge.id);
  }

  return indexes;
}

/**
 * Create a new registry with an additional tag (immutable)
 */
export function withTag(
  registry: TagRegistry,
  tagName: string,
  mapping: TagMapping
): TagRegistry {
  return { ...registry, [tagName]: mapping };
}

/**
 * Create a new registry with multiple tags (immutable)
 */
export function withTags(
  registry: TagRegistry,
  tags: Record<string, TagMapping>
): TagRegistry {
  return { ...registry, ...tags };
}
