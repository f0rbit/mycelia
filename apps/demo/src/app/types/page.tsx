import Link from 'next/link'
import { getNodeTypes } from '@/lib/content'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight } from 'lucide-react'

export default async function TypesOverviewPage() {
  const nodeTypes = await getNodeTypes()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Content Types</h1>
        <p className="text-muted-foreground mt-2">
          Explore the knowledge graph by semantic content type
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {nodeTypes.map(({ type, count }) => {
          const typeDisplayName = type.charAt(0).toUpperCase() + type.slice(1) + 's'
          
          // Type-specific descriptions
          const descriptions: Record<string, string> = {
            project: 'Software projects, applications, and development initiatives',
            skill: 'Technical skills, programming languages, and competencies', 
            task: 'Action items, todos, and development tasks',
            essay: 'Written articles, blog posts, and long-form content',
            research: 'Research findings, studies, and investigations',
            book: 'Books, reading materials, and literature',
            experience: 'Work experience, roles, and professional history',
            achievement: 'Milestones, accomplishments, and recognitions',
            tag: 'Categories, labels, and organizational markers',
            note: 'Quick notes, thoughts, and observations',
            person: 'People, collaborators, and contacts',
            date: 'Important dates and temporal markers'
          }
          
          const description = descriptions[type] || `${typeDisplayName} in the knowledge graph`
          
          return (
            <Link key={type} href={`/types/${type}`}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {typeDisplayName}
                        <Badge variant="secondary">{count}</Badge>
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {description}
                      </CardDescription>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </div>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Knowledge Graph Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {nodeTypes.reduce((sum, { count }) => sum + count, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Nodes</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{nodeTypes.length}</div>
              <div className="text-sm text-muted-foreground">Content Types</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {Math.round(nodeTypes.reduce((sum, { count }) => sum + count, 0) / nodeTypes.length)}
              </div>
              <div className="text-sm text-muted-foreground">Avg per Type</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}