import type { MyceliaGraph, MyceliaNode } from '@mycelia/core'

export interface GraphNode {
  id: string
  name: string
  type: string
  group: string
  val: number
  color: string
  node: MyceliaNode
}

export interface GraphLink {
  source: string
  target: string
  type: string
}

export interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

export interface GraphViewerProps {
  graphUrl?: string
  width?: number
  height?: number
  className?: string
}