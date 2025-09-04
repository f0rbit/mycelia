import fs from 'fs'
import path from 'path'
import { markdown } from '@mycelia/parser'

const EXAMPLES_DIR = path.join(process.cwd(), '../../examples')

export async function loadExample(filename: string) {
  const filePath = path.join(EXAMPLES_DIR, `${filename}.mdx`)
  const content = fs.readFileSync(filePath, 'utf8')
  
  // Parse the markdown file using the MarkdownParser
  const result = await markdown.parse(filePath)
  
  return {
    content,
    graph: result.graph,
    renderTree: result.renderTree,
    errors: result.errors,
    warnings: result.warnings,
    stats: {
      nodeCount: Object.keys(result.graph.nodes).length,
      edgeCount: result.graph.edges.length,
      warningCount: result.warnings.length,
      errorCount: result.errors.length
    }
  }
}

export function getExamplesList() {
  return [
    {
      id: 'developer-journey',
      title: 'Developer Journey',
      description: 'Complete programming journey from Scratch to professional development'
    },
    {
      id: 'project-portfolio',
      title: 'Project Portfolio',
      description: 'Projects like Chamber, Burning Blends, Arena, and GM-Server'
    },
    {
      id: 'blog-content',
      title: 'Blog Content',
      description: 'Technical blog posts and writing on development topics'
    },
    {
      id: 'learning-resources',
      title: 'Learning Resources',
      description: 'Skills, books, and learning methodology documentation'
    }
  ]
}