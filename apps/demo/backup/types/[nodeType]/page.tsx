import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getNodeTypes, loadNodesByType } from '@/lib/content'
import { Calendar, MapPin, Clock } from 'lucide-react'

// Generate static params for all node types
export async function generateStaticParams() {
  try {
    const nodeTypes = await getNodeTypes()
    
    return nodeTypes.map(({ type }) => ({
      nodeType: type
    }))
  } catch (error) {
    console.error('Failed to generate type static params:', error)
    return []
  }
}

interface TypePageProps {
  params: Promise<{ nodeType: string }>
}

export default async function TypePage({ params }: TypePageProps) {
  const { nodeType } = await params
  const nodes = await loadNodesByType(nodeType)
  
  if (!nodes.length) {
    notFound()
  }

  const typeDisplayName = nodeType.charAt(0).toUpperCase() + nodeType.slice(1) + 's'
  const activeCount = nodes.filter(n => n.attributes?.status === 'active').length
  const completedCount = nodes.filter(n => n.attributes?.status === 'completed').length
  const withDatesCount = nodes.filter(n => n.attributes?.startDate).length

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="space-y-4 pb-6 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{typeDisplayName}</h1>
          <p className="text-sm text-muted-foreground mt-1">{nodeType}-list</p>
        </div>
        
        <p className="text-lg text-muted-foreground">
          All {nodeType} nodes in the knowledge graph
        </p>

        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span><strong>{nodes.length}</strong> total</span>
          {activeCount > 0 && <span><strong>{activeCount}</strong> active</span>}
          {completedCount > 0 && <span><strong>{completedCount}</strong> completed</span>}
          {withDatesCount > 0 && <span><strong>{withDatesCount}</strong> with dates</span>}
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {nodes.map(node => {
          const title = node.attributes?.title || node.attributes?.name || node.id
          const description = 'value' in node ? node.value?.substring(0, 150) : 
                             'content' in node ? node.content?.substring(0, 150) : 
                             undefined
          
          return (
            <div key={node.id} className="border-l-4 border-blue-200 pl-4 py-2 hover:border-blue-300 transition-colors">
              <h3 className="text-lg font-medium mb-1">
                <Link href={`/${node.id}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                  {title}
                </Link>
              </h3>
              
              <div className="flex items-center gap-4 mb-2 text-sm text-muted-foreground">
                {node.attributes?.status && (
                  <span className={`inline-flex items-center gap-1 px-2 py-1 border rounded-full text-xs font-medium ${
                    node.attributes.status === 'active' ? 'text-green-700 border-green-200' :
                    node.attributes.status === 'completed' ? 'text-blue-700 border-blue-200' :
                    node.attributes.status === 'archived' ? 'text-gray-700 border-gray-200' :
                    'text-yellow-700 border-yellow-200'
                  }`}>
                    <Clock className="w-3 h-3" />
                    {node.attributes.status}
                  </span>
                )}
                
                {node.attributes?.startDate && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(node.attributes.startDate).getFullYear()}
                  </span>
                )}
                
                {node.attributes?.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {node.attributes.location}
                  </span>
                )}
              </div>

              {description && (
                <p className="text-sm text-muted-foreground">
                  {description.trim()}
                  {description.length >= 150 && '...'}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Generate metadata for each type page
export async function generateMetadata({ params }: TypePageProps) {
  const { nodeType } = await params
  const nodes = await loadNodesByType(nodeType)
  
  const typeDisplayName = nodeType.charAt(0).toUpperCase() + nodeType.slice(1) + 's'
  
  return {
    title: `${typeDisplayName} | Mycelia Demo`,
    description: `Explore all ${nodes.length} ${nodeType} nodes in the Mycelia knowledge graph`
  }
}