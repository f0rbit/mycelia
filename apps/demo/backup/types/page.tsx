import Link from 'next/link'
import { getNodeTypes } from '@/lib/content'

export default async function TypesOverviewPage() {
  const nodeTypes = await getNodeTypes()
  const totalNodes = nodeTypes.reduce((sum, { count }) => sum + count, 0)
  const avgPerType = Math.round(totalNodes / nodeTypes.length)

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="space-y-4 pb-6 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Types</h1>
          <p className="text-sm text-muted-foreground mt-1">node-types</p>
        </div>
        
        <p className="text-lg text-muted-foreground">
          Explore the knowledge graph by semantic content type
        </p>

        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span><strong>{totalNodes}</strong> total nodes</span>
          <span><strong>{nodeTypes.length}</strong> content types</span>
          <span><strong>{avgPerType}</strong> avg per type</span>
        </div>
      </div>

      <div className="mt-8 space-y-4">
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
            <div key={type} className="border-l-4 border-blue-200 pl-4 py-2 hover:border-blue-300 transition-colors">
              <h3 className="text-lg font-medium mb-1">
                <Link href={`/types/${type}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                  {typeDisplayName}
                </Link>
                <span className="ml-2 text-sm text-muted-foreground font-normal">({count})</span>
              </h3>
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}