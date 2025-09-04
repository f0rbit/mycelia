import fs from 'fs'
import path from 'path'
import { markdown } from '@mycelia/parser'
import type { MyceliaGraph, RenderableTree } from '@mycelia/core'

const EXAMPLES_DIR = path.join(process.cwd(), '../../examples')
const GRAPH_CACHE_PATH = path.join(process.cwd(), '../../.mycelia/graph.json')
const RENDER_CACHE_PATH = path.join(process.cwd(), '../../.mycelia/renderable.json')

// Cache for the complete graph and render tree
let cachedGraph: MyceliaGraph | null = null
let cachedRenderTree: RenderableTree | null = null

/**
 * Load the complete knowledge graph from all examples
 */
export async function loadCompleteGraph(): Promise<MyceliaGraph> {
  if (cachedGraph) return cachedGraph

  // Try loading from pre-generated graph.json first
  if (fs.existsSync(GRAPH_CACHE_PATH)) {
    const graphData = JSON.parse(fs.readFileSync(GRAPH_CACHE_PATH, 'utf8'))
    cachedGraph = graphData
    return cachedGraph!
  }

  // Fallback: parse all examples
  const exampleFiles = [
    'developer-journey.mdx',
    'project-portfolio.mdx', 
    'blog-content.mdx',
    'learning-resources.mdx'
  ].map(f => path.join(EXAMPLES_DIR, f))

  const result = await markdown.parse(exampleFiles)
  cachedGraph = result.graph
  return cachedGraph
}

/**
 * Get a single node by ID with context (simplified)
 */
export async function loadNode(nodeId: string) {
  const graph = await loadCompleteGraph()
  const node = graph.nodes[nodeId]
  
  if (!node) {
    return null
  }

  // Find all edges involving this node
  const inboundEdges = graph.edges.filter(edge => edge.to === nodeId)
  
  // Get nodes that reference this one (backlinks) - exclude containment edges
  const backlinks = inboundEdges
    .filter(edge => edge.type === 'references')
    .map(edge => graph.nodes[edge.from])
    .filter(Boolean)

  // Also get nodes that contain references to this node
  const mentionBacklinks = Object.values(graph.nodes)
    .filter(n => 
      ('content' in n && n.content?.includes(nodeId)) ||
      ('value' in n && n.value?.includes(nodeId))
    )
    .filter(n => n.id !== nodeId) // Don't include self

  const allBacklinks = [...backlinks, ...mentionBacklinks]
    .filter((node, index, arr) => arr.findIndex(n => n.id === node.id) === index) // Dedupe

  return {
    node,
    backlinks: allBacklinks,
    breadcrumbs: await buildBreadcrumbs(nodeId, graph)
  }
}

/**
 * Load the complete render tree
 */
async function loadRenderTree() {
  if (cachedRenderTree) return cachedRenderTree

  // Try loading from pre-generated renderable.json
  if (fs.existsSync(RENDER_CACHE_PATH)) {
    const renderData = JSON.parse(fs.readFileSync(RENDER_CACHE_PATH, 'utf8'))
    cachedRenderTree = renderData
    return cachedRenderTree!
  }

  // Fallback: parse all examples
  const exampleFiles = [
    'developer-journey.mdx',
    'project-portfolio.mdx', 
    'blog-content.mdx',
    'learning-resources.mdx'
  ].map(f => path.join(EXAMPLES_DIR, f))

  const result = await markdown.parse(exampleFiles)
  cachedRenderTree = result.renderTree
  return cachedRenderTree!
}

/**
 * Recursively find a node in the render tree
 */
function findNodeInRenderTree(tree: any, nodeId: string): any {
  if (tree.id === nodeId) {
    return tree
  }
  
  if (tree.children) {
    for (const child of tree.children) {
      const found = findNodeInRenderTree(child, nodeId)
      if (found) return found
    }
  }
  
  return null
}

/**
 * Get all nodes of a specific type
 */
export async function loadNodesByType(nodeType: string) {
  const graph = await loadCompleteGraph()
  const nodes = Object.values(graph.nodes).filter(node => node.type === nodeType)
  return nodes.sort((a, b) => (a.attributes?.title || a.id).localeCompare(b.attributes?.title || b.id))
}

/**
 * Get all available node types with counts
 */
export async function getNodeTypes() {
  const graph = await loadCompleteGraph()
  const typeCount: Record<string, number> = {}
  
  Object.values(graph.nodes).forEach(node => {
    typeCount[node.type] = (typeCount[node.type] || 0) + 1
  })

  return Object.entries(typeCount)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Build breadcrumb navigation for a node
 */
async function buildBreadcrumbs(nodeId: string, graph: MyceliaGraph): Promise<Array<{id: string, title: string}>> {
  const breadcrumbs: Array<{id: string, title: string}> = []
  let currentId = nodeId

  // Walk up the containment hierarchy
  while (currentId) {
    const node = graph.nodes[currentId]
    if (!node) break

    breadcrumbs.unshift({
      id: currentId,
      title: node.attributes?.title || node.attributes?.name || currentId
    })

    // Find parent (node that contains this one)
    const parentEdge = graph.edges.find(edge => 
      edge.to === currentId && edge.type === 'contains'
    )
    currentId = parentEdge?.from || ''
  }

  return breadcrumbs
}

/**
 * Search nodes by title, content, or attributes
 */
export async function searchNodes(query: string, nodeType?: string) {
  const graph = await loadCompleteGraph()
  const searchLower = query.toLowerCase()
  
  const matchingNodes = Object.values(graph.nodes).filter(node => {
    // Type filter
    if (nodeType && node.type !== nodeType) return false
    
    // Text search in various fields
    const searchFields = [
      node.id,
      node.attributes?.title,
      node.attributes?.name,
      node.type,
      'value' in node ? node.value : '',
      'content' in node ? node.content : ''
    ].filter(Boolean).join(' ').toLowerCase()
    
    return searchFields.includes(searchLower)
  })

  return matchingNodes.slice(0, 50) // Limit results
}

/**
 * Legacy function for backwards compatibility
 */
export async function loadExample(filename: string) {
  const filePath = path.join(EXAMPLES_DIR, `${filename}.mdx`)
  const content = fs.readFileSync(filePath, 'utf8')
  
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