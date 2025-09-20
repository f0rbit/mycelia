'use client'

import { useEffect, useRef, useState } from 'react'
import * as cytoscape from 'cytoscape'
// @ts-ignore - no types available
import dagre from 'cytoscape-dagre'
// @ts-ignore - no types available
import coseBilkent from 'cytoscape-cose-bilkent'
import type { MyceliaGraph } from '@mycelia/core'
import type { GraphViewerProps } from '../types'

// Register layout extensions
cytoscape.use(dagre)
cytoscape.use(coseBilkent)

interface CytoscapeGraphProps extends GraphViewerProps {
  layout?: 'dagre' | 'cose-bilkent' | 'circle' | 'grid' | 'breadthfirst'
  nodeSize?: number
  edgeWidth?: number
  interactive?: boolean
  onNodeClick?: (nodeId: string) => void
}

export function CytoscapeGraph({ 
  graphUrl = '/.mycelia/graph.json',
  width = 1000,
  height = 600,
  className = '',
  layout = 'cose-bilkent',
  nodeSize = 30,
  edgeWidth = 2,
  interactive = true,
  onNodeClick
}: CytoscapeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<cytoscape.Core | null>(null)
  const [graph, setGraph] = useState<MyceliaGraph | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set())
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  // Node type colors
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

  // Load graph data
  useEffect(() => {
    async function loadGraph() {
      try {
        const response = await fetch(graphUrl)
        if (!response.ok) {
          throw new Error(`Failed to load graph: ${response.status}`)
        }
        const data = await response.json()
        setGraph(data)
      } catch (err) {
        console.error('Error loading graph:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    loadGraph()
  }, [graphUrl])

  // Initialize Cytoscape
  useEffect(() => {
    if (!containerRef.current || !graph) return

    // Convert Mycelia graph to Cytoscape format
    const elements: cytoscape.ElementDefinition[] = []
    
    // Add nodes
    Object.values(graph.nodes).forEach(node => {
      const label = node.attributes?.title || 
                   node.attributes?.name || 
                   node.attributes?.value ||
                   node.id
      
      elements.push({
        data: {
          id: node.id,
          label: label,
          type: node.type,
          primitive: node.primitive,
          ...node.attributes
        },
        style: {
          'background-color': getNodeColor(node.type),
          'width': nodeSize,
          'height': nodeSize,
          'label': label,
          'text-valign': 'bottom',
          'text-halign': 'center',
          'font-size': '10px',
          'text-margin-y': 5
        }
      })
    })
    
    // Add edges
    graph.edges.forEach((edge, index) => {
      elements.push({
        data: {
          id: `edge-${index}`,
          source: edge.from,
          target: edge.to,
          type: edge.type
        },
        style: {
          'width': edgeWidth,
          'line-color': edge.type === 'contains' ? '#94a3b8' : '#cbd5e1',
          'target-arrow-color': '#94a3b8',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
          'opacity': 0.7
        }
      })
    })

    // Create Cytoscape instance
    const cy = cytoscape({
      container: containerRef.current,
      elements: elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': 'data(background-color)',
            'label': 'data(label)',
            'text-wrap': 'wrap',
            'text-max-width': '80px',
            'overlay-padding': '6px',
            'z-index': 10,
          }
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': 3,
            'border-color': '#1e293b',
            'background-color': 'data(background-color)',
            'z-index': 999
          }
        },
        {
          selector: 'edge',
          style: {
            'width': edgeWidth,
            'curve-style': 'bezier',
            'target-arrow-shape': 'triangle'
          }
        },
        {
          selector: 'edge:selected',
          style: {
            'width': edgeWidth * 2,
            'line-color': '#3b82f6',
            'target-arrow-color': '#3b82f6'
          }
        }
      ],
      layout: getLayoutConfig(layout),
      minZoom: 0.1,
      maxZoom: 3,
      wheelSensitivity: 0.2,
      userZoomingEnabled: interactive,
      userPanningEnabled: interactive,
      boxSelectionEnabled: interactive,
    })

    cyRef.current = cy

    // Event handlers
    if (interactive) {
      // Node click
      cy.on('tap', 'node', (evt: any) => {
        const node = evt.target
        const nodeId = node.data('id')
        if (onNodeClick) {
          onNodeClick(nodeId)
        } else {
          window.open(`/node/${nodeId}`, '_blank')
        }
      })

      // Node hover
      cy.on('mouseover', 'node', (evt: any) => {
        const node = evt.target
        setHoveredNode(node.data('id'))
        
        // Highlight connected edges and nodes
        node.neighborhood().addClass('highlighted')
        node.connectedEdges().addClass('highlighted-edge')
      })

      cy.on('mouseout', 'node', () => {
        setHoveredNode(null)
        cy.elements().removeClass('highlighted highlighted-edge')
      })
    }

    // Cleanup
    return () => {
      cy.destroy()
    }
  }, [graph, layout, nodeSize, edgeWidth, interactive, onNodeClick])

  // Filter by node type
  useEffect(() => {
    if (!cyRef.current) return

    if (selectedTypes.size === 0) {
      // Show all nodes
      cyRef.current.elements().style('display', 'element')
    } else {
      // Hide all first
      cyRef.current.elements().style('display', 'none')
      
      // Show selected types and their edges
      selectedTypes.forEach(type => {
        const nodes = cyRef.current!.nodes(`[type="${type}"]`)
        nodes.style('display', 'element')
        nodes.connectedEdges().style('display', 'element')
      })
    }

    // Re-run layout
    cyRef.current.layout(getLayoutConfig(layout)).run()
  }, [selectedTypes, layout])

  // Layout configuration
  function getLayoutConfig(layoutName: string): cytoscape.LayoutOptions {
    switch (layoutName) {
      case 'dagre':
        return {
          name: 'dagre',
          rankDir: 'TB',
          nodeSep: 50,
          rankSep: 100,
          fit: true,
          padding: 20
        } as any

      case 'cose-bilkent':
        return {
          name: 'cose-bilkent',
          animate: 'end',
          animationDuration: 500,
          nodeRepulsion: 4500,
          idealEdgeLength: 100,
          edgeElasticity: 0.45,
          nestingFactor: 0.1,
          gravity: 0.25,
          numIter: 2500,
          fit: true,
          padding: 20
        } as any

      case 'circle':
        return {
          name: 'circle',
          fit: true,
          padding: 20,
          avoidOverlap: true,
          radius: undefined,
          startAngle: 0,
          sweep: undefined,
          clockwise: true,
          sort: undefined
        }

      case 'breadthfirst':
        return {
          name: 'breadthfirst',
          fit: true,
          directed: true,
          padding: 20,
          circle: false,
          grid: false,
          spacingFactor: 1.25,
          avoidOverlap: true
        }

      default:
        return {
          name: 'grid',
          fit: true,
          padding: 20,
          avoidOverlap: true
        }
    }
  }

  // Toggle type filter
  const toggleTypeFilter = (type: string) => {
    const newSelected = new Set(selectedTypes)
    if (newSelected.has(type)) {
      newSelected.delete(type)
    } else {
      newSelected.add(type)
    }
    setSelectedTypes(newSelected)
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading knowledge graph...</p>
        </div>
      </div>
    )
  }

  if (error || !graph) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <div className="text-center">
          <p className="text-red-600">Error: {error || 'Failed to load graph'}</p>
        </div>
      </div>
    )
  }

  const nodeTypes = [...new Set(Object.values(graph.nodes).map(n => n.type))].filter(Boolean).sort()
  const nodeCount = Object.keys(graph.nodes).length
  const edgeCount = graph.edges.length

  return (
    <div className={className}>
      {/* Controls */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          {nodeTypes.map(type => {
            const count = Object.values(graph.nodes).filter(n => n.type === type).length
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
                />
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
              Clear
            </button>
          )}
        </div>
        
        {/* Layout selector */}
        <div className="mt-3 flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Layout:</span>
          {['cose-bilkent', 'dagre', 'circle', 'breadthfirst'].map(l => (
            <button
              key={l}
              onClick={() => {
                if (cyRef.current) {
                  cyRef.current.layout(getLayoutConfig(l)).run()
                }
              }}
              className={`px-3 py-1 text-sm rounded ${
                layout === l 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {l.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Graph container */}
      <div 
        ref={containerRef}
        className="border border-gray-200 rounded-lg bg-white"
        style={{ width, height }}
      />

      {/* Stats */}
      <div className="mt-4 flex gap-4 text-sm text-gray-600">
        <span>{nodeCount} nodes</span>
        <span>{edgeCount} edges</span>
        {hoveredNode && <span>Hovering: {hoveredNode}</span>}
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
        <strong>Interactive:</strong> Click nodes to open • Scroll to zoom • Drag to pan • Hover to highlight connections
      </div>
    </div>
  )
}