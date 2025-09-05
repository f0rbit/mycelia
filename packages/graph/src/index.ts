// Simple placeholder graph component
export function GraphVisualization(props: any) {
  return null
}

export interface GraphVisualizationProps {
  graph: any
  onNodeClick?: (nodeId: string, node: any) => void
  [key: string]: any
}