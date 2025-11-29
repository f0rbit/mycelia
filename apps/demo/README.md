# Mycelia Simple Demo

A minimal, easy-to-understand demo of Mycelia's core features.

## What's Included

- **~20 pages** of simple, interconnected content
- **5 MDX files** demonstrating semantic tags
- **Basic graph generation** showing nodes and edges
- **Clean, minimal UI** focused on learning
- **Real-time stats** showing your knowledge graph

## Running the Demo

### Option 1: Static Export (Recommended)
```bash
cd apps/demo
bun install
bun run build      # Builds static site to 'out/' directory
npx serve out -p 3001
```

Visit http://localhost:3001

This is the **recommended** approach as it's fast, stable, and shows exactly what gets deployed.

### Option 2: Development Server
```bash
bun run dev        # Starts Next.js dev server
```

Visit http://localhost:3001

**Note**: The dev server may be slower due to workspace package transpilation. For the best experience, use the static export method above.

## Content Structure

```
content/
├── index.mdx              # Homepage with Hello World project
├── getting-started.mdx    # Complete guide to Mycelia basics
├── examples.mdx           # Practical examples (projects, tasks, people)
├── advanced-features.mdx  # Custom types, queries, renderers
└── about.mdx              # About page with team info
```

## What You'll Learn

### 1. Semantic Tags
Learn to use built-in tags like:
- `<Project>` - Organize work into projects
- `<Task>` - Track tasks with priorities and status
- `<Person>` - Document team members and contributors
- `<Essay>` - Write long-form content
- `<Skill>` - Track skills and proficiency levels

### 2. Graph Structure
See how Mycelia automatically:
- Creates nodes from semantic tags
- Builds parent-child relationships from nesting
- Tracks cross-references via `<Link>` tags
- Indexes content by type

### 3. React Rendering
Understand how:
- Custom components render each node type
- The graph data flows through your app
- Styling can be customized per node type

### 4. Navigation
Explore how:
- Content pages are auto-generated from MDX files
- Links between nodes create a network
- The graph enables powerful queries

## Page Count

This demo generates approximately **15-20 pages**:
- 5 main content pages
- Additional pages from nested nodes (tasks, skills, etc.)
- All interconnected via the knowledge graph

## Architecture

```
apps/demo/
├── content/           # MDX files with semantic tags
├── src/
│   ├── app/          # Next.js app router pages
│   │   ├── layout.tsx           # Root layout with nav
│   │   ├── page.tsx             # Homepage with stats
│   │   └── [...slug]/page.tsx   # Dynamic content pages
│   └── components/   # (empty - using inline components)
├── package.json      # Dependencies
└── next.config.js    # Next.js config with static export
```

## Key Features Demonstrated

### Semantic Tags
```mdx
<Project id="my-project" title="My Project" status="active">
  <Task id="task-1" priority="high">
    First task
  </Task>
</Project>
```

### Cross-References
```mdx
Check out the <Link target="getting-started">guide</Link>
```

### Type-based Organization
All nodes are automatically indexed by type (Project, Task, Person, etc.)

### Parent-Child Relationships
Nested tags create automatic hierarchies (Project → Task)

## Customization

### Add New Content
Create a new `.mdx` file in `content/`:

```mdx
# My New Page

<Project id="new-project" title="New Project">
  Content goes here...
</Project>
```

### Custom Styling
Edit `src/app/globals.css` to change the look and feel.

### Custom Components
Modify `src/app/[...slug]/page.tsx` to customize how nodes render.

## Next Steps

Once you understand this demo:

1. **Explore the Portfolio App** - Check out `apps/portfolio` for a comprehensive example with ~947 pages
2. **Build Your Own** - Use this as a template for your own knowledge base
3. **Extend It** - Add custom node types, queries, and features
4. **Deploy It** - Run `bun run build` to generate a static site

## Comparison: Demo vs Portfolio

| Feature | Demo | Portfolio |
|---------|------|-----------|
| Pages | ~20 | ~947 |
| Complexity | Simple | Comprehensive |
| Purpose | Learning | Real-world showcase |
| Time to understand | <30 min | Several hours |

Start here, then explore the portfolio app!

## Technical Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **MDX** - Markdown with JSX components
- **@mycelia/parser** - Parse MDX into knowledge graphs
- **@mycelia/core** - Graph data structures
- **@mycelia/render** - React rendering components

## Commands

```bash
# Development server (port 3001)
bun run dev

# Production build (static export)
bun run build

# Start production server
bun run start
```

## Learn More

- [Mycelia Documentation](https://github.com/mycelia)
- [Next.js Documentation](https://nextjs.org/docs)
- [MDX Documentation](https://mdxjs.com)

## License

MIT
