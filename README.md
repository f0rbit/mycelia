# Mycelia

A markdown-based engine for creating deeply-linked project websites (digital gardens).

## Overview

Mycelia is a TypeScript framework that parses markdown files with semantic tags and generates both a comprehensive graph representation and optimized renderable trees. It's designed for building interconnected content systems like digital gardens, project documentation, and creative portfolios.

## Architecture

### Core Packages

- **@mycelia/core** - Foundational types and primitives (Leaf, Branch, Trunk, Link, Meta)
- **@mycelia/parser** - Unified parser with markdown and future typst support
- **@mycelia/cli** - Command line tools for parsing and building

### Key Features

- **Primitive-based Architecture**: All content maps to core structural primitives
- **Dual Parser Output**: 
  - JSON graph representation for storage/API
  - Renderable trees for component frameworks
- **Bi-directional Links**: Automatic forward and backward relationship tracking
- **Extensible Tag Registry**: Custom semantic tags map to primitives

## Quick Start

### Installation

```bash
bun install
```

### Build Packages

```bash
bun run build
```

### Parse Content

```bash
# Parse example files
node packages/cli/dist/cli.js parse "examples/*.md"

# Parse your own content
node packages/cli/dist/cli.js parse "content/**/*.md"
```

## Content Format

Use semantic tags in markdown to create structured content:

```markdown
<Project name="My Project" id="my-project" status="wip">
  <Date of="2025-01-01" duration="120">
    Started working on the new feature.
  </Date>

  <Research id="background-research">
    Researched existing solutions and found <Book id="design-patterns">Design Patterns</Book>.
  </Research>

  <Person id="collaborator">Jane Smith</Person>
  <Tag>web-development</Tag>
</Project>
```

## Output

The parser generates:

- **`.mycelia/graph.json`** - Complete graph with nodes, edges, and indexes
- **`.mycelia/renderable.json`** - Optimized tree for rendering components

## Development

Built with:
- **Runtime**: Bun
- **Language**: TypeScript
- **Parsing**: unified/remark/MDX ecosystem

See `plan.md` for detailed architecture and roadmap.
