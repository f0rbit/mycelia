'use client'

import { useEffect, useRef } from 'react'
import type { MyceliaGraph, MyceliaNode, MyceliaEdge } from '@mycelia/core'

export interface SimpleGraphProps {
  graph: MyceliaGraph
  className?: string
  style?: React.CSSProperties
  onNodeClick?: (nodeId: string, node: MyceliaNode) => void
  height?: string
}

export function SimpleGraph({
  graph,
  className = '',
  style = {},
  onNodeClick,
  height = '600px'
}: SimpleGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const svg = svgRef.current
    const nodes = Object.values(graph.nodes)
    const edges = graph.edges

    // Clear previous content
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild)
    }

    // Simple force simulation using basic positioning
    const width = 800
    const height = 600
    const nodeRadius = 20

    // Position nodes in a rough circle for now
    const angleStep = (2 * Math.PI) / nodes.length
    const positions = nodes.map((node, i) => {
      const angle = i * angleStep
      const radius = Math.min(width, height) * 0.3
      return {
        id: node.id,
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius,
        node
      }
    })

    // Create position map
    const posMap = new Map(positions.map(p => [p.id, p]))

    // Draw edges first (so they appear behind nodes)
    edges.forEach(edge => {
      const from = posMap.get(edge.from)
      const to = posMap.get(edge.to)
      if (from && to) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
        line.setAttribute('x1', from.x.toString())
        line.setAttribute('y1', from.y.toString())
        line.setAttribute('x2', to.x.toString())
        line.setAttribute('y2', to.y.toString())
        line.setAttribute('stroke', '#e2e8f0')
        line.setAttribute('stroke-width', '2')
        svg.appendChild(line)
      }
    })

    // Draw nodes
    positions.forEach(pos => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      g.setAttribute('transform', `translate(${pos.x}, ${pos.y})`)
      g.style.cursor = 'pointer'

      // Node circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      circle.setAttribute('r', nodeRadius.toString())
      circle.setAttribute('fill', getNodeColor(pos.node.type))
      circle.setAttribute('stroke', '#ffffff')
      circle.setAttribute('stroke-width', '2')

      // Node label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      const label = getNodeLabel(pos.node)
      text.textContent = label.length > 10 ? label.substring(0, 10) + '...' : label
      text.setAttribute('text-anchor', 'middle')
      text.setAttribute('dy', '0.35em')
      text.setAttribute('font-size', '10')
      text.setAttribute('fill', '#333')
      text.setAttribute('pointer-events', 'none')

      g.appendChild(circle)
      g.appendChild(text)

      // Click handler
      if (onNodeClick) {
        g.addEventListener('click', () => {
          onNodeClick(pos.id, pos.node)
        })
      }

      // Hover effects
      g.addEventListener('mouseenter', () => {
        circle.setAttribute('stroke', '#333333')
        circle.setAttribute('stroke-width', '3')
      })

      g.addEventListener('mouseleave', () => {
        circle.setAttribute('stroke', '#ffffff')
        circle.setAttribute('stroke-width', '2')
      })

      svg.appendChild(g)
    })

  }, [graph, onNodeClick])

  const getNodeLabel = (node: MyceliaNode) => {
    if ('title' in node.attributes && node.attributes.title) return node.attributes.title
    if ('name' in node.attributes && node.attributes.name) return node.attributes.name
    if ('value' in node && node.value) return node.value
    return node.id
  }

  const getNodeColor = (type: string) => {
    const colors: Record<string, string> = {
      person: '#3b82f6',
      project: '#10b981', 
      skill: '#f59e0b',
      task: '#ef4444',
      research: '#8b5cf6',
      essay: '#06b6d4',
      note: '#6b7280',
      tag: '#ec4899',
      portfolio: '#059669',
    }
    return colors[type] || '#6b7280'
  }

  return (
    <div className={`simple-graph ${className}`} style={{ height, ...style }}>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox="0 0 800 600"
        className="border border-gray-200 rounded-lg bg-white"
      />
      
      <div className="absolute bottom-4 left-4 text-xs text-gray-500 bg-white px-2 py-1 rounded border">
        {Object.keys(graph.nodes).length} nodes, {graph.edges.length} edges
      </div>
    </div>
  )
}