import { Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader, RelatedNodes } from './shared'
import type { NodePageProps } from './shared'
import Link from 'next/link'

export function ProjectPage(props: NodePageProps) {
  const { node, relatedNodes, childNodes } = props

  // Extract project-specific attributes
  const demoUrl = node.attributes?.demoUrl || node.attributes?.url || node.attributes?.liveUrl
  const repoUrl = node.attributes?.repoUrl || node.attributes?.repository || node.attributes?.githubUrl

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <PageHeader {...props} />
      
      <div className="mt-8 space-y-8">

      {/* Links section */}
      {(demoUrl || repoUrl) && (
        <div className="flex gap-3">
          {demoUrl && (
            <Button asChild>
              <a href={demoUrl} target="_blank" rel="noopener noreferrer">
                <Globe className="w-4 h-4 mr-2" />
                Live Demo
              </a>
            </Button>
          )}
          {repoUrl && (
            <Button variant="outline" asChild>
              <a href={repoUrl} target="_blank" rel="noopener noreferrer">
                <Globe className="w-4 h-4 mr-2" />
                Repository
              </a>
            </Button>
          )}
        </div>
      )}
      
      {/* Enhanced content with inline child node links */}
      <EnhancedProjectContent node={node} childNodes={childNodes} relatedNodes={relatedNodes} />

        {relatedNodes.length > 0 && (
          <RelatedNodes relatedNodes={relatedNodes} title="Related Projects & Skills" />
        )}
      </div>
    </div>
  )
}

function EnhancedProjectContent({ node, childNodes, relatedNodes }: {
  node: any,
  childNodes: any[],
  relatedNodes: any[]
}) {
  const content = 'value' in node ? node.value : 'content' in node ? node.content : ''
  
  if (!content) return null

  // Split content into paragraphs
  const paragraphs = content.split('\n\n').filter((p: string) => p.trim().length > 0)
  
  // Get child nodes grouped by type
  const skills = childNodes.filter(child => child.type === 'skill' || child.metaType === 'skill')
  const tags = childNodes.filter(child => child.type === 'tag')
  const notes = childNodes.filter(child => child.type === 'note')

  return (
    <div className="space-y-6">
      {/* Main content with enhanced links */}
      <div className="prose prose-gray max-w-none">
        {paragraphs.map((paragraph: string, i: number) => (
          <p key={i} className="text-gray-700 leading-relaxed mb-4">
            {enhanceTextWithLinks(paragraph.trim(), relatedNodes, childNodes)}
          </p>
        ))}
      </div>

      {/* Notes - styled like Obsidian callouts */}
      {notes.length > 0 && (
        <div className="space-y-3">
          {notes.map((note: any) => (
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
      )}

      {/* Tags and Skills */}
      {(tags.length > 0 || skills.length > 0) && (
        <div className="space-y-3 pt-4 border-t border-gray-100">
          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag: any) => (
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
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="text-gray-500">Skills:</span>
              {skills.map((skill: any, i: number) => (
                <span key={skill.id}>
                  <Link
                    href={`/${skill.id}`}
                    className="text-gray-600 hover:text-blue-600 hover:underline"
                  >
                    {skill.attributes?.name || skill.value || skill.id}
                    {skill.attributes?.level && ` (${skill.attributes.level})`}
                  </Link>
                  {i < skills.length - 1 && <span className="text-gray-400">, </span>}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function enhanceTextWithLinks(text: string, relatedNodes: any[], childNodes: any[]): React.ReactNode {
  // Enhanced text with cross-links
  const allNodes = [...relatedNodes, ...childNodes]
  const words = text.split(' ')
  
  return words.map((word, i) => {
    const cleanWord = word.replace(/[.,!?;:]$/, '')
    
    // Check if this word matches any node
    const matchingNode = allNodes.find(node => 
      node.id.includes(cleanWord.toLowerCase()) || 
      cleanWord.toLowerCase().includes(node.id) ||
      (node.attributes?.title && node.attributes.title.toLowerCase().includes(cleanWord.toLowerCase())) ||
      (node.attributes?.name && node.attributes.name.toLowerCase().includes(cleanWord.toLowerCase()))
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
    
    return word + ' '
  })
}