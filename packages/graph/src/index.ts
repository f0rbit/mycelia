// Default export for backward compatibility
export { MyceliaGraphViewer, MyceliaGraphViewer as ForceGraph } from './MyceliaGraphViewer'

// Cytoscape implementation
export { CytoscapeGraph } from './implementations/cytoscape'

// Types
export type { GraphViewerProps, GraphNode, GraphLink, GraphData } from './types'