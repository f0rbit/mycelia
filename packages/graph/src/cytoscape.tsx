'use client'

import { useEffect, useRef, useState } from 'react'
import cytoscape from 'cytoscape'
import dagre from 'cytoscape-dagre'
import coseBilkent from 'cytoscape-cose-bilkent'
import type { MyceliaGraph, MyceliaNode, MyceliaEdge } from '@mycelia/core'

// Register layout algorithms
cytoscape.use(dagre)
cytoscape.use(coseBilkent)

export interface GraphVisualizationProps {
  graph: MyceliaGraph
  className?: string
  style?: React.CSSProperties
  onNodeClick?: (nodeId: string, node: MyceliaNode) => void
  onEdgeClick?: (edgeId: string, edge: MyceliaEdge) => void
  layout?: 'dagre' | 'cose-bilkent' | 'circle' | 'grid' | 'random'
  height?: string
  showLabels?: boolean
  filter?: {
    types?: string[]
    excludeTypes?: string[]
  }
}

export function GraphVisualization({
  graph,
  className = '',
  style = {},
  onNodeClick,
  onEdgeClick,
  layout = 'cose-bilkent',
  height = '600px',
  showLabels = true,
  filter
}: GraphVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<cytoscape.Core | null>(null)
  const [isReady, setIsReady] = useState(false)

  // Filter nodes and edges based on filter criteria
  const getFilteredData = () => {
    let nodes = Object.values(graph.nodes)
    
    if (filter?.types) {
      nodes = nodes.filter(node => filter.types!.includes(node.type))
    }
    
    if (filter?.excludeTypes) {
      nodes = nodes.filter(node => !filter.excludeTypes!.includes(node.type))
    }
    
    const nodeIds = new Set(nodes.map(n => n.id))
    const edges = graph.edges.filter(edge => 
      nodeIds.has(edge.from) && nodeIds.has(edge.to)
    )
    
    return { nodes, edges }
  }

  // Convert Mycelia data to Cytoscape format
  const getCytoscapeData = () => {
    const { nodes, edges } = getFilteredData()
    
    const cytoscapeNodes = nodes.map(node => ({
      data: {
        id: node.id,
        label: showLabels ? getNodeLabel(node) : '',
        type: node.type,
        primitive: node.primitive,
        node: node // Store original node data
      },
      classes: `node-${node.type} primitive-${node.primitive}`
    }))
    
    const cytoscapeEdges = edges.map(edge => ({
      data: {
        id: edge.id,
        source: edge.from,
        target: edge.to,
        type: edge.type,
        edge: edge // Store original edge data
      },
      classes: `edge-${edge.type}`
    }))
    
    return [...cytoscapeNodes, ...cytoscapeEdges]
  }

  // Get display label for a node
  const getNodeLabel = (node: MyceliaNode) => {
    if ('title' in node.attributes && node.attributes.title) return node.attributes.title
    if ('name' in node.attributes && node.attributes.name) return node.attributes.name
    if ('value' in node && node.value) return node.value
    return node.id
  }

  // Get node color based on type
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

  // Initialize Cytoscape
  useEffect(() => {
    if (!containerRef.current) return

    const cy = cytoscape({
      container: containerRef.current,
      elements: getCytoscapeData(),
      
      style: [
        // Node styles
        {
          selector: 'node',
          style: {
            'width': 30,
            'height': 30,
            'label': 'data(label)',
            'font-size': '12px',
            'text-valign': 'center',
            'text-halign': 'center',
            'background-color': (ele: any) => getNodeColor(ele.data('type')),
            'border-width': 2,
            'border-color': '#ffffff',
            'color': '#333333',
            'text-wrap': 'wrap',
            'text-max-width': '80px',
            'overlay-padding': 6,
            'z-index': 10
          }
        },
        
        // Node hover states
        {
          selector: 'node:hover',
          style: {
            'border-width': 3,
            'border-color': '#333333',
            'z-index': 20
          }
        },
        
        // Selected node
        {
          selector: 'node:selected',
          style: {
            'border-width': 4,
            'border-color': '#ff6b6b',
            'z-index': 30
          }
        },
        
        // Edge styles
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#e2e8f0',
            'target-arrow-color': '#e2e8f0',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'arrow-scale': 1.2
          }
        },
        
        // Edge hover
        {
          selector: 'edge:hover',
          style: {
            'line-color': '#64748b',
            'target-arrow-color': '#64748b',
            'width': 3
          }
        },
        
        // Different edge types
        {
          selector: '.edge-contains',
          style: {
            'line-color': '#3b82f6',
            'target-arrow-color': '#3b82f6'
          }
        },
        
        {
          selector: '.edge-references',
          style: {
            'line-color': '#10b981',
            'target-arrow-color': '#10b981',
            'line-style': 'dashed'
          }
        }
      ],
      
      layout: {
        name: layout,
        padding: 30,
        animate: true,
        animationDuration: 500,
        // Layout-specific options
        ...(layout === 'dagre' && {
          directed: true,
          rankDir: 'TB',
          nodeSep: 50,
          edgeSep: 10,
          rankSep: 50
        }),
        ...(layout === 'cose-bilkent' && {
          quality: 'default',
          nodeRepulsion: 4500,
          idealEdgeLength: 50,
          edgeElasticity: 0.45,
          nestingFactor: 0.1,
          gravity: 0.25,
          numIter: 2500,
          tile: true,
          animate: 'during',
          randomize: false
        })
      }
    })

    // Event handlers
    if (onNodeClick) {
      cy.on('tap', 'node', (evt) => {
        const node = evt.target
        const nodeData = node.data('node') as MyceliaNode
        onNodeClick(node.id(), nodeData)
      })
    }

    if (onEdgeClick) {
      cy.on('tap', 'edge', (evt) => {
        const edge = evt.target
        const edgeData = edge.data('edge') as MyceliaEdge
        onEdgeClick(edge.id(), edgeData)
      })
    }

    // Double click to fit viewport
    cy.on('dblclick', (evt) => {
      if (evt.target === cy) {
        cy.fit(undefined, 50)
      }
    })

    cyRef.current = cy
    setIsReady(true)

    return () => {
      cy.destroy()
    }
  }, [graph, layout, showLabels, filter])

  // Public methods for external control
  const fitGraph = () => {
    cyRef.current?.fit(undefined, 50)
  }

  const centerOn = (nodeId: string) => {
    const node = cyRef.current?.$(`#${nodeId}`)
    if (node && node.length > 0) {
      cyRef.current?.center(node)
    }
  }

  const highlightNode = (nodeId: string) => {
    cyRef.current?.elements().removeClass('highlighted')
    const node = cyRef.current?.$(`#${nodeId}`)
    node?.addClass('highlighted')
    
    // Also highlight connected edges
    const connectedEdges = node?.connectedEdges()
    connectedEdges?.addClass('highlighted')
  }

  return (
    <div className={`mycelia-graph ${className}`} style={{ height, ...style }}>
      <div
        ref={containerRef}
        className="w-full h-full bg-white border border-gray-200 rounded-lg"
        style={{
          cursor: 'grab'
        }}
      />
      
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading graph...</p>
          </div>
        </div>
      )}
      
      {/* Graph controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={fitGraph}
          className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50 shadow-sm"
          title="Fit to viewport"
        >
          Fit
        </button>
      </div>
      
      {/* Graph info */}
      {isReady && (
        <div className="absolute bottom-4 left-4 text-xs text-gray-500 bg-white px-2 py-1 rounded border">
          {getFilteredData().nodes.length} nodes, {getFilteredData().edges.length} edges
        </div>
      )}
    </div>
  )
}