# @mycelia/parser

Pure functional parser for converting semantic MDX documents into knowledge graphs.

## What It Does

Transforms MDX files with semantic tags into a structured graph representation with nodes, edges, and indexes. Built for digital gardens, knowledge bases, and interconnected content systems.

**Input:** MDX files with semantic tags  
**Output:** JSON graph with nodes, edges, indexes, and metadata

## Example

### Input (MDX)

```mdx
<Person id="alice" role="developer">
  Alice is a software engineer passionate about functional programming.
</Person>

<Project id="mycelia" title="Mycelia" status="active" owner="alice">
  A knowledge graph system for interconnected content.
  
  <Task id="parser" priority="high">
    Build the MDX parser with functional architecture
  </Task>
  
  <Task id="renderer" priority="medium">
    Create React components for rendering
  </Task>
</Project>

<Essay id="fp-benefits" title="Benefits of FP">
  Discussing functional programming in the mycelia project.
</Essay>
```

### Output (JSON)

```json
{
  "nodes": {
    "alice": {
      "id": "alice",
      "type": "person",
      "primitive": "Content",
      "title": "Alice is a software engineer...",
      "content": "Alice is a software engineer passionate about functional programming.",
      "children": [],
      "attributes": { "id": "alice", "role": "developer" },
      "source": { "file": "example.mdx", "start": {...}, "end": {...} }
    },
    "mycelia": {
      "id": "mycelia",
      "type": "project",
      "primitive": "Content",
      "title": "Mycelia",
      "content": "A knowledge graph system for interconnected content.",
      "children": ["parser", "renderer"],
      "attributes": { "id": "mycelia", "title": "Mycelia", "status": "active", "owner": "alice" },
      "source": { "file": "example.mdx", "start": {...}, "end": {...} }
    },
    "parser": {
      "id": "parser",
      "type": "task",
      "primitive": "Content",
      "title": "Build the MDX parser with functional architecture",
      "content": "Build the MDX parser with functional architecture",
      "children": [],
      "attributes": { "id": "parser", "priority": "high" },
      "source": { "file": "example.mdx", "start": {...}, "end": {...} }
    }
  },
  "edges": [
    {
      "id": "mycelia-contains-parser",
      "from": "mycelia",
      "to": "parser",
      "type": "contains"
    },
    {
      "id": "mycelia-contains-renderer",
      "from": "mycelia",
      "to": "renderer",
      "type": "contains"
    },
    {
      "id": "fp-benefits-references-mycelia",
      "from": "fp-benefits",
      "to": "mycelia",
      "type": "references"
    }
  ],
  "indexes": {
    "byType": {
      "person": ["alice"],
      "project": ["mycelia"],
      "task": ["parser", "renderer"],
      "essay": ["fp-benefits"]
    },
    "byPrimitive": {
      "Content": ["alice", "mycelia", "parser", "renderer", "fp-benefits"]
    },
    "inbound": {
      "mycelia": ["fp-benefits-references-mycelia"],
      "parser": ["mycelia-contains-parser"]
    },
    "outbound": {
      "mycelia": ["mycelia-contains-parser", "mycelia-contains-renderer"],
      "fp-benefits": ["fp-benefits-references-mycelia"]
    }
  },
  "meta": {
    "generatedAt": "2024-11-23T10:00:00.000Z",
    "version": "0.1.0",
    "files": 1,
    "sources": ["example.mdx"],
    "stats": {
      "nodeCount": 5,
      "edgeCount": 3,
      "typeBreakdown": { "person": 1, "project": 1, "task": 2, "essay": 1 }
    }
  }
}
```

## Type Definitions

### Core Types

```typescript
type NodePrimitive = 'Content' | 'Reference' | 'Meta';

interface ContentNode {
  id: string;
  type: string;
  primitive: 'Content';
  title?: string;
  content?: string;
  value?: string;
  children: string[];
  attributes: Record<string, any>;
  source: SourceReference;
  created_at?: string;
  updated_at?: string;
}

interface ReferenceNode {
  id: string;
  type: string;
  primitive: 'Reference';
  target: string;
  link_type: string;
  attributes: Record<string, any>;
  source: SourceReference;
}

interface MetaNode {
  id: string;
  type: string;
  primitive: 'Meta';
  meta_type: string;
  value: string;
  target?: string;
  attributes: Record<string, any>;
  source: SourceReference;
}

type MyceliaNode = ContentNode | ReferenceNode | MetaNode;
```

### Graph Structure

```typescript
interface MyceliaGraph {
  nodes: Record<string, MyceliaNode>;
  edges: MyceliaEdge[];
  indexes: GraphIndexes;
  meta: GraphMetadata;
}

interface MyceliaEdge {
  id: string;
  from: string;
  to: string;
  type: 'contains' | 'references' | 'mentions' | 'tags' | 'custom';
  attributes?: Record<string, any>;
}

interface GraphIndexes {
  byType: Record<string, string[]>;
  byTag: Record<string, string[]>;
  byPrimitive: Record<string, string[]>;
  bySource: Record<string, string[]>;
  inbound: Record<string, string[]>;
  outbound: Record<string, string[]>;
}
```

## Usage

```typescript
import { parse, parseContent } from '@mycelia/parser';

// Parse single file
const result = await parseContent(mdx_string, 'file.mdx');
console.log(result.graph.nodes);

// Parse multiple files
const result = await parse(['content/**/*.mdx']);
console.log(result.graph.meta.stats);

// With custom registry
import { createRegistry } from '@mycelia/core';
const registry = createRegistry();
registry['custom-tag'] = { primitive: 'Content' };
const result = await parse(files, { registry });
```

## Architecture

### Parsing Pipeline

The parser uses a pure functional pipeline with zero mutation:

```
content → ast() → extract() → nodes.map(node) 
  → hierarchy() → edges.* → graph()
```

**Stage 1: AST Parsing**
- `ast(content)` - Parse MDX to AST using unified/remark

**Stage 2: Semantic Extraction**
- `extract(ast, filename, registry)` - Extract semantic nodes from AST
- Returns array of `Semantic` objects with tag info

**Stage 3: Node Creation**
- `node(semantic)` - Map semantic nodes to Mycelia nodes
- Creates ContentNode, ReferenceNode, or MetaNode based on primitive

**Stage 4: Hierarchy Building**
- `hierarchy(ast, semantics, nodes)` - Build parent-child relationships
- Returns nodes with populated `children` arrays + containment edges

**Stage 5: Edge Detection**
- `edges.attrs(nodes)` - Explicit edges from attributes (parent=, target=)
- `edges.content(nodes)` - Implicit edges from content scanning
- `edges.dedupe(edges)` - Remove duplicate edges

**Stage 6: Graph Construction**
- `graph(nodes, edges, sources)` - Build final graph with indexes + stats

### Key Functions

**Utilities (`utils.ts`)**
```typescript
id(tag_name, text?)           // Generate unique ID
attrs(attributes)             // Extract MDX attributes
text(node, registry)          // Extract text content
semantic(node, registry)      // Check if semantic tag
date(str)                     // Normalize date to ISO
edge(from, to, type)          // Create edge ID
```

**Parser (`markdown.ts`)**
```typescript
parseContent(content, file)   // Parse single file
parse(files, config?)         // Parse multiple files
```

**Edge Detection**
```typescript
edges.attrs(nodes)            // Explicit attribute edges
edges.content(nodes)          // Content reference edges
edges.dedupe(edges)           // Deduplication
```

### Tag Registry

The parser uses a registry to map user-facing tags to primitives:

```typescript
const registry = {
  'project': { primitive: 'Content' },
  'task': { primitive: 'Content' },
  'person': { primitive: 'Content' },
  'link': { primitive: 'Reference' },
  'tag': { primitive: 'Meta' }
};
```

Custom tags can be registered:
```typescript
registry['custom'] = { primitive: 'Content', attributes: { type: 'custom' } };
```

## Features

- ✅ **Pure functional** - Zero mutation, all immutable transformations
- ✅ **Type safe** - Full TypeScript support throughout
- ✅ **Single pass** - Efficient AST traversal
- ✅ **Auto ID generation** - Generates unique IDs from content
- ✅ **Hierarchy detection** - Automatic parent-child relationships
- ✅ **Reference detection** - Both explicit (attributes) and implicit (content)
- ✅ **Edge deduplication** - Handles multiple relationship sources
- ✅ **Source tracking** - Preserves file location for every node
- ✅ **Extensible** - Custom tag registry system
- ✅ **Well tested** - 80 tests covering unit + integration scenarios

## Primitives

All tags map to one of three primitives:

**Content** - Any content-bearing node
- Examples: Project, Essay, Task, Person, Note
- Has: title, content, children
- Used for: Hierarchical content

**Reference** - Link to another node
- Examples: Link, Citation
- Has: target, link_type
- Used for: Explicit relationships

**Meta** - Annotation about content
- Examples: Tag, Comment, Label
- Has: value, meta_type, optional target
- Used for: Categorization and metadata

## Extensions

### 1. Incremental Parsing
Add support for parsing only changed files:
```typescript
parse(files, { incremental: true, cache: previous_graph })
```
Would diff files, parse only changes, and merge graphs efficiently.

### 2. Plugin System
Allow custom transformations in the pipeline:
```typescript
parse(files, { 
  plugins: [
    { name: 'timestamps', fn: node => ({ ...node, parsed_at: Date.now() }) },
    { name: 'slugify', fn: node => ({ ...node, slug: slugify(node.title) }) }
  ]
})
```

### 3. Streaming Parser
Support very large files with streaming:
```typescript
parseStream(readable_stream, { chunk_size: 1000 })
```
Would process AST in chunks and yield partial graphs.

### 4. Schema Validation
Add runtime validation for node structures:
```typescript
import { z } from 'zod';
parse(files, { 
  validate: true,
  schemas: {
    'project': z.object({ title: z.string(), status: z.enum(['active', 'done']) })
  }
})
```

### 5. Query Language
Add graph query capabilities:
```typescript
graph.query('project[status=active] -> task[priority=high]')
// Returns all high-priority tasks in active projects
```
Would enable complex graph traversal and filtering without manual iteration.

---

**License:** MIT  
**Author:** Tom  
**Version:** 0.1.0
