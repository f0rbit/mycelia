'use client'

import { useEffect, useState, useCallback } from 'react'
import type { MyceliaGraph, MyceliaNode } from '@mycelia/core'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// Dynamically import ForceGraph2D to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px] border border-gray-200 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">Loading graph visualization...</p>
      </div>
    </div>
  )
})

interface GraphNode {
  id: string
  name: string
  type: string
  group: string
  val: number
  color: string
  node: MyceliaNode
}

interface GraphLink {
  source: string
  target: string
  type: string
}

interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

export default function GraphPage() {
  const [graph, setGraph] = useState<MyceliaGraph | null>(null)
  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set())
  const [highlightNodes, setHighlightNodes] = useState(new Set())
  const [highlightLinks, setHighlightLinks] = useState(new Set())

  useEffect(() => {
    async function loadGraph() {
      try {
        const response = await fetch('/.mycelia/graph.json')
        if (!response.ok) {
          throw new Error(`Failed to load graph: ${response.status} ${response.statusText}`)
        }
        
        const data = await response.json()
        console.log('Successfully loaded graph with', Object.keys(data.nodes).length, 'nodes')
        setGraph(data)
        
        // Convert to force graph format
        const forceGraphData = convertToForceGraphData(data)
        setGraphData(forceGraphData)
      } catch (err) {
        console.error('Error loading graph:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    loadGraph()
  }, [])

  const getNodeColor = (type: string) => {
    const colors: Record<string, string> = {
      person: '#3b82f6',      // blue
      project: '#10b981',     // green
      skill: '#f59e0b',       // amber
      task: '#ef4444',        // red
      research: '#8b5cf6',    // purple
      essay: '#06b6d4',       // cyan
      note: '#6b7280',        // gray
      tag: '#ec4899',         // pink
      portfolio: '#059669',   // emerald
    }
    return colors[type] || '#6b7280'
  }

  const getNodeSize = (node: MyceliaNode) => {
    // Size based on connections and importance
    if (node.type === 'portfolio') return 8
    if (node.type === 'project') return 6
    if (node.type === 'person') return 5
    return 3
  }

  const getNodeLabel = (node: MyceliaNode) => {
    if ('title' in node.attributes && node.attributes.title) return node.attributes.title
    if ('name' in node.attributes && node.attributes.name) return node.attributes.name
    if ('value' in node && node.value) return node.value
    return node.id
  }

  const convertToForceGraphData = (myceliaGraph: MyceliaGraph): GraphData => {
    const nodes: GraphNode[] = Object.values(myceliaGraph.nodes).map(node => ({
      id: node.id,
      name: getNodeLabel(node),
      type: node.type,
      group: node.type,
      val: getNodeSize(node),
      color: getNodeColor(node.type),
      node: node
    }))

    const links: GraphLink[] = myceliaGraph.edges.map(edge => ({
      source: edge.from,
      target: edge.to,
      type: edge.type
    }))

    return { nodes, links }
  }

  const handleNodeClick = useCallback((node: GraphNode) => {
    console.log('Node clicked:', node.id, node.node)
    // Open node page in new tab
    window.open(`/${node.id}`, '_blank')
  }, [])

  const handleNodeHover = useCallback((node: GraphNode | null) => {
    if (!node) {
      setHighlightNodes(new Set())
      setHighlightLinks(new Set())
      return
    }

    const highlightNodes = new Set([node.id])
    const highlightLinks = new Set()

    // Highlight connected nodes and links
    graphData?.links.forEach((link) => {
      if (link.source === node.id || link.target === node.id) {
        highlightLinks.add(link)
        highlightNodes.add(typeof link.source === 'string' ? link.source : (link.source as any).id)
        highlightNodes.add(typeof link.target === 'string' ? link.target : (link.target as any).id)
      }
    })

    setHighlightNodes(highlightNodes)
    setHighlightLinks(highlightLinks)
  }, [graphData])

  const toggleTypeFilter = (type: string) => {
    const newSelected = new Set(selectedTypes)
    if (newSelected.has(type)) {
      newSelected.delete(type)
    } else {
      newSelected.add(type)
    }
    setSelectedTypes(newSelected)
  }

  const getFilteredData = (): GraphData | null => {
    if (!graphData || selectedTypes.size === 0) return graphData

    const filteredNodes = graphData.nodes.filter(node => selectedTypes.has(node.type))
    const filteredNodeIds = new Set(filteredNodes.map(n => n.id))
    const filteredLinks = graphData.links.filter(link => 
      filteredNodeIds.has(typeof link.source === 'string' ? link.source : (link.source as any).id) &&
      filteredNodeIds.has(typeof link.target === 'string' ? link.target : (link.target as any).id)
    )

    return { nodes: filteredNodes, links: filteredLinks }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading knowledge graph...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-6">
        <div className="border-l-4 border-red-400 pl-4 py-4 bg-red-50 rounded">
          <h2 className="text-lg font-semibold text-red-800">Error Loading Graph</h2>
          <p className="text-red-700 mt-2">{error}</p>
        </div>
      </div>
    )
  }

  if (!graph || !graphData) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-6">
        <p className="text-muted-foreground">No graph data available.</p>
      </div>
    )
  }

  const nodeTypes = [...new Set(graphData.nodes.map(n => n.type))].sort()
  const filteredData = getFilteredData()

  return (
    <div className="max-w-7xl mx-auto py-8 px-6">
      <header className="space-y-4 pb-6 border-b mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Graph</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Interactive visualization of {graphData.nodes.length} nodes and {graphData.links.length} connections
          </p>
        </div>
      </header>

      {/* Controls */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Filter by type:</span>
          {nodeTypes.map(type => {
            const count = graphData.nodes.filter(n => n.type === type).length
            return (
              <button
                key={type}
                onClick={() => toggleTypeFilter(type)}
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedTypes.has(type) || selectedTypes.size === 0
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: getNodeColor(type) }}
                ></div>
                <span className="capitalize">{type}</span>
                <span className="text-xs opacity-75">({count})</span>
              </button>
            )
          })}
          {selectedTypes.size > 0 && (
            <button
              onClick={() => setSelectedTypes(new Set())}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Show All
            </button>
          )}
        </div>
      </div>

      {/* Graph Visualization */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
        <ForceGraph2D
          graphData={filteredData || { nodes: [], links: [] }}
          nodeAutoColorBy="group"
          nodeColor={(node: any) => node.color}
          nodeVal={(node: any) => node.val}
          nodeLabel={(node: any) => `${node.name} (${node.type})`}
          nodeCanvasObject={(node: any, ctx: any, globalScale: number) => {
            const label = node.name
            const fontSize = 12 / globalScale
            const isHighlighted = highlightNodes.has(node.id)
            
            // Draw node circle
            ctx.beginPath()
            ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI, false)
            ctx.fillStyle = isHighlighted ? node.color : node.color + '80'
            ctx.fill()
            
            // Draw border for highlighted nodes
            if (isHighlighted) {
              ctx.strokeStyle = '#333'
              ctx.lineWidth = 2 / globalScale
              ctx.stroke()
            }
            
            // Draw label
            if (globalScale > 1.5) {
              ctx.textAlign = 'center'
              ctx.textBaseline = 'top'
              ctx.fillStyle = '#333'
              ctx.font = `${fontSize}px Arial`
              ctx.fillText(label, node.x, node.y + node.val + 2)
            }
          }}
          linkColor={() => '#e2e8f0'}
          linkWidth={(link: any) => highlightLinks.has(link) ? 3 : 1}
          linkDirectionalArrowLength={3}
          linkDirectionalArrowRelPos={1}
          onNodeClick={(node: any) => handleNodeClick(node)}
          onNodeHover={(node: any) => handleNodeHover(node)}
          width={1000}
          height={600}
          backgroundColor="#fafafa"
        />
      </div>

      {/* Graph Statistics */}
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <div className="p-3 border border-gray-200 rounded text-center">
          <div className="text-xl font-bold text-gray-800">{filteredData?.nodes.length || 0}</div>
          <div className="text-sm text-gray-600">Visible Nodes</div>
        </div>
        <div className="p-3 border border-gray-200 rounded text-center">
          <div className="text-xl font-bold text-gray-800">{filteredData?.links.length || 0}</div>
          <div className="text-sm text-gray-600">Visible Links</div>
        </div>
        <div className="p-3 border border-gray-200 rounded text-center">
          <div className="text-xl font-bold text-gray-800">{graphData.nodes.length}</div>
          <div className="text-sm text-gray-600">Total Nodes</div>
        </div>
        <div className="p-3 border border-gray-200 rounded text-center">
          <div className="text-xl font-bold text-gray-800">{graphData.links.length}</div>
          <div className="text-sm text-gray-600">Total Links</div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 border border-blue-200 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">How to Explore</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Click</strong> nodes to open their detail pages</li>
          <li>• <strong>Hover</strong> nodes to highlight connections</li>
          <li>• <strong>Drag</strong> to pan, scroll to zoom</li>
          <li>• <strong>Filter</strong> by content type using buttons above</li>
          <li>• <strong>Larger nodes</strong> represent more important content</li>
        </ul>
      </div>

      <footer className="mt-8 pt-4 border-t text-sm text-muted-foreground">
        <div className="flex gap-4">
          <Link href="/render-test" className="text-blue-600 hover:underline">
            View Content Rendering
          </Link>
          <Link href="/" className="text-blue-600 hover:underline">
            Back to Home
          </Link>
        </div>
      </footer>
    </div>
  )
}