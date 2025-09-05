import Link from 'next/link'
import { PageHeader } from './shared'
import type { NodePageProps } from './shared'



export function PortfolioPage(props: NodePageProps) {
  const { node, childNodes, relatedNodes } = props
  
  // Get the portfolio's own description (not including all the project content)
  const portfolioValue = 'value' in node ? node.value || '' : ''
  const portfolioContent = 'content' in node ? node.content || '' : ''
  
  // Extract just the intro text - look for content before "Active Projects" or similar headings
  const introText = portfolioContent.split(/Active Projects|## Active Projects|Game Development|## Game Development/)[0] || 
    portfolioValue || 
    portfolioContent.split('\n\n').slice(0, 3).join('\n\n') // fallback to first few paragraphs
  
  // Split content into sections by finding project nodes
  const projectNodes = childNodes.filter(child => child.type === 'project')
  
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <PageHeader {...props} />
      
      {/* Portfolio introduction - only the actual intro, not project content */}
      {introText.trim() && (
        <div className="prose prose-lg max-w-none mb-12">
          <div className="text-lg leading-relaxed mb-8">
            {introText.split('\n\n').map((paragraph: string, i: number) => (
              paragraph.trim() && (
                <p key={i} className="mb-4">
                  {enhanceTextWithLinks(paragraph.trim(), relatedNodes)}
                </p>
              )
            ))}
          </div>
        </div>
      )}

      {/* Project sections */}
      <div className="space-y-16">
        {projectNodes.map((project: any) => {
          // Get child nodes specific to this project from all available child nodes
          // The childNodes array contains all descendants, so we need to filter by the project's children array
          const projectChildNodes = childNodes.filter(child => 
            'children' in project && 
            Array.isArray(project.children) && 
            project.children.includes(child.id)
          )
          
          return (
            <ProjectCard 
              key={project.id} 
              project={project} 
              projectChildNodes={projectChildNodes}
              relatedNodes={relatedNodes} 
            />
          )
        })}
      </div>
    </div>
  )
}

function ProjectCard({ project, projectChildNodes, relatedNodes }: { 
  project: any, 
  projectChildNodes: any[], 
  relatedNodes: any[] 
}) {
  const title = project.attributes?.title || project.id
  const status = project.attributes?.status || 'unknown'
  const category = project.attributes?.category
  const githubUrl = project.attributes?.githubUrl
  const liveUrl = project.attributes?.liveUrl
  
  // Split project content into paragraphs - this will help separate description from sub-content
  const content = 'content' in project ? project.content || '' : ''
  const paragraphs = content.split('\n\n').filter((p: string) => p.trim().length > 0)
  
  return (
    <article className="border-l-4 border-blue-100 pl-6 space-y-4">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <Link 
            href={`/${project.id}`} 
            className="text-2xl font-bold text-gray-900 hover:text-blue-600 hover:underline"
          >
            {title}
          </Link>
          <StatusBadge status={status} />
        </div>
        
        {category && (
          <p className="text-sm text-gray-600 font-medium uppercase tracking-wide">
            {category.replace(/-/g, ' ')}
          </p>
        )}
        
        {/* External links */}
        {(githubUrl || liveUrl) && (
          <div className="flex gap-2 text-sm">
            {githubUrl && (
              <a 
                href={githubUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                GitHub
              </a>
            )}
            {liveUrl && (
              <a 
                href={liveUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                Live Demo
              </a>
            )}
          </div>
        )}
      </header>

      {/* Project description - take first few paragraphs */}
      <div className="prose prose-gray max-w-none">
        {paragraphs.slice(0, 3).map((paragraph: string, i: number) => (
          <p key={i} className="text-gray-700 leading-relaxed mb-3">
            {enhanceTextWithLinks(paragraph.trim(), relatedNodes)}
          </p>
        ))}
      </div>

      {/* Notes - styled like Obsidian callouts */}
      <ProjectNotes projectId={project.id} projectChildNodes={projectChildNodes} />
      
      {/* Tags and Skills at the end */}
      <ProjectMeta projectId={project.id} projectChildNodes={projectChildNodes} />
    </article>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    active: 'bg-green-100 text-green-800',
    development: 'bg-yellow-100 text-yellow-800', 
    completed: 'bg-blue-100 text-blue-800',
    paused: 'bg-gray-100 text-gray-800',
    planning: 'bg-purple-100 text-purple-800',
  }
  
  const colorClass = colors[status as keyof typeof colors] || colors.completed
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {status}
    </span>
  )
}

function ProjectNotes({ projectId, projectChildNodes }: { projectId: string, projectChildNodes: any[] }) {
  // Find notes that belong to this project
  const projectNotes = projectChildNodes.filter(child => 
    child.type === 'note'
  )
  
  if (projectNotes.length === 0) return null
  
  return (
    <div className="space-y-3 my-6">
      {projectNotes.map((note: any) => (
        <div key={note.id} className="bg-blue-50 border-l-4 border-blue-200 p-4 rounded-r-lg">
          {note.attributes?.title && (
            <h4 className="font-semibold text-blue-900 mb-2 text-sm">
              💡 {note.attributes.title}
            </h4>
          )}
          <p className="text-blue-800 text-sm leading-relaxed">
            {'value' in note ? note.value : 'content' in note ? note.content : ''}
          </p>
        </div>
      ))}
    </div>
  )
}

function ProjectMeta({ projectId, projectChildNodes }: { projectId: string, projectChildNodes: any[] }) {
  // Find tags and skills that belong to this project
  const projectTags = projectChildNodes.filter(child => 
    child.type === 'tag'
  )
  
  const projectSkills = projectChildNodes.filter(child => 
    child.metaType === 'skill' || child.type === 'skill'
  )
  
  return (
    <div className="space-y-3 pt-4 border-t border-gray-100">
      {/* Tags */}
      {projectTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {projectTags.map((tag: any) => (
            <Link
              key={tag.id}
              href={`/${tag.id}`}
              className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 transition-colors"
            >
              #{tag.attributes?.value || tag.value || tag.id}
            </Link>
          ))}
        </div>
      )}
      
      {/* Skills */}
      {projectSkills.length > 0 && (
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="text-gray-500">Skills:</span>
          {projectSkills.map((skill: any, i: number) => (
            <span key={skill.id}>
              <Link
                href={`/${skill.id}`}
                className="text-gray-600 hover:text-blue-600 hover:underline"
              >
                {skill.attributes?.name || skill.value || skill.id}
                {skill.attributes?.level && ` (${skill.attributes.level})`}
              </Link>
              {i < projectSkills.length - 1 && <span className="text-gray-400">, </span>}
            </span>
          ))}
        </div>
      )}
      
      {/* View full project link */}
      <div className="text-sm">
        <Link href={`/${projectId}`} className="text-blue-600 hover:text-blue-800 hover:underline">
          View full project →
        </Link>
      </div>
    </div>
  )
}

function enhanceTextWithLinks(text: string, relatedNodes: any[]): React.ReactNode {
  // More sophisticated text enhancement - look for node references and make them links
  const words = text.split(' ')
  
  return words.map((word, i) => {
    const cleanWord = word.replace(/[.,!?;:]$/, '')
    
    // Check if this word matches any node ID in our related nodes
    const matchingNode = relatedNodes.find(node => 
      node.id.includes(cleanWord.toLowerCase()) || 
      cleanWord.toLowerCase().includes(node.id) ||
      (node.attributes?.title && node.attributes.title.toLowerCase().includes(cleanWord.toLowerCase()))
    )
    
    if (matchingNode) {
      const punctuation = word.replace(cleanWord, '')
      return (
        <span key={i}>
          <Link href={`/${matchingNode.id}`} className="text-blue-600 hover:underline">
            {cleanWord}
          </Link>
          {punctuation}
          {' '}
        </span>
      )
    }
    
    // Fallback: look for dash-separated words that might be node IDs
    if (cleanWord.includes('-') && cleanWord.length > 5 && !cleanWord.includes('http') && !cleanWord.includes('.')) {
      const punctuation = word.replace(cleanWord, '')
      return (
        <span key={i}>
          <Link href={`/${cleanWord}`} className="text-blue-600 hover:underline">
            {cleanWord}
          </Link>
          {punctuation}
          {' '}
        </span>
      )
    }
    
    return word + ' '
  })
}