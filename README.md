# Mycelia

A markdown-based engine for creating deeply-linked project websites (digital gardens). Mycelia parses MDX files with custom tags into a unified graph structure, enabling rich cross-referencing and node-based visualization.

## Demo Applications

Mycelia includes two demo applications to suit different needs:

### 🚀 Simple Demo (`apps/demo`)
- **5 content files** - Quick to understand
- **Simple structure** - Easy to read and learn from
- **Getting started** - Perfect for learning Mycelia basics
- **Run**: `bun run dev:demo` (port 3001)

**Best for**: New users, learning Mycelia basics, quick prototypes

### 🎨 Portfolio Showcase (`apps/portfolio`)
- **146 nodes** - Real-world example
- **10+ semantic types** - Full feature set
- **Graph visualization** - Interactive exploration
- **Run**: `bun run dev:portfolio` (port 3000)

**Best for**: Advanced users, production examples, full feature exploration

## Overview

Mycelia transforms markdown content with custom XML-like tags into an interconnected knowledge graph. The system supports hierarchical content organization where everything connects together to form a "forest of ideas."

### Core Concepts

- **Content Nodes**: Any content-bearing entity (projects, essays, blog posts, skills, etc.)
- **Reference Nodes**: Links and pointers between content nodes
- **Meta Nodes**: Tags, annotations, and metadata about content
- **Graph Structure**: All nodes and their relationships are compiled into a `MyceliaGraph` JSON format

## Package Structure

The project is organized as a monorepo with the following packages:

```
packages/
├── core/        # Shared types, primitives, registry
├── parser/      # MDX → JSON graph parser
├── render/      # React + Next.js rendering (consolidated)
├── graph/       # Graph visualization
└── cli/         # CLI tools

apps/
├── demo/        # Simple 5-file demo
├── portfolio/   # Comprehensive 146-node showcase
└── docs/        # Documentation site
```

### Core Packages

- **@mycelia/core** - Core types and primitives (`MyceliaNode`, `MyceliaGraph`, `MyceliaEdge`)
- **@mycelia/parser** - MDX parser that transforms markdown files into graph JSON
- **@mycelia/render** - React components for rendering nodes and content, including Next.js SSR integration
- **@mycelia/graph** - Interactive graph visualization with Cytoscape and Force Graph
- **@mycelia/cli** - Command-line tools for building and managing projects

> **Note**: `@mycelia/ssr` was merged into `@mycelia/render` in v0.2.0 for better organization. Use `@mycelia/render/nextjs` for SSR functionality.

### Applications

- **apps/demo** - Simple 5-file demo for learning Mycelia basics
- **apps/portfolio** - Comprehensive 146-node portfolio showcasing all features
- **apps/docs** - Documentation site built with Fumadocs

## MDX Tag Format

Mycelia uses custom XML-like tags inside MDX files to represent relationships:

```mdx
<Project name="Dream Machines" status="wip">
  <Date of="2025-08-31 10:20" duration="120">
    Began outlining the concept of blending surrealist film imagery with modular synth textures.
  </Date>

  <Research type="study">
    <Book id="freud-dreams">Sigmund Freud - The Interpretation of Dreams</Book>
    <Film id="lynch-mulholland">David Lynch - Mulholland Drive</Film>
    Notes: layering disorientation through sonic motifs.
  </Research>

  <Research type="experiment">
    Tried running <Track id="synth-loop-01">Synth Loop 01</Track> through tape delay.
    Outcome: created warped "breathing" effect, will reuse in <Song id="nightmare-suite"/>.
  </Research>

  <Essay title="Surrealism in Sound: How Dreams Inform Recording Practices">
    Draft section written on <Date of="2025-09-01" duration="45"/>.
    Connected with earlier <Research type="logs">notes on Lynchian soundscapes</Research>.
  </Essay>

  <Person id="cblackwell">Cameron Blackwell</Person> suggested the <Concept id="tape-saturation">tape saturation</Concept> experiment.

  <Tag>surrealism</Tag>
  <Tag>sound-design</Tag>
</Project>
```

## Graph Output Format

The parser generates a `MyceliaGraph` JSON structure:

```typescript
interface MyceliaGraph {
  nodes: Record<string, MyceliaNode>;
  edges: MyceliaEdge[];
  indexes: GraphIndexes;
  meta: GraphMetadata;
}
```

This graph includes:
- **Nodes**: All content, references, and metadata
- **Edges**: Typed relationships (contains, references, mentions, tags, etc.)
- **Indexes**: Fast lookups by type, tag, primitive, and source
- **Metadata**: Build statistics and version information

## Usage Example

### Parsing MDX Files

```typescript
import { markdown } from '@mycelia/parser';

const graph = await markdown.parseDirectory('./content');
// Returns MyceliaGraph with all nodes, edges, and indexes
```

### Rendering with React

```typescript
import { NodeRenderer } from '@mycelia/render/react';
import { MyceliaProvider } from '@mycelia/render';

function App({ graph, nodeId }) {
  return (
    <MyceliaProvider graph={graph}>
      <NodeRenderer nodeId={nodeId} />
    </MyceliaProvider>
  );
}
```

### Next.js SSR Integration

```typescript
import { getContentGraph, getNodeContent } from '@mycelia/render/nextjs';

export async function generateStaticParams() {
  const graph = await getContentGraph('./content');
  return Object.keys(graph.nodes).map((nodeId) => ({ nodeId }));
}

export default async function NodePage({ params }) {
  const content = await getNodeContent(params.nodeId);
  return <SemanticNodeRenderer node={content.node} />;
}
```

### Graph Visualization

```typescript
import { MyceliaGraphViewer } from '@mycelia/graph';

function GraphView({ graph }) {
  return <MyceliaGraphViewer graph={graph} />;
}
```

## Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/mycelia.git
cd mycelia

# Install dependencies
bun install

# Run the simple demo (recommended for first time)
bun run dev:demo
# Visit http://localhost:3001

# Or run the portfolio showcase
bun run dev:portfolio
# Visit http://localhost:3000
```

## Available Scripts

```bash
# Development
bun run dev:demo          # Simple demo on port 3001
bun run dev:portfolio     # Portfolio on port 3000
bun run dev:docs          # Documentation site (port 3001)

# Building
bun run build             # Build all packages
bun run build:demo        # Build simple demo
bun run build:portfolio   # Build portfolio

# Testing & Cleanup
bun test                  # Run all tests
bun run clean             # Clean build artifacts
```

## Architecture

### Parser Pipeline

1. **MDX Parsing**: Uses unified/remark to parse MDX into AST
2. **Node Extraction**: Identifies custom tags and converts to `MyceliaNode` instances
3. **Edge Creation**: Analyzes relationships and creates typed edges
4. **Index Building**: Constructs lookup indexes for fast queries
5. **Graph Output**: Serializes to JSON with metadata

### Renderer Architecture

The render package uses a registry-based system for mapping node types to React components:

```typescript
// Register custom renderers
registry.register('Project', ProjectRenderer);
registry.register('Essay', EssayRenderer);

// Fallback to default renderers for unregistered types
```

### SSR Strategy

The render package (`@mycelia/render/nextjs`) provides utilities for:
- Content discovery and graph generation at build time
- Static parameter generation for all nodes
- Server-side rendering with Next.js app router
- Incremental static regeneration (ISR) support

## Future Roadmap

The following features are planned but not yet implemented:

### Parser Extensions
- **Typst Parser**: Support for `.typ` scientific document format
- **Front Matter Extensions**: Enhanced YAML/TOML front matter parsing
- **Incremental Parsing**: Performance optimizations for large graphs

### Multi-Framework Support
- **Vue.js Renderer**: Vue 3 composition API components
- **Svelte Renderer**: Svelte component library
- **Web Components**: Framework-agnostic custom elements

### API & Querying
- **@mycelia/api**: REST/GraphQL API for graph operations
- **Query Builder**: Type-safe query interface for graph traversal
- **Real-time Updates**: WebSocket support for live collaboration

### Visualization Enhancements
- **3D Graph View**: Three.js-based 3D visualization
- **Custom Layouts**: Force-directed, hierarchical, and radial layouts
- **Graph Analytics**: Centrality metrics, community detection

### Developer Experience
- **VS Code Extension**: Syntax highlighting and autocomplete for custom tags
- **Type Generation**: Automatic TypeScript types from custom tag schemas
- **Live Reload**: Hot module replacement for content changes

## License

MIT
