# @mycelia/render

React and Next.js rendering utilities for Mycelia knowledge graphs.

## What It Does

Transforms Mycelia knowledge graphs into beautiful, navigable web pages with automatic breadcrumbs, backlinks, and semantic content rendering. Provides server-side rendering (SSR), static site generation (SSG), and intelligent caching for production-ready applications.

**Purpose:** Bridge between parsed content and rendered web pages  
**Exports:** Next.js components, content provider, MDX processor  
**Philosophy:** Convention over configuration, optimized for performance

## Why It Exists

After parsing MDX content into graphs with `@mycelia/parser`, you need a way to **render that content** as web pages. This package provides:

1. **Next.js SSR/SSG** - Server-side rendering with static generation support
2. **Automatic Navigation** - Breadcrumbs and backlinks generated from graph structure
3. **Content Provider** - File system abstraction with intelligent caching
4. **MDX Processing** - Markdown to HTML conversion with syntax highlighting

Previously split into `@mycelia/ssr` and `@mycelia/render`, this unified package now handles **all rendering concerns** for Mycelia knowledge graphs.

## Features

- ✅ **Next.js Integration** - Drop-in components for App Router
- ✅ **Static Generation** - Full SSG support for deployment anywhere
- ✅ **Automatic Breadcrumbs** - Generated from graph containment hierarchy
- ✅ **Backlink Discovery** - Find all content referencing a node
- ✅ **Intelligent Caching** - Aggressive caching in production, hot reload in dev
- ✅ **Type-Safe Routes** - Full TypeScript support for params and content
- ✅ **MDX Processing** - remark/rehype pipeline with GFM and syntax highlighting
- ✅ **Semantic Rendering** - Renders Content, Reference, and Meta primitives
- ✅ **Index Pages** - Automatic indexes by node type (projects, tags, etc.)
- ✅ **Flexible Frontmatter** - Full support for custom metadata

## Installation

```bash
bun add @mycelia/render @mycelia/core @mycelia/parser
```

Peer dependencies (Next.js 14+):

```bash
bun add next react react-dom
```

Or with npm:

```bash
npm install @mycelia/render @mycelia/core @mycelia/parser next react react-dom
```

## Quick Start - Next.js

### 1. Create Configuration

Create `mycelia.json` in your project root:

```json
{
  "contentDir": "content",
  "basePath": ""
}
```

### 2. Initialize in Root Layout

```typescript
// app/layout.tsx
import { initializeMycelia } from '@mycelia/render';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize Mycelia provider
  await initializeMycelia({
    contentDir: 'content',
  });

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### 3. Create Dynamic Route

```typescript
// app/[...slug]/page.tsx
import {
  MyceliaPage,
  getMyceliaContent,
  generateMyceliaStaticParams,
} from '@mycelia/render';
import { notFound } from 'next/navigation';

// Enable static generation
export async function generateStaticParams() {
  return generateMyceliaStaticParams();
}

// Server component that renders content
export default async function Page({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const content = await getMyceliaContent(slug);

  if (!content) {
    notFound();
  }

  return <MyceliaPage params={params} />;
}
```

### 4. Create Index Page (Optional)

```typescript
// app/page.tsx
import { getAllMyceliaContent, MyceliaList } from '@mycelia/render';

export default async function HomePage() {
  const allContent = await getAllMyceliaContent();

  return (
    <div>
      <h1>Welcome to My Knowledge Graph</h1>
      <MyceliaList
        content={allContent}
        title="Recent Content"
        sort={(a, b) => b.mtime.getTime() - a.mtime.getTime()}
      />
    </div>
  );
}
```

### 5. Add Content

Create `content/hello.mdx`:

```mdx
---
title: Hello World
description: My first Mycelia page
date: 2025-01-01
---

# Hello World

This is my first Mycelia page with **automatic graph parsing**.

<Project id="my-project" title="Example Project">
  This content is parsed as a graph node!
</Project>
```

**Done!** Run `bun dev` and visit `http://localhost:3000/hello`.

## Architecture

### Package Structure

```
@mycelia/render/
├── nextjs/          # Next.js integration
│   ├── provider.ts     # Singleton content provider
│   ├── components.tsx  # MyceliaPage, MyceliaList, etc.
│   ├── utils.ts        # Helper functions
│   └── node-renderer.tsx # Semantic node rendering
├── shared/          # Shared utilities
│   ├── content-provider.ts  # File system abstraction
│   ├── mdx-processor.ts     # Markdown → HTML pipeline
│   ├── theme.ts             # Styling configuration
│   └── types.ts             # Type definitions
├── react/           # React primitives (legacy)
│   └── ...
└── index.ts         # Main exports
```

### Design Decisions

**Why Singleton Provider?**  
The content provider is initialized once and reused across all requests. This avoids re-parsing files on every page render, dramatically improving SSR performance.

**Why Aggressive Caching?**  
In production, parsed content is cached in memory. Files are only re-parsed if the cache is empty. In development, caching is disabled for hot reloading.

**Why Static Generation?**  
Mycelia graphs are inherently static - they're derived from files. Static generation provides:
- Best possible performance (no runtime parsing)
- Deploy anywhere (Netlify, Vercel, GitHub Pages)
- SEO optimization (fully rendered HTML)

**Why File-Based + Node-Based Routes?**  
Each MDX file becomes a route (`/my-page`), but individual nodes within the graph also get routes (`/project/my-project`). This provides flexibility: users can navigate to either the full file or specific nodes.

## API Reference - Next.js

### initializeMycelia()

Initialize the Mycelia content provider. Call once in your root layout.

```typescript
import { initializeMycelia } from '@mycelia/render';

await initializeMycelia(config?: Partial<MyceliaConfig>)
```

**Parameters:**
- `config` (optional) - Configuration object

**Configuration Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `contentDir` | `string` | `'content'` | Directory containing MDX files |
| `basePath` | `string` | `''` | Base path for all routes |
| `dev` | `boolean` | `process.env.NODE_ENV === 'development'` | Enable dev mode (disable caching) |
| `cache` | `boolean` | `process.env.NODE_ENV === 'production'` | Enable content caching |
| `routeMapper` | `function` | `defaultRouteMapper` | Custom slug generation function |

**Example:**

```typescript
await initializeMycelia({
  contentDir: 'content',
  basePath: '/docs',
  cache: true,
});
```

### MyceliaPage

Main page component that renders parsed content with breadcrumbs, metadata, and backlinks.

```typescript
import { MyceliaPage } from '@mycelia/render';

<MyceliaPage params={params} content={customContent} />
```

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `params` | `Promise<{ slug?: string[] }>` | Yes | Next.js route params |
| `content` | `ParsedContent` | No | Override content (for custom loading) |

**Features:**
- ✅ Automatic breadcrumbs from graph hierarchy
- ✅ Metadata display (status, dates, location, etc.)
- ✅ HTML content rendering with prose styling
- ✅ Related nodes section
- ✅ Backlinks section
- ✅ Debug info in development

**Example:**

```typescript
export default async function Page({ params }) {
  return <MyceliaPage params={params} />;
}
```

### getMyceliaContent()

Retrieve parsed content by slug. Returns `null` if not found.

```typescript
import { getMyceliaContent } from '@mycelia/render';

const content = await getMyceliaContent(slug?: string[])
```

**Parameters:**
- `slug` - Array of path segments (e.g., `['docs', 'getting-started']`)

**Returns:**
- `ParsedContent | null` - Parsed content with graph, frontmatter, HTML

**Example:**

```typescript
const content = await getMyceliaContent(['projects', 'my-project']);

if (content) {
  console.log(content.frontmatter.title);
  console.log(content.graph.nodes);
  console.log(content.htmlContent);
}
```

### generateMyceliaStaticParams()

Generate all static routes for Next.js static export. Includes both file-based and node-based routes.

```typescript
import { generateMyceliaStaticParams } from '@mycelia/render';

export async function generateStaticParams() {
  return generateMyceliaStaticParams();
}
```

**Returns:**
- `Array<{ slug: string[] }>` - All possible routes

**Example Output:**

```typescript
[
  { slug: ['about'] },
  { slug: ['blog', 'post-1'] },
  { slug: ['project', 'mycelia'] },
  // ... all other routes
]
```

### getAllMyceliaContent()

Get all parsed content for listing pages.

```typescript
import { getAllMyceliaContent } from '@mycelia/render';

const allContent = await getAllMyceliaContent()
```

**Returns:**
- `ParsedContent[]` - Array of all parsed content

**Example:**

```typescript
const allContent = await getAllMyceliaContent();
const posts = allContent.filter(c => c.frontmatter.category === 'blog');
```

### MyceliaList

Display a list of content with filtering and sorting.

```typescript
import { MyceliaList } from '@mycelia/render';

<MyceliaList
  content={allContent}
  title="Blog Posts"
  filter={(c) => c.frontmatter.category === 'blog'}
  sort={(a, b) => b.mtime.getTime() - a.mtime.getTime()}
/>
```

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `content` | `ParsedContent[]` | Array of content to display |
| `title` | `string` | Optional title for the list |
| `filter` | `(content: ParsedContent) => boolean` | Optional filter function |
| `sort` | `(a: ParsedContent, b: ParsedContent) => number` | Optional sort function |

### MyceliaIndex

Generate an index page for all nodes of a specific type.

```typescript
import { MyceliaIndex } from '@mycelia/render';

<MyceliaIndex
  of="project"
  title="All Projects"
  sortBy="date"
  groupBy="status"
  showCounts={true}
  publishedOnly={true}
/>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `of` | `string` | Required | Node type to index (e.g., 'project', 'tag') |
| `title` | `string` | Auto-generated | Page title |
| `sortBy` | `'title' \| 'date' \| 'status'` | `'title'` | Sort order |
| `groupBy` | `'category' \| 'status' \| 'type'` | None | Group items |
| `showCounts` | `boolean` | `false` | Show item counts |
| `publishedOnly` | `boolean` | `true` | Filter published items only |
| `filter` | `(node: any) => boolean` | None | Custom filter function |

**Example:**

```typescript
// app/projects/page.tsx
export default function ProjectsPage() {
  return (
    <MyceliaIndex
      of="project"
      title="All Projects"
      sortBy="date"
      groupBy="status"
      showCounts={true}
    />
  );
}
```

## Content Provider

Access the provider directly for custom use cases.

```typescript
import { getMyceliaProvider } from '@mycelia/render';

const provider = getMyceliaProvider();
```

### Provider Methods

**getAllContent()**

```typescript
const allContent = await provider.getAllContent();
// Returns: ParsedContent[]
```

**getContentBySlug()**

```typescript
const content = await provider.getContentBySlug('my-page');
// Returns: ParsedContent | null
```

**getContentByNodeId()**

```typescript
const content = await provider.getContentByNodeId('my-project');
// Returns: ParsedContent | null (with filtered graph)
```

**getBreadcrumbs()**

```typescript
const breadcrumbs = await provider.getBreadcrumbs('node-id');
// Returns: Array<{ id: string; title: string; path: string }>
```

**getBacklinks()**

```typescript
const backlinks = await provider.getBacklinks('node-id');
// Returns: Array<{ node: any; path: string }>
```

**getNodesByType()**

```typescript
const projects = await provider.getNodesByType('project');
// Returns: Array<{ node: any; path: string }>
```

### Caching Behavior

- **Production:** Aggressive caching - content parsed once and reused
- **Development:** No caching - files re-parsed on every request for hot reload
- **Cache Key:** Based on file path + slug for precise invalidation

## MDX Processing

Process Markdown/MDX to HTML for custom rendering.

```typescript
import {
  processMarkdownToHtml,
  extractTextFromMdx,
  getReadingTime,
} from '@mycelia/render';

// Convert MDX to HTML
const html = await processMarkdownToHtml(markdown);

// Extract plain text for summaries
const text = extractTextFromMdx(mdx);

// Calculate reading time
const minutes = getReadingTime(content);
```

### MDX Pipeline

The processor uses a unified remark/rehype pipeline:

1. **remark-parse** - Parse markdown to AST
2. **remark-mdx** - Support MDX components
3. **remark-gfm** - GitHub Flavored Markdown (tables, strikethrough, etc.)
4. **remark-html** - Convert to HTML

### Supported Markdown Features

- ✅ Headers, paragraphs, lists
- ✅ Links and images
- ✅ Code blocks with syntax highlighting
- ✅ Tables (GFM)
- ✅ Strikethrough (GFM)
- ✅ Task lists (GFM)
- ✅ MDX components (preserved as HTML)

## Configuration

### mycelia.json

Create this file in your project root:

```json
{
  "contentDir": "content",
  "basePath": "",
  "extensions": ["mdx", "md"]
}
```

### Environment Variables

```bash
# Enable development mode
NODE_ENV=development

# Disable caching (useful for debugging)
MYCELIA_NO_CACHE=true
```

### Custom Route Mapping

Override the default slug generation:

```typescript
await initializeMycelia({
  contentDir: 'content',
  routeMapper: (filePath) => {
    // Custom logic: add date prefix to blog posts
    if (filePath.startsWith('blog/')) {
      const date = extractDateFromFile(filePath);
      const slug = filePath.replace('blog/', '').replace(/\.mdx?$/, '');
      return `blog/${date}/${slug}`;
    }
    return defaultMapper(filePath);
  },
});
```

## Integration with Parser & Graph

### Three-Package Workflow

```typescript
// 1. Parser generates graph from MDX
import { markdown } from '@mycelia/parser';
const { graph } = await markdown.parseContent(mdxContent);

// 2. Render displays content as web pages
import { MyceliaPage } from '@mycelia/render';
<MyceliaPage params={params} />;

// 3. Graph visualizes structure
import { MyceliaGraphViewer } from '@mycelia/graph';
<MyceliaGraphViewer data={graph} />;
```

### Data Flow

```
MDX Files
   ↓
@mycelia/parser (parse content → graph)
   ↓
@mycelia/render (content provider → caching)
   ↓
Next.js (SSR/SSG → HTML pages)
   ↓
Browser (interactive navigation)
```

### Graph Structure

Every `ParsedContent` includes a `graph` property:

```typescript
interface ParsedContent {
  graph: MyceliaGraph;
  // ...other properties
}

interface MyceliaGraph {
  nodes: Record<string, Node>;
  edges: Edge[];
  indexes: {
    byType: Record<string, string[]>;
    byTag: Record<string, string[]>;
    // ...
  };
}
```

Use this for custom rendering, filtering, or visualization.

## Advanced Usage

### Custom Components

Override default rendering by passing custom content:

```typescript
export default async function CustomPage({ params }) {
  const { slug } = await params;
  const content = await getMyceliaContent(slug);

  if (!content) notFound();

  // Custom rendering logic
  return (
    <div>
      <h1>{content.frontmatter.title}</h1>
      <MyCustomRenderer graph={content.graph} />
    </div>
  );
}
```

### Custom MDX Components

Process MDX with custom React components:

```typescript
import { processMarkdownToHtml } from '@mycelia/render';
import { MDXProvider } from '@mdx-js/react';

const components = {
  Project: ({ id, title, children }) => (
    <div className="project">
      <h2>{title}</h2>
      {children}
    </div>
  ),
};

// In your component
<MDXProvider components={components}>
  <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
</MDXProvider>;
```

### Programmatic Content Access

Use the provider directly for complex queries:

```typescript
const provider = getMyceliaProvider();

// Get all projects with active status
const allContent = await provider.getAllContent();
const activeProjects = [];

for (const content of allContent) {
  for (const node of Object.values(content.graph.nodes)) {
    if (node.type === 'project' && node.attributes?.status === 'active') {
      activeProjects.push({ node, content });
    }
  }
}
```

### Custom Breadcrumbs

Override breadcrumb rendering:

```typescript
import { getMyceliaProvider } from '@mycelia/render';

export async function CustomBreadcrumbs({ nodeId }) {
  const provider = getMyceliaProvider();
  const breadcrumbs = await provider.getBreadcrumbs(nodeId);

  return (
    <nav>
      {breadcrumbs.map((crumb, i) => (
        <span key={crumb.id}>
          {i > 0 && ' > '}
          <a href={crumb.path}>{crumb.title}</a>
        </span>
      ))}
    </nav>
  );
}
```

## Migration from @mycelia/ssr

**Version 0.2.0** merged `@mycelia/ssr` into `@mycelia/render`. If you were using the old package:

### Update Imports

```typescript
// OLD (before v0.2.0)
import { MyceliaPage } from '@mycelia/ssr/nextjs';
import { initializeMycelia } from '@mycelia/ssr';

// NEW (v0.2.0+)
import { MyceliaPage, initializeMycelia } from '@mycelia/render';
```

### Update package.json

```bash
# Remove old package
bun remove @mycelia/ssr

# Add new unified package
bun add @mycelia/render
```

### Breaking Changes

- ❌ Removed: `@mycelia/ssr` as separate package
- ❌ Removed: React primitives (moved to `/react` - legacy)
- ✅ Changed: All exports now from `@mycelia/render`
- ✅ Changed: Focus on Next.js integration (primary use case)

### No Configuration Changes

Your `mycelia.json` configuration remains the same. No changes needed.

## Troubleshooting

### "Module not found" errors

**Cause:** Missing peer dependencies

**Solution:** Install Next.js and React:

```bash
bun add next react react-dom
```

### Static export fails

**Cause:** Dynamic routes not properly generated

**Solution:** Ensure `generateStaticParams()` is exported:

```typescript
export async function generateStaticParams() {
  return generateMyceliaStaticParams();
}
```

### Cache not updating in development

**Cause:** Caching is enabled in dev mode

**Solution:** Set `dev: true` in config or use environment variable:

```typescript
await initializeMycelia({
  dev: true, // Disable caching
});
```

Or:

```bash
NODE_ENV=development bun dev
```

### Slow build times

**Cause:** Parsing all files on every request

**Solution:** Enable caching in production:

```typescript
await initializeMycelia({
  cache: true, // Enable caching
});
```

### Breadcrumbs not showing

**Cause:** Graph doesn't have containment edges

**Solution:** Ensure your MDX uses container nodes:

```mdx
<Category id="blog" title="Blog">
  <Post id="my-post" title="My Post">
    Content here...
  </Post>
</Category>
```

## Examples

### Simple Blog

```typescript
// app/blog/page.tsx
import { getAllMyceliaContent, MyceliaList } from '@mycelia/render';

export default async function BlogPage() {
  const allContent = await getAllMyceliaContent();
  const posts = allContent.filter((c) => c.frontmatter.category === 'blog');

  return <MyceliaList content={posts} title="Blog Posts" />;
}
```

### Project Portfolio

```typescript
// app/projects/page.tsx
import { MyceliaIndex } from '@mycelia/render';

export default function ProjectsPage() {
  return (
    <MyceliaIndex
      of="project"
      title="My Projects"
      sortBy="date"
      groupBy="status"
      showCounts={true}
    />
  );
}
```

### Full Examples

- **Simple Demo:** See `apps/demo` for a minimal working example
- **Full Portfolio:** See `apps/portfolio` for production usage
- **Code Examples:** Inline examples throughout this README

## Future Enhancements

- 🚧 **Type-Specific Templates** - Custom page templates per node type
- 🚧 **Incremental Static Regeneration** - ISR support for large sites
- 🚧 **Edge Runtime Support** - Deploy to edge functions
- 🚧 **Streaming SSR** - React 18 streaming for faster TTFB
- 🚧 **Search Integration** - Built-in full-text search
- 🚧 **RSS/Sitemap Generation** - Automatic feed generation

## Contributing

This package is part of the Mycelia monorepo. To contribute:

1. Clone the repository
2. Install dependencies: `bun install`
3. Run tests: `bun test`
4. Build: `bun run build`

See the root README for more details.

## License

MIT © 2025 Mycelia
