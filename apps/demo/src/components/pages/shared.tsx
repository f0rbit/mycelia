import Link from 'next/link'
import { Calendar, MapPin, ArrowRight } from 'lucide-react'
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

export function PageHeader({ node, breadcrumbs }: Pick<NodePageProps, 'node' | 'breadcrumbs'>) {
  const title = node.attributes?.title || node.attributes?.name || node.id
  const subtitle = node.attributes?.subtitle || node.attributes?.role || node.type
  
  return (
    <div className="space-y-4 pb-6 border-b">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 1 && (
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.id} className="flex items-center space-x-2">
              {index > 0 && <ArrowRight className="w-3 h-3" />}
              {index < breadcrumbs.length - 1 ? (
                <Link href={`/${crumb.id}`} className="hover:text-foreground">
                  {crumb.title}
                </Link>
              ) : (
                <span className="text-foreground font-medium">{crumb.title}</span>
              )}
            </div>
          ))}
        </nav>
      )}

      {/* Main title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && subtitle !== node.type && (
          <p className="text-lg text-muted-foreground mt-2">{subtitle}</p>
        )}
        <p className="text-sm text-muted-foreground mt-1">{node.type}</p>
      </div>

      {/* Metadata row */}
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        
        {node.attributes?.startDate && (
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(node.attributes.startDate).toLocaleDateString()}
            {node.attributes?.endDate && ` - ${new Date(node.attributes.endDate).toLocaleDateString()}`}
          </span>
        )}
        
        {node.attributes?.location && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {node.attributes.location}
          </span>
        )}

        {node.attributes?.status && (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
            node.attributes.status === 'active' ? 'bg-green-100 text-green-800' :
            node.attributes.status === 'completed' ? 'bg-blue-100 text-blue-800' :
            node.attributes.status === 'archived' ? 'bg-gray-100 text-gray-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {node.attributes.status}
          </span>
        )}
      </div>
    </div>
  )
}

export function NodeContent({ node }: Pick<NodePageProps, 'node'>) {
  const content = 'value' in node ? node.value : 'content' in node ? node.content : ''
  
  if (!content) return null

  return (
    <div className="prose max-w-none">
      <div className="whitespace-pre-wrap">{content}</div>
    </div>
  )
}

export function RelatedNodes({ relatedNodes, title = "Related" }: { relatedNodes: NodePageProps['relatedNodes'], title?: string }) {
  if (!relatedNodes.length) return null

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">Connected nodes in the knowledge graph</p>
      <div className="flex flex-wrap gap-2">
        {relatedNodes.slice(0, 12).map(relatedNode => {
          const nodeTitle = relatedNode.attributes?.title || relatedNode.attributes?.name || relatedNode.id
          return (
            <Link key={relatedNode.id} href={`/${relatedNode.id}`}>
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors">
                <span className="font-medium">{nodeTitle}</span>
                <span className="text-xs text-muted-foreground">• {relatedNode.type}</span>
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export function ChildNodes({ childNodes }: Pick<NodePageProps, 'childNodes'>) {
  if (!childNodes.length) return null

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Contents</h2>
      <div className="space-y-6">
        {childNodes.map(child => {
          const title = child.attributes?.title || child.attributes?.name || child.id
          const content = 'value' in child ? child.value : 'content' in child ? child.content : ''
          const truncatedContent = content && content.length > 200 ? content.substring(0, 200) + '...' : content
          
          return (
            <div key={child.id} className="border-l-4 border-blue-200 pl-4 py-2">
              <h3 className="text-lg font-medium mb-2">
                <Link href={`/${child.id}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                  {title}
                </Link>
                <span className="ml-2 text-sm text-muted-foreground font-normal">{child.type}</span>
              </h3>
              {truncatedContent && (
                <p className="text-muted-foreground text-sm leading-relaxed mb-2">
                  {truncatedContent}
                </p>
              )}
              {content && content.length > 200 && (
                <Link 
                  href={`/${child.id}`} 
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Read more →
                </Link>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}