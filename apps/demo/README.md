# Mycelia Demo

A Next.js 15 demo application showcasing the Mycelia markdown parsing and rendering system.

## Features

- **Static Site Generation**: Fully static, deployable to GitHub Pages
- **Comprehensive Examples**: 4 complete MDX examples with realistic content
- **Enhanced Link Components**: Custom link rendering for different relationship types
- **Responsive Design**: Built with Tailwind CSS and shadcn/ui components
- **Parse Statistics**: Shows node counts, edge counts, and parsing warnings

## Pages

- **Developer Journey**: Complete programming journey from Scratch to professional development
- **Project Portfolio**: Projects like Chamber, Burning Blends, Arena, and GM-Server
- **Blog Content**: Technical blog posts and writing on development topics
- **Learning Resources**: Skills, books, and learning methodology documentation

## Development

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Export static site
bun run export
```

## Architecture

- **Parser**: `@mycelia/parser` processes MDX files into knowledge graphs
- **Renderer**: `@mycelia/render` converts parsed content into React components
- **Custom Components**: Enhanced link components for different relationship types
- **Static Export**: Ready for deployment to GitHub Pages or any static host

## Technology Stack

- Next.js 15.5.2 with React 19
- TypeScript with strict mode
- Tailwind CSS for styling
- shadcn/ui components
- Lucide React icons
- Static export configuration