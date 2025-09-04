import type { MyceliaNode, MyceliaEdge } from '@mycelia/core'

export interface NodePageProps {
  node: MyceliaNode
  relatedNodes: MyceliaNode[]
  childNodes: MyceliaNode[]
  parentNode: MyceliaNode | null
  inboundEdges: MyceliaEdge[]
  outboundEdges: MyceliaEdge[]
  breadcrumbs: Array<{id: string, title: string}>
}