# Mycelia Dynamic Demo Implementation Plan

## Current State Analysis
- **317 nodes** across 10 semantic types (project, person, skill, task, essay, research, book, etc.)
- **316 edges** with 311 "contains" and 5 "references" relationships
- **Rich semantic tags** with specialized attributes but no custom rendering
- **4 static pages** showing everything - massive underutilization of knowledge graph

## Problem Statement
The current demo just renders 4 monolithic pages with heavy indentation, missing the core value proposition of Mycelia: **every node should be a discoverable, linkable page with specialized rendering based on its semantic type**.

## Solution Architecture: Dynamic Site Generation

### Option 1: Next.js Dynamic Routes ⭐ **CHOSEN**
- Use `generateStaticParams()` to create **317 individual pages** at build time
- Each node becomes `[nodeId]/page.tsx` with full static generation
- Maintains static export for GitHub Pages deployment
- SEO-optimized individual URLs for every concept/project/person

### Alternative Options Considered
- **Astro**: Better performance for content-heavy sites
- **Gatsby**: GraphQL layer perfect for knowledge graphs  
- **Custom Generator**: Full control but more maintenance overhead

## Implementation Phases

### Phase 1: Dynamic Routing Foundation 🚀
**Goal**: Transform 4 static pages into 317+ dynamic pages

1. **Create Dynamic Route Structure**
   ```
   app/
   ├── [nodeId]/
   │   └── page.tsx          # Individual node pages
   ├── types/
   │   ├── [nodeType]/       # Type-grouped pages  
   │   │   └── page.tsx      # All projects/people/skills
   └── search/
       └── page.tsx          # Global search
   ```

2. **Build Core Infrastructure**
   - `generateStaticParams()` for all 317 nodes
   - Node data loading utilities
   - Basic page templates for common types
   - Navigation between related nodes

3. **Success Criteria**
   - Every node accessible via `/[nodeId]` URL
   - Proper 404 handling for invalid node IDs
   - Static build generates all pages successfully

### Phase 2: Semantic Component System 🎨
**Goal**: Custom rendering for each semantic tag type

1. **Specialized Page Components**
   ```typescript
   const SEMANTIC_COMPONENTS = {
     'project': ProjectPage,      // Tech stack, demos, timeline
     'person': PersonPage,        // Bio, collaborations, projects
     'skill': SkillPage,         // Proficiency, usage in projects
     'task': TaskPage,           // Status, dependencies, timeline
     'essay': EssayPage,         // Article layout with references
     'research': ResearchPage,   // Academic style with citations
     'book': BookPage,           // Notes, key concepts
     'experience': ExperiencePage, // Timeline with skills gained
     'achievement': AchievePage,  // Milestone with context
     'tag': TagPage,             // All tagged content
     'note': NotePage,           // Quick thoughts + backlinks
   }
   ```

2. **Page Layout Templates**
   - **Timeline pages**: Chronological content (Experience, Milestone)
   - **Portfolio pages**: Projects with images, demos, tech stack
   - **Reference pages**: Concepts/skills with usage examples
   - **Article pages**: Essays/research with full content layout
   - **Profile pages**: People with connection graphs

3. **Success Criteria**
   - Zero "warnings" - all semantic tags have proper rendering
   - Each node type has appropriate visual design
   - Rich attribute display (dates, status, proficiency levels)

### Phase 3: Smart Linking & Navigation 🔗
**Goal**: Intelligent cross-references and discovery

1. **Automatic Cross-References**
   - Bidirectional links: Skills ↔ Projects, People ↔ Collaborations
   - Related content suggestions via shared tags/attributes
   - Timeline navigation (previous/next chronologically)
   - Hierarchical breadcrumbs showing containment

2. **Enhanced Link Components**
   - **Project links**: Status badges, tech stack, demo access
   - **Skill links**: Proficiency indicators, learning timeline
   - **Person links**: Collaboration context, shared projects
   - **Tag links**: Related content in category

3. **Success Criteria**
   - Rich contextual navigation between related nodes
   - Visual indicators for relationship types and strength
   - Discoverable paths through the knowledge graph

### Phase 4: Advanced Features 🚀
**Goal**: Interactive knowledge exploration

1. **Interactive Knowledge Graph**
   - Cytoscape.js visualization of current page + connections
   - Filter by node type, date range, relationship type
   - Temporal filtering showing evolution over time

2. **Smart Discovery Features**
   - Contextual sidebars with related content
   - Tag-based filtering across entire knowledge base
   - Search with facets (type, date, skill level)
   - Auto-generated learning paths for skills/topics

3. **Content Generation**
   - Annual project/achievement summaries
   - Skill progression tracking over time
   - Collaboration network analysis
   - Technology adoption timeline

## Design Philosophy

### Visual Hierarchy
- **Node type colors**: Consistent across pages and links
- **Status indicators**: Active/archived projects, skill proficiency
- **Timeline visualizations**: For chronological content
- **Connection strength**: Visual weight for relationship importance

### Page-Type Specific Layouts
- **Project pages**: Hero section, tech stack, demos, related work
- **Skill pages**: Proficiency timeline, usage examples, learning resources
- **Person pages**: Profile, collaboration history, project involvement
- **Essay pages**: Article layout with TOC, references, related topics

## Technical Architecture

### Dynamic Route Generation
```typescript
// app/[nodeId]/page.tsx
export async function generateStaticParams() {
  const { graph } = await loadCompleteGraph()
  return Object.keys(graph.nodes).map(nodeId => ({ nodeId }))
}

export default async function NodePage({ params }: { params: { nodeId: string } }) {
  const node = await loadNode(params.nodeId)
  const PageComponent = SEMANTIC_COMPONENTS[node.type] || DefaultNodePage
  return <PageComponent node={node} />
}
```

### Semantic Component Registry
```typescript
// Enhanced registry mapping node types to specialized components
const SEMANTIC_COMPONENTS: Record<string, React.ComponentType<NodePageProps>> = {
  project: ({ node }) => <ProjectPage project={node} relatedProjects={...} techStack={...} />,
  person: ({ node }) => <PersonPage person={node} collaborations={...} projects={...} />,
  skill: ({ node }) => <SkillPage skill={node} proficiency={...} projects={...} timeline={...} />,
  // ... etc for all 10+ semantic types
}
```

## Success Metrics

### Quantitative Goals
- **317+ static pages generated** (one per node)
- **Zero parsing warnings** (all semantic tags properly handled)
- **Sub-200ms page load times** for static content
- **100% lighthouse scores** for performance/accessibility

### Qualitative Goals
- **Discoverable knowledge paths** through related content
- **Rich semantic presentation** showing context and relationships
- **Professional portfolio showcase** demonstrating Mycelia's power
- **Compelling developer experience** for knowledge base creation

## Risk Mitigation

### Technical Risks
- **Build time scaling**: 317 pages may slow static generation → implement incremental builds
- **Bundle size growth**: Multiple page types → code splitting by semantic type
- **Complex routing**: Deep hierarchies → implement proper breadcrumb navigation

### User Experience Risks
- **Information overload**: Too many links/connections → prioritize by relevance score
- **Navigation confusion**: Complex graph structure → clear visual hierarchy and search
- **Content discovery**: Hard to find related content → smart recommendations and tagging

## Timeline Estimate
- **Phase 1**: 1-2 days (dynamic routing foundation)
- **Phase 2**: 2-3 days (semantic component system)  
- **Phase 3**: 2-3 days (smart linking & navigation)
- **Phase 4**: 3-4 days (advanced interactive features)

**Total**: ~2 weeks for complete transformation from basic demo to powerful knowledge base showcase.