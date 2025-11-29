# @mycelia/graph

Interactive knowledge graph visualization for Mycelia content systems.

## What It Does

Renders knowledge graphs with force-directed layouts, interactive filtering, and navigation. Transforms static Mycelia graphs into explorable visual networks showing relationships between your content.

**Input:** MyceliaGraph JSON from parser  
**Output:** Interactive canvas-based visualization with pan/zoom/filter

## Why It Exists

Text-based navigation works for known content. Visual graphs reveal unexpected connections, content clusters, and knowledge structure at a glance. The graph viewer makes implicit relationships explicit through spatial layout and visual grouping.

## Features

- ✅ **Force-directed layout** - Physics simulation positions related content close together
- ✅ **Type filtering** - Show/hide content types with real-time count updates
- ✅ **Hover highlighting** - See immediate connections when hovering nodes
- ✅ **Click navigation** - Jump directly to node detail pages
- ✅ **Color-coded types** - Visual distinction between projects, essays, tasks, etc.
- ✅ **Responsive sizing** - Larger nodes for important content (projects, portfolios)
- ✅ **Performance optimized** - Canvas rendering handles 500+ nodes smoothly
- ✅ **Static export friendly** - Works with Next.js static generation
- ✅ **Zero configuration** - Sensible defaults, works out of the box

## Installation

```bash
bun add @mycelia/graph @mycelia/core
```

Peer dependencies:
```bash
bun add react react-dom
```

With npm:
```bash
npm install @mycelia/graph @mycelia/core react react-dom
```

## Quick Start

### Next.js App Router

```typescript
// app/graph/page.tsx
'use client'

import { MyceliaGraphViewer } from '@mycelia/graph'

export default function GraphPage() {
  return (
    <MyceliaGraphViewer 
      graphUrl="/data/graph.json"
      width={1200}
      height={800}
    />
  )
}
```

### Static Site Generation

Generate graph at build time for static exports:

```typescript
// scripts/generate-graph.mjs
import { parse } from '@mycelia/parser'
import { writeFileSync } from 'fs'

const { graph } = await parse(['content/**/*.mdx'])
writeFileSync('public/data/graph.json', JSON.stringify(graph))
```

Add to your build process:
```json
{
  "scripts": {
    "prebuild": "node scripts/generate-graph.mjs",
    "build": "next build"
  }
}
```

Then use in component:
```typescript
'use client'
import { MyceliaGraphViewer } from '@mycelia/graph'

export default function GraphPage() {
  return <MyceliaGraphViewer graphUrl="/data/graph.json" />
}
```

### React (Non-Next.js)

```typescript
import { MyceliaGraphViewer } from '@mycelia/graph'
import { useEffect, useState } from 'react'

function App() {
  return (
    <div className="w-full h-screen">
      <MyceliaGraphViewer 
        graphUrl="/api/graph" 
        width={window.innerWidth}
        height={window.innerHeight}
      />
    </div>
  )
}
```

## Component API

### Props

```typescript
interface GraphViewerProps {
  graphUrl?: string    // URL to fetch graph JSON (default: '/data/graph.json')
  width?: number       // Canvas width in pixels (default: 1000)
  height?: number      // Canvas height in pixels (default: 600)
  className?: string   // Additional CSS classes for container
}
```

#### `graphUrl`
**Type:** `string`  
**Default:** `'/data/graph.json'`

Path or URL to fetch the graph JSON. Can be relative (static files) or absolute (API endpoints).

**Examples:**
```typescript
// Static file in public directory
<MyceliaGraphViewer graphUrl="/data/graph.json" />

// API endpoint
<MyceliaGraphViewer graphUrl="/api/knowledge-graph" />

// Absolute URL
<MyceliaGraphViewer graphUrl="https://example.com/graph.json" />
```

#### `width`
**Type:** `number`  
**Default:** `1000`

Canvas width in pixels. For responsive layouts, calculate dynamically:

```typescript
const [dimensions, setDimensions] = useState({ width: 1000, height: 600 })

useEffect(() => {
  const updateSize = () => {
    setDimensions({
      width: window.innerWidth - 100,
      height: window.innerHeight - 200
    })
  }
  window.addEventListener('resize', updateSize)
  updateSize()
  return () => window.removeEventListener('resize', updateSize)
}, [])

return <MyceliaGraphViewer width={dimensions.width} height={dimensions.height} />
```

#### `height`
**Type:** `number`  
**Default:** `600`

Canvas height in pixels. Match to your layout:

```typescript
// Full viewport height
<MyceliaGraphViewer height={window.innerHeight} />

// Fixed aspect ratio
<MyceliaGraphViewer width={1200} height={675} /> // 16:9
```

#### `className`
**Type:** `string`  
**Default:** `''`

Additional CSS classes for the container div. Useful for custom styling:

```typescript
<MyceliaGraphViewer className="shadow-lg rounded-xl border-2" />
```

## Features in Detail

### Interactive Controls

**Pan:** Click and drag the background to move the graph  
**Zoom:** Scroll wheel (or pinch on touch devices) to zoom in/out  
**Reset:** Double-click the background to reset to default view

Node labels appear automatically when zoomed in (zoom level > 1.5x).

### Node Filtering

Click type filter buttons to toggle visibility:

- **Single type:** Click a type to show only those nodes
- **Multiple types:** Click additional types to combine filters
- **Show all:** Click "Show All" or click the active filter again

The node/link counts update in real-time as you filter.

**Example use cases:**
- View only projects and their tasks
- See all people and their collaborations  
- Focus on essays and their references

### Visual Feedback

**Hover effects:**
- Hovered node gets a border and full opacity
- Connected nodes are highlighted
- Connecting edges thicken to show relationships

**Node sizing:**
- Portfolio nodes: 8px (largest)
- Project nodes: 6px
- Person nodes: 5px  
- Other types: 3px

Larger nodes are easier to click and indicate content importance.

**Color coding:**
Each type has a distinct color for quick identification:
- Person: Blue (`#3b82f6`)
- Project: Green (`#10b981`)
- Skill: Amber (`#f59e0b`)
- Task: Red (`#ef4444`)
- Research: Purple (`#8b5cf6`)
- Essay: Cyan (`#06b6d4`)
- Note: Gray (`#6b7280`)
- Tag: Pink (`#ec4899`)

### Performance

The graph uses canvas rendering instead of DOM nodes for performance:

- **500+ nodes:** Smooth interaction
- **1000+ nodes:** May show slight lag on zoom/pan
- **2000+ nodes:** Consider filtering or pagination

Force simulation auto-stabilizes after initial positioning, reducing CPU usage.

## Customization

### Container Sizing

The viewer respects its parent container dimensions:

```typescript
// Full viewport
<div style={{ width: '100vw', height: '100vh' }}>
  <MyceliaGraphViewer />
</div>

// Card layout
<div className="max-w-4xl mx-auto h-[600px] border rounded-lg">
  <MyceliaGraphViewer width={896} height={600} />
</div>

// Responsive with Tailwind
<div className="w-full h-screen md:h-[800px] lg:h-[1000px]">
  <MyceliaGraphViewer />
</div>
```

### Styling the Container

The viewer includes default Tailwind styles. Override with `className`:

```typescript
<MyceliaGraphViewer 
  className="bg-gray-900 border-gray-700"
  // This applies custom background and border
/>
```

**Note:** The viewer uses Tailwind utility classes internally. If your project doesn't use Tailwind, you may need to provide equivalent styles or use the viewer's built-in classes.

## Integration with Mycelia Ecosystem

Typical workflow combining parser, render, and graph packages:

```typescript
// 1. Parse content files
import { parse } from '@mycelia/parser'
const { graph, renderable } = await parse(['content/**/*.mdx'])

// 2. Save graph for visualization
import { writeFileSync } from 'fs'
writeFileSync('public/data/graph.json', JSON.stringify(graph))

// 3. Render individual pages
import { MyceliaPage } from '@mycelia/render'
export default function NodePage({ node }) {
  return <MyceliaPage content={renderable[node.id]} />
}

// 4. Visualize graph
import { MyceliaGraphViewer } from '@mycelia/graph'
export default function GraphPage() {
  return <MyceliaGraphViewer graphUrl="/data/graph.json" />
}
```

All packages use the same `MyceliaGraph` type from `@mycelia/core`, ensuring compatibility.

## Navigation Integration

### With Next.js App Router

The viewer uses `window.location.href` by default for static export compatibility. For client-side navigation:

```typescript
// Modify the component or fork for custom navigation
// Current behavior (in MyceliaGraphViewer.tsx):
const handleNodeClick = (node) => {
  window.location.href = `/node/${node.id}/`
}

// For client-side routing, you could create a wrapper:
import { MyceliaGraphViewer } from '@mycelia/graph'
import { useRouter } from 'next/navigation'

export function GraphWithRouting(props) {
  const router = useRouter()
  
  // Note: Current version doesn't expose onNodeClick prop
  // This is a future enhancement
  return <MyceliaGraphViewer {...props} />
}
```

**Future API:**
```typescript
<MyceliaGraphViewer 
  graphUrl="/data/graph.json"
  onNodeClick={(node) => router.push(`/node/${node.id}`)}
/>
```

### With React Router

Similar pattern for React Router:

```typescript
import { useNavigate } from 'react-router-dom'

export function GraphPage() {
  const navigate = useNavigate()
  
  // Future enhancement would allow:
  // <MyceliaGraphViewer onNodeClick={(node) => navigate(`/node/${node.id}`)} />
  
  return <MyceliaGraphViewer graphUrl="/api/graph" />
}
```

## Static Export Setup

For deploying to GitHub Pages, Netlify, or Vercel as a static site:

### Step 1: Generate Graph at Build Time

Create `scripts/generate-graph.mjs`:
```javascript
import { parse } from '@mycelia/parser'
import { writeFileSync, mkdirSync } from 'fs'

async function generateGraph() {
  const { graph } = await parse(['content/**/*.mdx'])
  
  mkdirSync('public/data', { recursive: true })
  writeFileSync('public/data/graph.json', JSON.stringify(graph, null, 2))
  
  console.log(`✓ Generated graph with ${Object.keys(graph.nodes).length} nodes`)
}

generateGraph().catch(console.error)
```

### Step 2: Update Build Script

In `package.json`:
```json
{
  "scripts": {
    "prebuild": "node scripts/generate-graph.mjs",
    "build": "next build",
    "export": "next export"
  }
}
```

### Step 3: Configure Next.js

In `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true }
}

module.exports = nextConfig
```

### Step 4: Use in Component

```typescript
'use client'
import { MyceliaGraphViewer } from '@mycelia/graph'

export default function GraphPage() {
  return (
    <div className="container mx-auto py-8">
      <MyceliaGraphViewer graphUrl="/data/graph.json" />
    </div>
  )
}
```

The graph JSON is now part of your static assets and loads instantly.

## Troubleshooting

### Graph Not Rendering

**Problem:** Canvas appears blank or shows loading indefinitely

**Solutions:**
- Verify graph JSON exists at the specified URL
- Check browser console for fetch errors
- Ensure graph has valid structure (nodes object, edges array)
- Check that parent container has non-zero dimensions

```typescript
// Debug the graph data
useEffect(() => {
  fetch('/data/graph.json')
    .then(res => res.json())
    .then(graph => console.log('Graph loaded:', graph))
    .catch(err => console.error('Graph error:', err))
}, [])
```

### Module Not Found Errors

**Problem:** `Cannot find module 'react-force-graph-2d'`

**Solution:** Install peer dependencies
```bash
bun add react react-dom react-force-graph-2d
```

### Slow Performance

**Problem:** Graph lags when panning/zooming with many nodes

**Solutions:**
- Use type filtering to reduce visible nodes
- Increase initial zoom to show less of the graph
- Consider pagination for very large graphs (1000+ nodes)
- Pre-filter nodes before passing to viewer:

```typescript
const filteredGraph = {
  ...graph,
  nodes: Object.fromEntries(
    Object.entries(graph.nodes).filter(([_, node]) => 
      ['project', 'essay'].includes(node.type)
    )
  )
}
```

### Static Export Fails

**Problem:** `Error: Dynamic Code Evaluation` or fetch errors in static export

**Solution:** Use static JSON imports instead of fetch
```typescript
// ❌ Won't work in static export
const [graph, setGraph] = useState(null)
useEffect(() => {
  fetch('/data/graph.json').then(res => res.json()).then(setGraph)
}, [])

// ✅ Works in static export  
import graphData from '../../public/data/graph.json'
// Note: Current component uses fetch, so this requires modification
```

### SSR Errors with Next.js

**Problem:** `window is not defined` or `document is not defined`

**Solution:** The component already uses `'use client'` and lazy loading. If you still get errors:
```typescript
import dynamic from 'next/dynamic'

const GraphViewer = dynamic(
  () => import('@mycelia/graph').then(mod => ({ default: mod.MyceliaGraphViewer })),
  { ssr: false }
)

export default function GraphPage() {
  return <GraphViewer graphUrl="/data/graph.json" />
}
```

## Examples

### Live Demos

See the graph viewer in action:

- **Portfolio:** `apps/portfolio/src/app/graph/page.tsx` - Full featured graph with navigation
- **Demo:** `apps/demo` - Minimal example with sample content

### CodeSandbox

*Coming soon:* Interactive demo playground

### Example Graphs

**Personal knowledge base (150 nodes):**
- 20 projects
- 50 essays  
- 30 tasks
- 25 people
- 25 tags/meta

**Research collection (300 nodes):**
- 100 papers (references)
- 80 concepts
- 60 authors (people)
- 60 citations/cross-references

## Future Enhancements

### Planned Features

**Custom callbacks:**
```typescript
<MyceliaGraphViewer 
  onNodeClick={(node) => console.log(node)}
  onNodeHover={(node) => setHovered(node)}
  onFilterChange={(types) => setActiveFilters(types)}
/>
```

**Color customization:**
```typescript
<MyceliaGraphViewer 
  colorMap={{
    project: '#ff0000',
    essay: '#00ff00',
    // ... custom colors
  }}
/>
```

**Node clustering:**
Group related nodes for large graphs (1000+ nodes)

**Timeline view:**
Show graph evolution over time using node timestamps

**Search/highlight:**
Search nodes by title and highlight matches in the graph

**Export as image:**
Download graph visualization as PNG/SVG

**3D visualization:**
Optional 3D force graph for very large/complex networks

**Mini-map:**
Overview pane showing full graph with viewport indicator

## Technical Details

### Built With

- **react-force-graph-2d** - Force-directed graph rendering
- **d3-force** - Physics simulation engine
- **Canvas API** - High-performance rendering
- **React Suspense** - Lazy loading for SSR compatibility

### Performance Characteristics

- **Initialization:** ~100-500ms for 500 nodes (varies by CPU)
- **Rendering:** 60 FPS for pan/zoom with <1000 nodes
- **Memory:** ~1-5MB for typical graphs
- **Bundle size:** ~150KB (including dependencies)

### Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Requires ES2020 support and Canvas API.

## Contributing

Found a bug or have a feature request? Open an issue on GitHub.

**Development setup:**
```bash
git clone https://github.com/yourusername/mycelia
cd mycelia/packages/graph
bun install
bun run dev
```

## License

MIT

---

**Version:** 0.1.0  
**Author:** Tom  
**Repository:** [mycelia](https://github.com/yourusername/mycelia)
