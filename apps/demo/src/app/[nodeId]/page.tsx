import { notFound } from 'next/navigation'
import { loadCompleteGraph, loadNode } from '@/lib/content'
import { NodePage } from '@/components/pages/node-page'

// Generate static params for all nodes in the graph
export async function generateStaticParams() {
  try {
    const graph = await loadCompleteGraph()
    
    return Object.keys(graph.nodes).map(nodeId => ({
      nodeId: nodeId
    }))
  } catch (error) {
    console.error('Failed to generate static params:', error)
    return []
  }
}

interface NodePageProps {
  params: Promise<{ nodeId: string }>
}

export default async function DynamicNodePage({ params }: NodePageProps) {
  const { nodeId } = await params
  const nodeData = await loadNode(nodeId)
  
  if (!nodeData || !nodeData.node) {
    notFound()
  }

  return <NodePage {...nodeData} />
}

// Generate metadata for each node page
export async function generateMetadata({ params }: NodePageProps) {
  const { nodeId } = await params
  const nodeData = await loadNode(nodeId)
  
  if (!nodeData) {
    return {
      title: 'Node not found'
    }
  }

  const { node } = nodeData
  const title = node.attributes?.title || node.attributes?.name || node.id
  const description = 'value' in node ? node.value : 
                     'content' in node ? node.content?.substring(0, 160) : 
                     `${node.type} in the Mycelia knowledge graph`

  return {
    title: `${title} | Mycelia Demo`,
    description
  }
}