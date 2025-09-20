import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import { Badge } from '../../../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import myceliaConfig from '../../../../mycelia.json'
import graphData from '../../../../public/graph.json'

export async function generateStaticParams() {
  // Generate params based on mycelia.json configuration
  return myceliaConfig.routes.types.map(route => ({
    typeId: route.path.replace('/', '')
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ typeId: string }> }): Promise<Metadata> {
  const { typeId } = await params;
  const typeConfig = myceliaConfig.routes.types.find(
    t => t.path === `/${typeId}`
  )
  
  if (!typeConfig) {
    return { title: 'Not Found' }
  }
  
  return {
    title: typeConfig.title,
    description: typeConfig.description
  }
}

export default async function TypeIndexPage({ params }: { params: Promise<{ typeId: string }> }) {
  const { typeId } = await params;
  const typeConfig = myceliaConfig.routes.types.find(
    t => t.path === `/${typeId}`
  )
  
  if (!typeConfig) {
    notFound()
  }

  // Get all nodes of this type
  const nodesOfType = Object.entries(graphData.nodes)
    .filter(([_, node]: [string, any]) => node.type === typeConfig.type)
    .map(([nodeId, node]: [string, any]) => ({ nodeId, ...node }))
    .sort((a, b) => {
      // Sort by updated_at if available, otherwise by title
      if (a.updated_at && b.updated_at) {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      }
      return (a.title || a.name || a.nodeId).localeCompare(b.title || b.name || b.nodeId)
    })

  // Helper to get node display name
  const getNodeDisplayName = (node: any) => {
    return node.title || node.name || node.nodeId.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
  }

  // Helper to get node preview text
  const getNodePreview = (node: any) => {
    if (node.description) return node.description
    if (node.content) {
      return node.content.substring(0, 150) + (node.content.length > 150 ? '...' : '')
    }
    return ''
  }

  // Type-specific rendering functions
  const renderPersonCard = (node: any) => (
    <Card key={node.nodeId} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <Link href={`/node/${node.nodeId}`} className="hover:underline">
            {getNodeDisplayName(node)}
          </Link>
          {node.role && <Badge variant="secondary">{node.role}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-3">{getNodePreview(node)}</p>
        {node.skills && node.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {node.skills.slice(0, 5).map((skill: string) => (
              <Badge key={skill} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {node.skills.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{node.skills.length - 5} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )

  const renderProjectCard = (node: any) => (
    <Card key={node.nodeId} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <Link href={`/node/${node.nodeId}`} className="hover:underline">
            {getNodeDisplayName(node)}
          </Link>
          {node.status && (
            <Badge variant={node.status === 'completed' ? 'default' : 'secondary'}>
              {node.status}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-3">{getNodePreview(node)}</p>
        <div className="flex flex-wrap gap-2 text-sm">
          {node.tech_stack && (
            <div className="flex gap-1 items-center">
              <span className="text-muted-foreground">Tech:</span>
              {node.tech_stack.slice(0, 3).map((tech: string) => (
                <Badge key={tech} variant="outline" className="text-xs">
                  {tech}
                </Badge>
              ))}
            </div>
          )}
          {node.updated_at && (
            <span className="text-xs text-muted-foreground">
              Updated: {new Date(node.updated_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const renderSkillCard = (node: any) => (
    <Card key={node.nodeId} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <Link href={`/node/${node.nodeId}`} className="hover:underline">
            {getNodeDisplayName(node)}
          </Link>
          {node.proficiency && (
            <Badge variant={
              node.proficiency === 'expert' ? 'default' : 
              node.proficiency === 'advanced' ? 'secondary' : 
              'outline'
            }>
              {node.proficiency}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{getNodePreview(node)}</p>
        {node.years_experience && (
          <p className="text-sm mt-2">
            <span className="text-muted-foreground">Experience:</span> {node.years_experience} years
          </p>
        )}
      </CardContent>
    </Card>
  )

  const renderDefaultCard = (node: any) => (
    <Card key={node.nodeId} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>
          <Link href={`/node/${node.nodeId}`} className="hover:underline">
            {getNodeDisplayName(node)}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{getNodePreview(node)}</p>
        {node.tags && node.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {node.tags.map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )

  // Choose renderer based on type
  const renderCard = (node: any) => {
    switch (typeConfig.type) {
      case 'person':
        return renderPersonCard(node)
      case 'project':
        return renderProjectCard(node)
      case 'skill':
        return renderSkillCard(node)
      default:
        return renderDefaultCard(node)
    }
  }

  return (
    <div className="container mx-auto py-12 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{typeConfig.title}</h1>
        <p className="text-lg text-muted-foreground">{typeConfig.description}</p>
        <div className="mt-4 flex gap-4 text-sm">
          <Badge variant="secondary" className="px-3 py-1">
            {nodesOfType.length} {typeConfig.type}{nodesOfType.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Node Grid */}
      {nodesOfType.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {nodesOfType.map(node => renderCard(node))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No {typeConfig.type}s found.</p>
        </div>
      )}
    </div>
  )
}