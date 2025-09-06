# Mycelia Project Structure Plan

## 🎯 **STATUS UPDATE - September 2025**

### ✅ **COMPLETED (Phase 1 MVP)**
- **@mycelia/core**: Complete primitive types, graph structures, and registry system
- **@mycelia/parser**: Full MDX parser with JSON graph output
- **@mycelia/cli**: CLI package with TypeScript compilation fixes
  - ✅ Fixed import paths from `@mycelia/core` to relative paths for proper resolution
  - ✅ Updated package.json dependencies (commander, @mycelia/core, @mycelia/parser)
  - ✅ Resolved TypeScript compilation errors in CLI entry point
  - 🔄 CLI commands implementation (parsing, graph generation) - ready for next phase
- **@mycelia/render**: React renderer package structure created with working components
  - ✅ Professional React components for all primitives (Leaf, Branch, Trunk, Link, Meta)
  - ✅ RenderableTreeRenderer consuming parser output
  - ✅ Component registry system and theming support
- **Unit Tests**: Comprehensive test coverage (10 tests, 100% pass rate)
- **JSON Graph Output**: Working end-to-end with proper indexes, edges, and metadata

### 🚧 **ACTIVE DEVELOPMENT PLAN**

#### **PRIORITY 1: Phase 2 Foundation (Most Critical)**

**Task 1: @mycelia/render Package** ⚡ *NEXT UP*
- Create React components for all primitives (Leaf, Branch, Trunk, Link, Meta)
- Implement RenderableTreeRenderer that consumes parser output
- Component registry system to map types → components
- Basic styling/theming support
- **Target**: Clean imports like `import { react } from "@mycelia/render"`

**Task 2: @mycelia/graph Package**
- Cytoscape.js integration with interactive features
- D3 force-directed graph implementation  
- React wrapper components with layouts
- **Target**: `import { cytoscape, d3 } from "@mycelia/graph"`

#### **PRIORITY 2: Integration & Demo**

**Task 3: Demo Application**
- Next.js app showing full pipeline: MDX → JSON → React → Graph
- File upload interface and live parsing
- Interactive graph visualization
- Deploy to Vercel with example content

#### **PRIORITY 3: Enhanced Parser Features**

**Task 4: Parser Enhancements**
- Better reference resolution and content scanning
- Git metadata integration (createdAt/updatedAt)
- Incremental parsing with file watching
- Duration aggregation and time inheritance

#### **PRIORITY 4: Phase 3 Advanced Features**

**Task 5: Typst Parser Support**
**Task 6: @mycelia/api Package** 
**Task 7: Developer Experience Improvements**
**Task 8: Multi-framework Support (Vue, Svelte)**

---

## 🏗️ Monorepo Structure

```
mycelia/
├── packages/
│   ├── core/                    # ✅ Shared types and primitives
│   ├── parser/                  # ✅ Unified parser package
│   │   ├── markdown.ts          # ✅ MDX parser implementation
│   │   ├── typst.ts             # ⏳ Typst parser implementation
│   │   ├── registry.ts          # ✅ Tag-to-primitive mapping
│   │   └── index.ts             # ✅ Exports: { markdown, typst, registry }
│   ├── render/                  # 🚧 Unified renderer package
│   │   ├── react/               # 🚧 React components
│   │   ├── vue/                 # ⏳ Vue components (future)
│   │   ├── svelte/              # ⏳ Svelte components (future)
│   │   └── index.ts             # 🚧 Exports: { react, vue, svelte }
│   ├── graph/                   # 🚧 Graph visualization package
│   │   ├── cytoscape.ts         # 🚧 Cytoscape.js implementation
│   │   ├── d3.ts                # 🚧 D3 implementation
│   │   ├── vis.ts               # ⏳ Vis.js implementation
│   │   └── index.ts             # 🚧 Exports: { cytoscape, d3, vis }
│   ├── api/                     # ⏳ API layer
│   └── cli/                     # ✅ CLI tools
├── apps/
│   ├── demo/                    # 🚧 Demo application
│   └── docs/                    # ⏳ Documentation site
└── examples/                    # ✅ Sample content files
```

**Legend**: ✅ Complete | 🚧 In Progress | ⏳ Planned

## 📦 Package Architecture Details

### **@mycelia/parser** - Unified Parser Package ✅

```typescript
// Usage examples:
import { markdown, typst, registry } from "@mycelia/parser"

// Parse markdown files
const { graph, renderTree } = await markdown.parse("content/**/*.md")

// Parse typst files  
const { graph, renderTree } = await typst.parse("docs/**/*.typ")

// Custom tag registry
registry.register("Song", { primitive: "Leaf", defaultProps: { type: "song" } })
```

**Dual Output Strategy**:
1. **JSON Graph Representation**: Complete graph with nodes, edges, metadata for storage/API
2. **Renderable Tree**: Optimized tree structure for component rendering with resolved references

### **@mycelia/render** - Unified Renderer Package 🚧

```typescript
// Usage examples:
import { react } from "@mycelia/render"

// Render with React components
const ProjectComponent = react.Project
const EssayComponent = react.Essay

// Or get the full renderer
const MyceliaRenderer = react.Renderer
```

**Multi-Framework Support**:
- Each framework gets its own subdirectory
- Shared rendering logic in core utilities
- Framework-specific component implementations

### **@mycelia/graph** - Graph Visualization Package 🚧

```typescript
// Usage examples:
import { cytoscape, d3 } from "@mycelia/graph"

// Use Cytoscape implementation
const GraphViz = cytoscape.GraphVisualization

// Use D3 implementation  
const ForceGraph = d3.ForceDirectedGraph
```

## 🎯 Parser Dual Output Design

### 1. **JSON Graph Representation** ✅

```typescript
interface MyceliaGraph {
  nodes: Record<string, MyceliaNode>
  edges: MyceliaEdge[]
  indexes: {
    byType: Record<string, string[]>
    byTag: Record<string, string[]>
    byPerson: Record<string, string[]>
  }
  meta: {
    generatedAt: string
    files: number
    sources: string[]
  }
}
```

### 2. **Renderable Tree Structure** ✅

```typescript
interface RenderableNode {
  id: string
  type: string
  primitive: 'Leaf' | 'Branch' | 'Trunk' | 'Link' | 'Meta'
  props: Record<string, any>
  children: RenderableNode[]
  content?: string
  resolvedRefs: ResolvedReference[]
}

interface ResolvedReference {
  id: string
  type: string
  title: string
  url?: string  // For deep linking
}
```

## 🔄 Bi-directional Link Strategy ✅

The parser will:
1. **Forward Links**: Track explicit references (`<Person id="alice">` inside a project)
2. **Backward Links**: Automatically create reverse edges (Alice is referenced by this project)
3. **Link Resolution**: Convert ID references to full node data for rendering
4. **Deep Linking**: Generate URLs for navigation between content

## 🚀 Core Design Principles

### Primitive-Based Architecture ✅
Following the spec's insight about "typed tree grammar":
- All user tags map to core primitives (Leaf, Branch, Trunk, Link, Meta)
- Extensible registry system for custom tag mappings
- Type-safe primitive definitions with TypeScript

### Graph-First Data Model ✅
- Everything becomes nodes and edges in a graph
- Rich metadata preservation (source file, line numbers, git info)
- Bidirectional relationships and reference tracking

### Developer Experience Focus 🚧
- Hot reload for content changes ⏳
- Type safety throughout the pipeline ✅
- Clear error messages with source locations ✅
- Extensible plugin system ⏳

## 🔧 Technical Stack

- **Runtime**: Bun for package management and development ✅
- **Language**: TypeScript throughout ✅
- **Parsing**: unified/remark/MDX ecosystem ✅
- **Visualization**: Cytoscape.js + react-force-graph 🚧
- **Testing**: Bun's built-in test runner ✅
- **Build**: Native Bun bundling + TypeScript compilation ✅

## 📋 Implementation Priority

### Phase 1 (MVP) ✅ **COMPLETE**
- **@mycelia/core**: Core types and primitives ✅
- **@mycelia/parser**: Markdown parser with MDX support ✅
- Basic CLI for parsing and output generation ✅

### Phase 2 (Enhanced) 🚧 **ACTIVE**
- **@mycelia/render**: React renderer components 🚧
- **@mycelia/graph**: Graph visualization components 🚧
- Demo application 🚧

### Phase 3 (Advanced) ⏳
- Typst parser integration
- API layer with REST endpoints
- Performance optimizations
- Multi-framework renderer support

## 🎯 Clean Import Examples

```typescript
import { markdown } from "@mycelia/parser"     // ✅ Working
import { react } from "@mycelia/render"       // 🚧 Next up
import { cytoscape } from "@mycelia/graph"    // 🚧 Coming soon

const { graph, renderTree } = await markdown.parse(files)
const ProjectComponent = react.Project
const GraphViz = cytoscape.GraphVisualization
```

## 🔄 Extensibility Strategy

**Add New Parsers**: Add files to `@mycelia/parser`
**Add New Renderers**: Add subdirs to `@mycelia/render`  
**Add New Graph Libs**: Add files to `@mycelia/graph`

Framework agnostic core with multiple implementation support from day one.

## 🚦 **Success Criteria**

**Phase 2 Complete When:**
- Can parse MDX → render React components → display interactive graph
- Demo application works end-to-end
- All packages have tests and documentation
- Clean import syntax works as designed

**Phase 3 Complete When:**  
- Typst parsing works
- API layer functional
- Performance optimized for large repos
- Multi-framework support implemented

## 🎯 **IMMEDIATE NEXT ACTION**
Starting with **@mycelia/render** package - building React components for all primitives and renderable tree consumption!