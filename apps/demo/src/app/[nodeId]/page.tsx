import { notFound } from 'next/navigation'
import { loadCompleteGraph, loadNode } from '@/lib/content'
// Temporary: not using @mycelia/render until components are fixed

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

  const { node } = nodeData

  // Temporary simplified rendering until components are fixed
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <h1 className="text-3xl font-bold mb-4">
        {node.attributes?.title || node.attributes?.name || node.id}
      </h1>
      <p className="text-muted-foreground mb-4 capitalize">{node.type}</p>
      <div>
        {node.primitive === 'Branch' && 'content' in node && node.content && (
          <div dangerouslySetInnerHTML={{ __html: node.content }} />
        )}
        {node.primitive === 'Leaf' && 'value' in node && node.value && (
          <p>{node.value}</p>
        )}
      </div>
    </div>
  )
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