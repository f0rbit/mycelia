# Mycelia Documentation Plan

## 🎯 Goal
Create comprehensive documentation for Mycelia using Fumadocs, covering installation, usage, API reference, and architecture details.

## 📚 Documentation Structure

### 1. Getting Started
- **Introduction** (`/docs/introduction.mdx`)
  - What is Mycelia?
  - Core concepts: Leafs, Branches, Trunks, Forest
  - Digital garden philosophy
  - Comparison with other tools (Obsidian, Notion, etc.)

- **Quick Start** (`/docs/quick-start.mdx`)
  - Installation with Bun/npm
  - Creating your first project
  - Basic example with sample content
  - Running the development server

- **Installation** (`/docs/installation.mdx`)
  - System requirements
  - Package manager options (Bun preferred)
  - Monorepo setup
  - Troubleshooting common issues

### 2. Core Concepts
- **Content Structure** (`/docs/concepts/content-structure.mdx`)
  - Understanding the forest metaphor
  - Leafs (posts, notes, essays)
  - Branches (projects, collections)
  - Trunks (people, organizations)
  - How everything connects

- **Custom Tags** (`/docs/concepts/custom-tags.mdx`)
  - Complete tag reference
  - Tag attributes and properties
  - Nesting and relationships
  - Auto-generated IDs
  - Examples for each tag type

- **Graph Model** (`/docs/concepts/graph-model.mdx`)
  - Node structure
  - Edge types (contains, references, relates)
  - Indexes and queries
  - Graph traversal patterns

### 3. Content Creation
- **Writing Content** (`/docs/content/writing.mdx`)
  - MDX basics
  - Using custom tags
  - Creating relationships
  - Best practices

- **Content Directory** (`/docs/content/directory.mdx`)
  - File organization
  - Naming conventions
  - Content discovery
  - Multiple content sources

- **Examples** (`/docs/content/examples.mdx`)
  - Blog post with tags
  - Project documentation
  - Person profiles
  - Research notes
  - Complete portfolio site

### 4. Parser & Engine
- **Parser Overview** (`/docs/parser/overview.mdx`)
  - How parsing works
  - AST transformation
  - ID generation algorithm
  - Error handling

- **Custom Tags Reference** (`/docs/parser/tags.mdx`)
  ```mdx
  <Project> - Project containers
  <Person> - People and collaborators
  <Skill> - Skills and expertise
  <Task> - Project tasks
  <Date> - Temporal data
  <Tag> - Categorization
  <Research> - Research notes
  <Essay> - Long-form content
  ```

- **Registry System** (`/docs/parser/registry.mdx`)
  - Tag to primitive mapping
  - Extending the registry
  - Custom tag creation

### 5. Next.js Integration
- **Setup Guide** (`/docs/nextjs/setup.mdx`)
  - Creating a Next.js app with Mycelia
  - Directory structure
  - Configuration files
  - SSR setup

- **Static Site Generation** (`/docs/nextjs/static-generation.mdx`)
  - generateStaticParams
  - Building static data
  - Export configuration
  - Deployment options

- **Dynamic Routing** (`/docs/nextjs/routing.mdx`)
  - Node pages (/node/[nodeId])
  - Type pages (/type/[typeId])
  - Catch-all routes
  - Breadcrumb navigation

### 6. Components & Rendering
- **Semantic Renderers** (`/docs/components/semantic-renderers.mdx`)
  - Type-specific components
  - ProjectRenderer, PersonRenderer, etc.
  - Customizing renderers
  - Creating new renderers

- **Graph Visualization** (`/docs/components/graph.mdx`)
  - Force Graph setup
  - Interactive features
  - Filtering and navigation
  - Performance optimization

- **UI Components** (`/docs/components/ui.mdx`)
  - Card layouts
  - Badge system
  - Navigation components
  - Responsive design

### 7. CLI & Tools
- **CLI Usage** (`/docs/cli/usage.mdx`)
  ```bash
  mycelia parse <files>     # Parse MDX files
  mycelia graph             # Generate graph JSON
  mycelia serve             # Start dev server
  mycelia export            # Static export
  ```

- **Build Tools** (`/docs/cli/build.mdx`)
  - Pre-build scripts
  - Static data generation
  - Cache management
  - Performance tips

### 8. API Reference
- **Core Package** (`/docs/api/core.mdx`)
  - MyceliaNode types
  - MyceliaEdge types
  - MyceliaGraph interface
  - Primitives (Leaf, Branch, Trunk)

- **Parser Package** (`/docs/api/parser.mdx`)
  - MarkdownParser class
  - ParseResult interface
  - Parser configuration
  - Error handling

- **SSR Package** (`/docs/api/ssr.mdx`)
  - ContentProvider
  - MDX processing
  - Next.js utilities
  - Caching strategies

### 9. Advanced Topics
- **Performance** (`/docs/advanced/performance.mdx`)
  - Large graph optimization
  - Build time reduction
  - Lazy loading strategies
  - Caching patterns

- **Extending Mycelia** (`/docs/advanced/extending.mdx`)
  - Custom primitives
  - New tag types
  - Plugin system ideas
  - Multi-framework support

- **Migration Guide** (`/docs/advanced/migration.mdx`)
  - From Obsidian
  - From Notion
  - From raw Markdown
  - Data transformation

### 10. Examples & Tutorials
- **Tutorial: Blog** (`/docs/tutorials/blog.mdx`)
  - Setting up a blog
  - Post organization
  - Tag system
  - Archive pages

- **Tutorial: Portfolio** (`/docs/tutorials/portfolio.mdx`)
  - Project showcase
  - Skills matrix
  - Timeline view
  - Contact integration

- **Tutorial: Knowledge Base** (`/docs/tutorials/knowledge-base.mdx`)
  - Research organization
  - Cross-referencing
  - Search implementation
  - Graph exploration

## 🎨 Design Considerations

### Documentation Features
- Interactive code examples with live previews
- Copy-paste ready snippets
- Dark mode support
- Search functionality (Fumadocs built-in)
- Version selector (future)
- API playground (future)

### Content Types
1. **Guides** - Step-by-step tutorials
2. **Concepts** - Explanatory content
3. **Reference** - API documentation
4. **Examples** - Code samples
5. **Troubleshooting** - Common issues

### Navigation Structure
```
Introduction
├── What is Mycelia?
├── Quick Start
└── Installation

Core Concepts
├── Content Structure
├── Custom Tags
└── Graph Model

Content Creation
├── Writing Content
├── Directory Structure
└── Examples

... etc
```

## 📝 Content Priority

### Phase 1 (Immediate)
1. Introduction & Quick Start
2. Installation guide
3. Basic content creation
4. Core custom tags reference

### Phase 2 (Next)
1. Next.js integration guide
2. Static site generation
3. Component documentation
4. CLI usage

### Phase 3 (Future Roadmap)
1. Advanced topics
2. Full API reference
3. Migration guides
4. Video tutorials
5. Multi-parser support (Typst, etc.)
6. Multi-framework renderers (Vue, Svelte)
7. Advanced query API layer

## 🚀 Implementation Steps

1. **Set up Fumadocs structure** ✅
   - Basic configuration
   - Layout components
   - Navigation setup

2. **Create content structure**
   - Directory organization
   - Meta files for navigation
   - Index pages

3. **Write core documentation**
   - Start with introduction
   - Add quick start guide
   - Document basic usage

4. **Add code examples**
   - Interactive demos
   - Copy buttons
   - Syntax highlighting

5. **Implement search**
   - Configure Fumadocs search
   - Add search index
   - Test functionality

6. **Deploy documentation**
   - Set up hosting
   - Configure domain
   - Add analytics

## 🎯 Success Metrics

- Complete documentation coverage for all packages
- Interactive examples for key features
- Search functionality working
- Mobile-responsive design
- Fast page loads (< 1s)
- Clear navigation structure
- Comprehensive API reference

## 📚 Resources

- [Fumadocs Documentation](https://fumadocs.vercel.app/)
- [MDX Documentation](https://mdxjs.com/)
- [Next.js Docs](https://nextjs.org/docs)

---

**Ready to build comprehensive Mycelia documentation!**