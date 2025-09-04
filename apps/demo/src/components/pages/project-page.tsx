import { Github, Globe } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader, NodeContent, RelatedNodes, ChildNodes } from './shared'
import type { NodePageProps } from './shared'

export function ProjectPage(props: NodePageProps) {
  const { node, relatedNodes, childNodes } = props

  // Extract project-specific attributes
  const techStack = node.attributes?.techStack || node.attributes?.technologies || []
  const demoUrl = node.attributes?.demoUrl || node.attributes?.url
  const repoUrl = node.attributes?.repoUrl || node.attributes?.repository
  const category = node.attributes?.category
  const status = node.attributes?.status

  return (
    <div className="space-y-8">
      <PageHeader {...props} />
      
      {/* Project info cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {category && (
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{category}</div>
                <div className="text-sm text-muted-foreground">Category</div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {status && (
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  status === 'active' ? 'text-green-600' :
                  status === 'completed' ? 'text-blue-600' :
                  status === 'archived' ? 'text-gray-600' :
                  'text-yellow-600'
                }`}>
                  {status}
                </div>
                <div className="text-sm text-muted-foreground">Status</div>
              </div>
            </CardContent>
          </Card>
        )}

        {(node.attributes?.startDate || node.attributes?.endDate) && (
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-sm font-medium">
                  {node.attributes?.startDate && new Date(node.attributes.startDate).getFullYear()}
                  {node.attributes?.endDate && ` - ${new Date(node.attributes.endDate).getFullYear()}`}
                </div>
                <div className="text-sm text-muted-foreground">Timeline</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Links section */}
      {(demoUrl || repoUrl) && (
        <Card>
          <CardHeader>
            <CardTitle>Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
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
                    <Github className="w-4 h-4 mr-2" />
                    Repository
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tech stack */}
      {Array.isArray(techStack) && techStack.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Technology Stack</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech: string) => (
                <span key={tech} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  {tech}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <NodeContent {...props} />

      <div className="grid gap-6 lg:grid-cols-2">
        {childNodes.length > 0 && (
          <ChildNodes {...props} />
        )}
        
        {relatedNodes.length > 0 && (
          <RelatedNodes relatedNodes={relatedNodes} title="Related Projects & Skills" />
        )}
      </div>
    </div>
  )
}