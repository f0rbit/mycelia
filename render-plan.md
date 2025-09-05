# Mycelia Render Plan

## 🎯 **Current Status**
- **Phase 1 MVP**: ✅ Complete (@mycelia/core, @mycelia/parser, @mycelia/cli)
- **Phase 2 Active**: 🚧 @mycelia/render package foundation exists but needs completion
- **Parser Output**: ✅ Working with dual JSON output (graph.json + renderable.json)

## 📋 **Immediate Render Tasks**

### **Priority 1: Complete @mycelia/render Package**

#### **Task 4: Complete React Primitive Components**
- ✅ Foundation exists in `packages/render/src/react/primitives/`
- 🚧 Enhance LeafRenderer, BranchRenderer, TrunkRenderer
- 🚧 Complete LinkRenderer and MetaRenderer implementations  
- 🚧 Add proper TypeScript types and props interfaces
- 🚧 Test with real parsed content from `.mycelia/renderable.json`

#### **Task 5: Implement RenderableTreeRenderer**
- 🚧 Create main renderer that consumes parser JSON output
- 🚧 Handle recursive rendering of nested content structures
- 🚧 Implement resolved reference rendering for bi-directional links
- 🚧 Add error handling and fallback components

#### **Task 6: Component Registry System**
- 🚧 Build mapping system: content types → React components
- 🚧 Support custom component overrides
- 🚧 Register default mappings for all semantic tags (Project, Person, Research, etc.)
- 🚧 Enable runtime component registration

#### **Task 7: Theming and Styling Support**
- 🚧 Enhance existing theme system in `shared/theme.ts`
- 🚧 Add CSS-in-JS or styled-components integration
- 🚧 Create responsive design patterns
- 🚧 Support light/dark mode toggle

### **Priority 2: Demo Integration**

#### **Task 8: Connect to Demo App**
- 🚧 Update `apps/demo/src/components/mycelia-content.tsx`
- 🚧 Load and render `.mycelia/renderable.json` content
- 🚧 Implement navigation between content pieces
- 🚧 Add interactive features (expand/collapse, filtering)

### **Priority 3: Advanced Features**

#### **Task 9: Graph Visualization (@mycelia/graph)**
- ⏳ Cytoscape.js integration for interactive node graphs
- ⏳ D3 force-directed graph implementation
- ⏳ React wrapper components with layout options
- ⏳ Click navigation between graph and content views

#### **Task 10: Multi-Framework Support**
- ⏳ Vue renderer components in `packages/render/src/vue/`
- ⏳ Svelte renderer components in `packages/render/src/svelte/`
- ⏳ Shared rendering logic abstraction

## 🏗️ **Technical Architecture**

### **Data Flow**
```
MDX Files → @mycelia/parser → JSON Output → @mycelia/render → React Components
```

### **Key Files to Work With**
- **Parser Output**: `.mycelia/renderable.json` (optimized tree structure)
- **Graph Data**: `.mycelia/graph.json` (complete graph with relationships)
- **React Components**: `packages/render/src/react/primitives/`
- **Main Renderer**: `packages/render/src/react/RenderableTreeRenderer.tsx`
- **Demo Integration**: `apps/demo/src/components/mycelia-content.tsx`

### **Content Structure Understanding**
From the parsed data, we have:
- **Primitives**: Leaf, Branch, Trunk, Link, Meta
- **Content Types**: project, person, portfolio, research, tag, etc.
- **Resolved References**: Bi-directional linking between content
- **Rich Metadata**: Source locations, attributes, hierarchical relationships

## 🚀 **Implementation Strategy**

### **Phase 1: Core Rendering (Immediate)**
1. Complete primitive React components with proper styling
2. Build RenderableTreeRenderer to handle nested content
3. Test with existing parsed portfolio content
4. Integrate into demo app for live preview

### **Phase 2: Enhanced Features**
1. Component registry for custom type mappings
2. Advanced theming and responsive design
3. Interactive graph visualization
4. Navigation and deep linking

### **Phase 3: Multi-Framework**
1. Vue.js renderer implementation
2. Svelte renderer implementation
3. Performance optimizations
4. Advanced plugin system

## 🎯 **Success Criteria**

**Phase 1 Complete When:**
- Can load `.mycelia/renderable.json` and render complete content tree
- All semantic tags (Project, Person, Research, etc.) render properly
- Demo app shows portfolio content with navigation
- Bi-directional links work between content pieces

**Phase 2 Complete When:**
- Interactive graph visualization working
- Custom component registration system functional
- Responsive design with theme support
- Production-ready styling and UX

**Phase 3 Complete When:**
- Multi-framework support implemented
- Performance optimized for large content sets
- Extensible plugin architecture
- Complete documentation and examples

## 🔧 **Development Commands**

```bash
# Build all packages
bun run build

# Parse example content
node packages/cli/dist/cli.js parse "examples/*.md"

# Run demo app
cd apps/demo && bun run dev

# Test render components
bun test packages/render/
```

## 📁 **File Structure Focus**

```
packages/render/src/
├── react/
│   ├── primitives/          # ← Core components to complete
│   ├── RenderableTreeRenderer.tsx  # ← Main renderer to build
│   ├── registry.ts          # ← Component mapping system
│   └── index.ts            # ← Clean exports
├── shared/
│   ├── types.ts            # ← TypeScript interfaces
│   ├── theme.ts            # ← Enhanced theming
│   └── context.tsx         # ← React context providers
└── index.ts                # ← Package exports
```

## 🚦 **Immediate Next Actions**

1. **START HERE**: Examine existing primitive components
2. **ENHANCE**: Complete LeafRenderer for person/project/tag rendering
3. **BUILD**: RenderableTreeRenderer for nested content
4. **TEST**: Integration with demo app using real parsed data
5. **ITERATE**: Refine styling and add interactive features

This plan leverages the existing strong foundation and focuses on completing the render pipeline to achieve full MDX → React rendering capability.