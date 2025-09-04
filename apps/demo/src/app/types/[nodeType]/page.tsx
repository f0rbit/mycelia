import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getNodeTypes, loadNodesByType } from '@/lib/content'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react'

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{typeDisplayName}</h1>
        <p className="text-muted-foreground mt-2">
          All {nodeType} nodes in the knowledge graph ({nodes.length} items)
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {nodes.map(node => {
          const title = node.attributes?.title || node.attributes?.name || node.id
          const description = 'value' in node ? node.value?.substring(0, 120) : 
                             'content' in node ? node.content?.substring(0, 120) : 
                             `A ${node.type} in the knowledge graph`
          
          return (
            <Link key={node.id} href={`/${node.id}`}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{title}</CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
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
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground ml-2 flex-shrink-0" />
                  </div>
                </CardHeader>
                {description && (
                  <CardContent className="pt-0">
                    <CardDescription className="line-clamp-3">
                      {description}
                    </CardDescription>
                  </CardContent>
                )}
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Show statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{nodes.length}</div>
              <div className="text-sm text-muted-foreground">Total {typeDisplayName}</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {nodes.filter(n => n.attributes?.status === 'active').length}
              </div>
              <div className="text-sm text-muted-foreground">Active</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {nodes.filter(n => n.attributes?.status === 'completed').length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {nodes.filter(n => n.attributes?.startDate).length}
              </div>
              <div className="text-sm text-muted-foreground">With Dates</div>
            </div>
          </div>
        </CardContent>
      </Card>
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