import { notFound } from 'next/navigation'
import Link from 'next/link'
import { loadNode } from '@/lib/content'
import { Calendar, MapPin, ExternalLink } from 'lucide-react'

export default async function PortfolioShowcasePage() {
  const nodeData = await loadNode('portfolio-showcase')
  
  if (!nodeData || !nodeData.node) {
    notFound()
  }

  const { node, childNodes } = nodeData
  const projects = childNodes.filter(n => n.type === 'project')
  const activeProjects = projects.filter(p => p.attributes?.status === 'active')
  const completedProjects = projects.filter(p => p.attributes?.status === 'completed')

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="space-y-4 pb-6 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {node.attributes?.title || 'Portfolio Showcase'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">portfolio</p>
        </div>
        
        {'content' in node && node.content && (
          <p className="text-lg text-muted-foreground">
            {node.content.split('\n')[0]}
          </p>
        )}

        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span><strong>{projects.length}</strong> projects</span>
          {activeProjects.length > 0 && <span><strong>{activeProjects.length}</strong> active</span>}
          {completedProjects.length > 0 && <span><strong>{completedProjects.length}</strong> completed</span>}
        </div>
      </div>

      <div className="mt-8 space-y-8">
        {projects.map(project => (
          <article key={project.id} className="border-l-4 border-blue-100 pl-6 space-y-4">
            <header className="space-y-2">
              <div className="flex items-center gap-3">
                <Link 
                  href={`/${project.id}`} 
                  className="text-2xl font-bold text-gray-900 hover:text-blue-600 hover:underline"
                >
                  {project.attributes?.title || project.id}
                </Link>
                {project.attributes?.status && (
                  <StatusBadge status={project.attributes.status} />
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {project.attributes?.startDate && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(project.attributes.startDate).getFullYear()}
                  </span>
                )}
                
                {project.attributes?.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {project.attributes.location}
                  </span>
                )}

                {project.attributes?.url && (
                  <a 
                    href={project.attributes.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View Project
                  </a>
                )}
              </div>
            </header>
            
            {'content' in project && project.content && (
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700">
                  {project.content.split('\n\n')[0]}
                </p>
              </div>
            )}

            {/* Skills/tech stack */}
            {childNodes.filter(n => n.type === 'skill' && n.attributes?.parent === project.id).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-800">Technologies</h4>
                <div className="flex flex-wrap gap-2">
                  {childNodes
                    .filter(n => n.type === 'skill' && n.attributes?.parent === project.id)
                    .map(skill => (
                      <Link
                        key={skill.id}
                        href={`/${skill.id}`}
                        className="inline-flex items-center px-3 py-1 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700 hover:bg-blue-100"
                      >
                        {skill.attributes?.name || skill.id}
                      </Link>
                    ))}
                </div>
              </div>
            )}
          </article>
        ))}
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