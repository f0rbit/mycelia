import { notFound } from 'next/navigation'
import Link from 'next/link'
import { loadCompleteGraph, loadNode } from '@/lib/content'
import { Calendar, MapPin, ExternalLink, ArrowLeft, Tag } from 'lucide-react'

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

  const { node, relatedNodes, childNodes, parentNode, breadcrumbs } = nodeData
  const title = node.attributes?.title || node.attributes?.name || node.id

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 1 && (
        <nav className="mb-6 text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.id}>
              {index > 0 && <span className="mx-2">/</span>}
              {index === breadcrumbs.length - 1 ? (
                <span className="font-medium text-gray-900">{crumb.title}</span>
              ) : (
                <Link href={`/${crumb.id}`} className="hover:text-blue-600">
                  {crumb.title}
                </Link>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Header */}
      <header className="space-y-4 pb-6 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{node.type}</p>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {node.attributes?.status && (
            <StatusBadge status={node.attributes.status} />
          )}
          
          {node.attributes?.startDate && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(node.attributes.startDate).getFullYear()}
              {node.attributes?.endDate && ` - ${new Date(node.attributes.endDate).getFullYear()}`}
            </span>
          )}
          
          {node.attributes?.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {node.attributes.location}
            </span>
          )}

          {node.attributes?.url && (
            <a 
              href={node.attributes.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="w-3 h-3" />
              View External
            </a>
          )}

          {node.attributes?.level && (
            <span className="inline-flex items-center gap-1">
              <Tag className="w-3 h-3" />
              Level: {node.attributes.level}
            </span>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="mt-8 space-y-8">
        {/* Content for Branch nodes */}
        {node.primitive === 'Branch' && 'content' in node && node.content && (
          <div className="prose prose-lg max-w-none">
            <div className="text-gray-700">
              {node.content.split('\n\n').map((paragraph, i) => (
                paragraph.trim() && (
                  <p key={i} className="mb-4">
                    {paragraph.trim()}
                  </p>
                )
              ))}
            </div>
          </div>
        )}

        {/* Value for Leaf nodes */}
        {node.primitive === 'Leaf' && 'value' in node && node.value && (
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700">{node.value}</p>
          </div>
        )}

        {/* Child nodes */}
        {childNodes.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Contains</h2>
            <div className="grid gap-3">
              {childNodes.map(child => (
                <div key={child.id} className="border-l-4 border-blue-200 pl-4 py-2">
                  <Link 
                    href={`/${child.id}`} 
                    className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                  >
                    {child.attributes?.title || child.attributes?.name || child.id}
                  </Link>
                  <span className="ml-2 text-sm text-muted-foreground">({child.type})</span>
                  {'value' in child && child.value && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {child.value.substring(0, 150)}
                      {child.value.length > 150 && '...'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related nodes */}
        {relatedNodes.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Related</h2>
            <div className="flex flex-wrap gap-2">
              {relatedNodes.map(related => (
                <Link
                  key={related.id}
                  href={`/${related.id}`}
                  className="inline-flex items-center px-3 py-1 bg-gray-50 border border-gray-200 rounded-md text-sm hover:bg-gray-100"
                >
                  {related.attributes?.title || related.attributes?.name || related.id}
                  <span className="ml-1 text-xs text-muted-foreground">({related.type})</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Parent link */}
        {parentNode && (
          <div className="pt-6 border-t">
            <Link 
              href={`/${parentNode.id}`}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to {parentNode.attributes?.title || parentNode.id}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'published':
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'wip':
      case 'development':
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'planned':
      case 'draft':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusStyle(status)}`}>
      {status}
    </span>
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