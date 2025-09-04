import Link from 'next/link'
import { Calendar, MapPin, Tag as TagIcon, ArrowRight, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
        {subtitle && (
          <p className="text-lg text-muted-foreground mt-2">{subtitle}</p>
        )}
      </div>

      {/* Metadata row */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1 bg-secondary px-2 py-1 rounded-full">
          <TagIcon className="w-3 h-3" />
          {node.type}
        </span>
        
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
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            node.attributes.status === 'active' ? 'bg-green-100 text-green-800' :
            node.attributes.status === 'completed' ? 'bg-blue-100 text-blue-800' :
            node.attributes.status === 'archived' ? 'bg-gray-100 text-gray-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            <Clock className="w-3 h-3" />
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
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Connected nodes in the knowledge graph</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 md:grid-cols-2">
          {relatedNodes.slice(0, 8).map(relatedNode => {
            const title = relatedNode.attributes?.title || relatedNode.attributes?.name || relatedNode.id
            return (
              <Link key={relatedNode.id} href={`/${relatedNode.id}`}>
                <Button variant="outline" className="w-full justify-start h-auto p-3">
                  <div className="text-left">
                    <div className="font-medium">{title}</div>
                    <div className="text-xs text-muted-foreground">{relatedNode.type}</div>
                  </div>
                </Button>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export function ChildNodes({ childNodes }: Pick<NodePageProps, 'childNodes'>) {
  if (!childNodes.length) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contents</CardTitle>
        <CardDescription>Child nodes contained within this node</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {childNodes.map(child => {
            const title = child.attributes?.title || child.attributes?.name || child.id
            return (
              <Link key={child.id} href={`/${child.id}`}>
                <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors">
                  <div>
                    <div className="font-medium">{title}</div>
                    <div className="text-sm text-muted-foreground">{child.type}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}