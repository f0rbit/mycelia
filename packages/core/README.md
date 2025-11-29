# @mycelia/core

Type-safe foundational types for building knowledge graphs from semantic content.

## What It Does

Defines the core data structures and primitives for the Mycelia knowledge graph system. Provides TypeScript interfaces for nodes, edges, graphs, and a tag registry system that maps user-facing tags to underlying primitives.

**Purpose:** Foundation layer for parser, renderer, and graph visualization  
**Exports:** Types, interfaces, registry utilities  
**Philosophy:** Simple primitives, powerful composition

## Why It Exists

Rather than creating custom node types for every use case (Project, Essay, Task, etc.), Mycelia uses **3 fundamental primitives** that cover all semantic content:

1. **Content** - Anything with substance (projects, essays, people, skills)
2. **Reference** - Links between content (citations, cross-references)
3. **Meta** - Annotations about content (tags, comments, notes)

This provides **maximum flexibility** with **minimal complexity**. User-facing tags (like `<Project>`, `<Essay>`) map to these primitives via the registry system.

## Features

- ✅ **3 Primitives** - Content, Reference, Meta cover all use cases
- ✅ **Type Safety** - Full TypeScript interfaces throughout
- ✅ **Graph Structure** - Nodes, edges, indexes, metadata
- ✅ **Tag Registry** - Extensible tag-to-primitive mappings
- ✅ **Source Tracking** - File/position metadata on every node
- ✅ **Performance Indexes** - Fast lookups by type, tag, primitive, source
- ✅ **Zero Dependencies** - Pure TypeScript types
- ✅ **Serializable** - Plain objects, works with JSON

## Installation

```bash
bun add @mycelia/core
```

Or with npm:

```bash
npm install @mycelia/core
```

## Quick Start

```typescript
import { ContentNode, MyceliaGraph, createRegistry } from '@mycelia/core';

// Create a content node
const project: ContentNode = {
  id: 'my-project',
  type: 'project',
  primitive: 'Content',
  title: 'My Project',
  content: 'A knowledge graph system for interconnected content.',
  children: ['task-1', 'task-2'],
  attributes: { 
    status: 'active',
    priority: 'high'
  },
  source: { file: 'content.mdx' },
  created_at: '2024-11-23T10:00:00.000Z'
};

// Use the tag registry
const registry = createRegistry();
console.log(registry['project']); // { primitive: 'Content' }

// Check what primitive a tag maps to
import { getTagMapping } from '@mycelia/core';
const mapping = getTagMapping(registry, 'project');
// → { primitive: 'Content' }
```

## Primitives Explained

### Content - Content-Bearing Nodes

**Purpose:** Represents anything with substance - text, data, or value

**Examples:**
- Projects, essays, articles, notes
- Tasks, todos, goals
- People, companies, organizations
- Skills, technologies, concepts
- Books, courses, resources
- Dates, events, achievements

**Fields:**
```typescript
interface ContentNode {
  id: string;                    // Unique identifier
  type: string;                  // User-facing type (project, essay, etc.)
  primitive: 'Content';          // Always 'Content'
  title?: string;                // Display title
  content?: string;              // Main text content
  value?: string;                // Atomic value (for simple nodes)
  children: string[];            // Child node IDs
  attributes: Record<string, any>; // Custom metadata
  source: SourceReference;       // File location
  created_at?: string;           // ISO timestamp
  updated_at?: string;           // ISO timestamp
}
```

**When to use:**
- Node has text, data, or value
- Node can contain children
- Node represents a "thing" in your knowledge graph

**Example:**
```typescript
const essay: ContentNode = {
  id: 'fp-benefits',
  type: 'essay',
  primitive: 'Content',
  title: 'Benefits of Functional Programming',
  content: 'Functional programming offers immutability, composability...',
  children: [],
  attributes: {
    published: true,
    tags: ['programming', 'fp']
  },
  source: { file: 'essays/fp.mdx', start: { line: 1, column: 0 } }
};
```

### Reference - Links Between Nodes

**Purpose:** Represents relationships and pointers to other nodes

**Examples:**
- Cross-references between documents
- Citations and bibliography entries
- External links with context
- Dependency relationships

**Fields:**
```typescript
interface ReferenceNode {
  id: string;                    // Unique identifier
  type: string;                  // User-facing type (link, reference)
  primitive: 'Reference';        // Always 'Reference'
  target: string;                // Target node ID
  link_type: string;             // Relationship type
  attributes: Record<string, any>; // Custom metadata
  source: SourceReference;       // File location
}
```

**When to use:**
- Creating explicit named relationships
- Linking to external content
- Building citation graphs

**Example:**
```typescript
const citation: ReferenceNode = {
  id: 'ref-fp-paper',
  type: 'reference',
  primitive: 'Reference',
  target: 'external-paper-123',
  link_type: 'citation',
  attributes: {
    title: 'Why Functional Programming Matters',
    author: 'John Hughes',
    year: 1990
  },
  source: { file: 'essays/fp.mdx', start: { line: 45, column: 0 } }
};
```

### Meta - Annotations About Content

**Purpose:** Metadata, tags, and annotations that describe other content

**Examples:**
- Tags and categories
- Comments and notes
- Labels and markers
- Status indicators

**Fields:**
```typescript
interface MetaNode {
  id: string;                    // Unique identifier
  type: string;                  // User-facing type (tag, comment)
  primitive: 'Meta';             // Always 'Meta'
  meta_type: string;             // Subtype (tag, note, comment)
  value: string;                 // The annotation text/value
  target?: string;               // Node this annotates (optional)
  attributes: Record<string, any>; // Custom metadata
  source: SourceReference;       // File location
}
```

**When to use:**
- Adding metadata to existing nodes
- Creating tagging systems
- Annotating content with comments

**Example:**
```typescript
const tag: MetaNode = {
  id: 'tag-featured',
  type: 'tag',
  primitive: 'Meta',
  meta_type: 'category',
  value: 'featured',
  target: 'fp-benefits',
  attributes: {
    color: 'blue',
    priority: 1
  },
  source: { file: 'essays/fp.mdx', start: { line: 60, column: 0 } }
};
```

## Graph Structure

The `MyceliaGraph` interface represents a complete knowledge graph:

```typescript
interface MyceliaGraph {
  nodes: Record<string, MyceliaNode>;  // All nodes by ID
  edges: MyceliaEdge[];                // All relationships
  indexes: GraphIndexes;               // Performance indexes
  meta: GraphMetadata;                 // Graph statistics
}
```

### Accessing Nodes

Nodes are stored as a record (object) for O(1) lookups:

```typescript
const graph: MyceliaGraph = { /* ... */ };

// Get node by ID
const project = graph.nodes['my-project'];

// Get all nodes of a type
const projects = graph.indexes.byType['project']
  .map(id => graph.nodes[id]);

// Get all Content nodes
const content_nodes = graph.indexes.byPrimitive['Content']
  .map(id => graph.nodes[id]);
```

### Traversing Edges

Edges represent relationships between nodes:

```typescript
interface MyceliaEdge {
  id: string;         // Unique edge identifier
  from: string;       // Source node ID
  to: string;         // Target node ID
  type: EdgeType;     // Relationship type
  attributes?: Record<string, any>; // Optional metadata
}
```

**Example:**
```typescript
// Get all edges from a node
const outgoing_edges = graph.indexes.outbound['my-project']
  .map(edge_id => graph.edges.find(e => e.id === edge_id));

// Get all edges to a node
const incoming_edges = graph.indexes.inbound['my-project']
  .map(edge_id => graph.edges.find(e => e.id === edge_id));

// Find children of a node
const children = graph.edges
  .filter(e => e.from === 'my-project' && e.type === 'contains')
  .map(e => graph.nodes[e.to]);
```

### Using Indexes

Indexes enable fast queries without scanning all nodes:

```typescript
interface GraphIndexes {
  byType: Record<string, string[]>;      // Type → node IDs
  byTag: Record<string, string[]>;       // Tag → node IDs  
  byPrimitive: Record<string, string[]>; // Primitive → node IDs
  bySource: Record<string, string[]>;    // Source file → node IDs
  inbound: Record<string, string[]>;     // Node → incoming edge IDs
  outbound: Record<string, string[]>;    // Node → outgoing edge IDs
}
```

**Example:**
```typescript
// Find all projects
const project_ids = graph.indexes.byType['project'];
const projects = project_ids.map(id => graph.nodes[id]);

// Find all nodes from a file
const file_nodes = graph.indexes.bySource['content.mdx']
  .map(id => graph.nodes[id]);

// Find all Reference nodes
const references = graph.indexes.byPrimitive['Reference']
  .map(id => graph.nodes[id]);
```

### Reading Metadata

Graph metadata provides statistics and provenance:

```typescript
interface GraphMetadata {
  generatedAt: string;          // ISO timestamp
  version: string;              // Parser version
  files: number;                // Number of source files
  sources: string[];            // List of source files
  stats: {
    nodeCount: number;          // Total nodes
    edgeCount: number;          // Total edges
    typeBreakdown: Record<string, number>; // Count by type
  };
}
```

**Example:**
```typescript
console.log(`Graph generated at: ${graph.meta.generatedAt}`);
console.log(`Total nodes: ${graph.meta.stats.nodeCount}`);
console.log(`Total edges: ${graph.meta.stats.edgeCount}`);
console.log(`Projects: ${graph.meta.stats.typeBreakdown['project']}`);
```

## Type Definitions

### Base Interfaces

```typescript
// Source file reference
interface SourceReference {
  file: string;
  start?: Position;
  end?: Position;
}

interface Position {
  line: number;
  column: number;
  offset?: number;
}

// Base node interface
interface BaseNode {
  id: string;
  type: string;
  primitive: NodePrimitive;
  created_at?: string;
  updated_at?: string;
  source: SourceReference;
}
```

### Node Union Type

```typescript
type MyceliaNode = ContentNode | ReferenceNode | MetaNode;
```

This union type enables type-safe discrimination:

```typescript
function process(node: MyceliaNode) {
  if (node.primitive === 'Content') {
    console.log(node.title); // TypeScript knows this is ContentNode
  } else if (node.primitive === 'Reference') {
    console.log(node.target); // TypeScript knows this is ReferenceNode
  } else {
    console.log(node.value); // TypeScript knows this is MetaNode
  }
}
```

## Registry System

The tag registry maps user-facing tags to primitives and validation logic.

### Default Registry

```typescript
import { createRegistry } from '@mycelia/core';

const registry = createRegistry();

// Contains default mappings:
registry['project']  // → { primitive: 'Content' }
registry['essay']    // → { primitive: 'Content' }
registry['task']     // → { primitive: 'Content' }
registry['link']     // → { primitive: 'Reference' }
registry['tag']      // → { primitive: 'Meta' }
// ... 20+ more default tags
```

### Default Tag Mappings

The core package includes these default mappings:

**Content types:**
`skill`, `project`, `essay`, `task`, `note`, `article`, `section`, `portfolio`, `collection`, `document`, `reading-list`, `playlist`, `resources`, `person`, `book`, `course`, `company`, `date`, `song`, `research`, `achievement`, `collaborator`

**Reference types:**
`link`, `reference`

**Meta types:**
`tag`, `meta`, `comment`, `annotation`

### Custom Tag Mappings

Extend the registry with custom tags:

```typescript
import { createRegistry, registerTag } from '@mycelia/core';

const registry = createRegistry();

// Add a custom tag
registerTag(registry, 'recipe', {
  primitive: 'Content',
  attributes: { cuisine: 'unknown' }, // Default attributes
  validate: (attrs) => {
    // Validation function (optional)
    return attrs.servings > 0 && attrs.servings < 100;
  },
  transform: (attrs) => {
    // Transform function (optional)
    return {
      ...attrs,
      servings: parseInt(attrs.servings, 10)
    };
  }
});

// Use the new tag
const mapping = registry['recipe'];
// → { primitive: 'Content', attributes: { cuisine: 'unknown' }, validate: fn, transform: fn }
```

### Tag Mapping Interface

```typescript
interface TagMapping {
  primitive: NodePrimitive;                          // Which primitive to use
  attributes?: Record<string, any>;                  // Default attributes
  validate?: (attributes: Record<string, any>) => boolean;  // Validation
  transform?: (attributes: Record<string, any>) => Record<string, any>; // Transform
}
```

**Use cases:**
- **validate**: Ensure required fields exist, check value ranges
- **transform**: Normalize data, parse numbers, format strings
- **attributes**: Provide sensible defaults for new nodes

## Edge Types

Mycelia defines 7 standard edge types for relationships:

### 1. contains
**Parent-child hierarchical relationships**

```typescript
{ from: 'project', to: 'task', type: 'contains' }
```

Used for: Nested content structures, parent nodes containing children

### 2. references
**Cross-references between nodes**

```typescript
{ from: 'essay', to: 'project', type: 'references' }
```

Used for: Linking related content, see-also relationships

### 3. mentions
**Lightweight citations**

```typescript
{ from: 'essay', to: 'person', type: 'mentions' }
```

Used for: Name-dropping, lightweight references without formal citation

### 4. collaborates
**Bidirectional collaboration**

```typescript
{ from: 'person-1', to: 'person-2', type: 'collaborates' }
```

Used for: Symmetric relationships, partnerships

### 5. derives
**Inheritance and aggregation**

```typescript
{ from: 'summary', to: 'article', type: 'derives' }
```

Used for: Time-based inheritance, rollup data, computed content

### 6. tags
**Tagging relationships**

```typescript
{ from: 'project', to: 'tag-featured', type: 'tags' }
```

Used for: Connecting content to meta nodes, categorization

### 7. custom
**User-defined edge types**

```typescript
{ from: 'a', to: 'b', type: 'custom', attributes: { relation: 'depends-on' } }
```

Used for: Domain-specific relationships not covered by standard types

## API Reference

### Exported Types

```typescript
// Primitives
export type NodePrimitive = 'Content' | 'Reference' | 'Meta';

// Node interfaces
export type MyceliaNode = ContentNode | ReferenceNode | MetaNode;
export interface ContentNode { /* ... */ }
export interface ReferenceNode { /* ... */ }
export interface MetaNode { /* ... */ }
export interface BaseNode { /* ... */ }

// Graph structures
export interface MyceliaGraph { /* ... */ }
export interface MyceliaEdge { /* ... */ }
export interface GraphIndexes { /* ... */ }
export interface GraphMetadata { /* ... */ }

// Edge types
export type EdgeType = 'contains' | 'references' | 'mentions' 
  | 'collaborates' | 'derives' | 'tags' | 'custom';

// Registry
export interface TagRegistry { /* ... */ }
export interface TagMapping { /* ... */ }

// Source tracking
export interface SourceReference { /* ... */ }
export interface Position { /* ... */ }
```

### Exported Functions

```typescript
// Registry utilities
export function createRegistry(): TagRegistry;
export function registerTag(registry: TagRegistry, tag_name: string, mapping: TagMapping): void;
export function getTagMapping(registry: TagRegistry, tag_name: string): TagMapping | undefined;

// Constants
export const DEFAULT_TAG_MAPPINGS: TagRegistry;
```

## Architecture & Philosophy

### Why 3 Primitives?

**Simplicity:** Easier to understand, document, and maintain than 10+ node types

**Flexibility:** User-facing tags provide specificity, primitives provide structure

**Extensibility:** Add new tags without changing core types

**Interoperability:** All tools work with 3 primitives, not dozens of types

### Why Record<string, MyceliaNode> Instead of Map?

**Serialization:** Plain objects serialize to/from JSON trivially

**Performance:** Object property access is highly optimized in JS engines

**Compatibility:** Works with JSON.stringify/parse without conversion

**Developer Experience:** Easier to inspect in console/debugger

### Why Indexes?

**Performance:** Avoid O(n) scans for common queries

**Convenience:** Pre-computed lookups for type, tag, source, edges

**Scalability:** Efficient even with thousands of nodes

Without indexes, finding "all projects" requires scanning every node. With indexes, it's a single lookup:

```typescript
// Without indexes - O(n)
const projects = Object.values(graph.nodes)
  .filter(n => n.type === 'project');

// With indexes - O(1) lookup + O(k) mapping
const projects = graph.indexes.byType['project']
  .map(id => graph.nodes[id]);
```

### Extensibility Through Attributes

Rather than adding fields to node types, use the `attributes` object:

```typescript
// ❌ Bad - requires changing core types
interface ProjectNode extends ContentNode {
  status: string;
  deadline: string;
}

// ✅ Good - uses attributes
const project: ContentNode = {
  // ... base fields
  attributes: {
    status: 'active',
    deadline: '2024-12-31'
  }
};
```

This allows unlimited customization without modifying core types.

## Usage in Mycelia Ecosystem

### @mycelia/parser

The parser generates `MyceliaGraph` objects from MDX:

```typescript
import { parse } from '@mycelia/parser';
import type { MyceliaGraph } from '@mycelia/core';

const result = await parse(['content/**/*.mdx']);
const graph: MyceliaGraph = result.graph;
```

### @mycelia/render

The renderer consumes graph nodes and renders them:

```typescript
import { RenderableTreeRenderer } from '@mycelia/render';
import type { ContentNode } from '@mycelia/core';

function MyComponent({ node }: { node: ContentNode }) {
  return <RenderableTreeRenderer node={node} />;
}
```

### @mycelia/graph

The graph visualizer displays nodes and edges:

```typescript
import { MyceliaGraphViewer } from '@mycelia/graph';
import type { MyceliaGraph } from '@mycelia/core';

<MyceliaGraphViewer graph={graph} />
```

All packages share the same core types, ensuring compatibility.

## Examples

### Building a Simple Graph

```typescript
import type { MyceliaGraph, ContentNode, MyceliaEdge } from '@mycelia/core';

const nodes: Record<string, ContentNode> = {
  'root': {
    id: 'root',
    type: 'portfolio',
    primitive: 'Content',
    title: 'My Portfolio',
    content: '',
    children: ['project-1', 'project-2'],
    attributes: {},
    source: { file: 'index.mdx' }
  },
  'project-1': {
    id: 'project-1',
    type: 'project',
    primitive: 'Content',
    title: 'Mycelia',
    content: 'A knowledge graph system',
    children: [],
    attributes: { status: 'active' },
    source: { file: 'index.mdx' }
  }
};

const edges: MyceliaEdge[] = [
  { id: 'root-contains-project-1', from: 'root', to: 'project-1', type: 'contains' }
];

const graph: MyceliaGraph = {
  nodes,
  edges,
  indexes: {
    byType: { 'portfolio': ['root'], 'project': ['project-1'] },
    byTag: {},
    byPrimitive: { 'Content': ['root', 'project-1'] },
    bySource: { 'index.mdx': ['root', 'project-1'] },
    inbound: { 'project-1': ['root-contains-project-1'] },
    outbound: { 'root': ['root-contains-project-1'] }
  },
  meta: {
    generatedAt: new Date().toISOString(),
    version: '0.1.0',
    files: 1,
    sources: ['index.mdx'],
    stats: { nodeCount: 2, edgeCount: 1, typeBreakdown: { portfolio: 1, project: 1 } }
  }
};
```

### Custom Registry

```typescript
import { createRegistry, registerTag } from '@mycelia/core';

const registry = createRegistry();

// Add custom tags with validation
registerTag(registry, 'workout', {
  primitive: 'Content',
  attributes: { 
    duration: 0,
    intensity: 'medium'
  },
  validate: (attrs) => {
    return attrs.duration > 0 && attrs.duration < 300;
  },
  transform: (attrs) => ({
    ...attrs,
    duration: parseInt(attrs.duration, 10),
    intensity: attrs.intensity.toLowerCase()
  })
});

// Use in parser
import { parse } from '@mycelia/parser';
const result = await parse(['workouts/**/*.mdx'], { registry });
```

## Future Enhancements

### Type Guards and Utilities

```typescript
// Type guard functions
export function isContentNode(node: MyceliaNode): node is ContentNode {
  return node.primitive === 'Content';
}

export function isReferenceNode(node: MyceliaNode): node is ReferenceNode {
  return node.primitive === 'Reference';
}

// Node creation utilities
export function createContentNode(props: Partial<ContentNode>): ContentNode {
  return { primitive: 'Content', children: [], attributes: {}, ...props };
}
```

### Graph Validation

```typescript
export function validateGraph(graph: MyceliaGraph): ValidationResult {
  // Check for orphaned edges, missing nodes, circular references
  // Return errors/warnings
}
```

### Schema Validation with Zod

```typescript
import { z } from 'zod';

export const ContentNodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  primitive: z.literal('Content'),
  title: z.string().optional(),
  // ... rest of schema
});
```

### Performance Optimizations

- Lazy index generation for large graphs
- Streaming graph construction
- Memory-efficient node storage for massive graphs

---

**License:** MIT  
**Author:** Tom  
**Version:** 0.1.0  
**Repository:** [mycelia](https://github.com/yourusername/mycelia)
