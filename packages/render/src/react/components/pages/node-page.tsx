import type { MyceliaNode } from '@mycelia/core'
import { PortfolioPage } from './portfolio-page'

export interface NodePageProps {
  node: MyceliaNode
  graph?: any
  renderTree?: any
  children?: any[]
}

export function NodePage(props: NodePageProps) {
  const { node } = props
  
  // Route to specialized component based on node type
  switch (node.type) {
    case 'portfolio':
      return <PortfolioPage {...props} />
    
    default:
      // Simple default rendering for other node types
      return (
        <div className="max-w-4xl mx-auto py-8 px-6">
          <header className="space-y-4 pb-6 border-b mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {'title' in node.attributes && node.attributes.title ? node.attributes.title : 
                 'name' in node.attributes && node.attributes.name ? node.attributes.name : 
                 'value' in node && node.value ? node.value : 
                 node.id}
              </h1>
              <p className="text-lg text-muted-foreground mt-2 capitalize">
                {node.type}
              </p>
            </div>
          </header>
          
          <div className="prose max-w-none">
            {node.primitive === 'Branch' && 'content' in node && node.content && (
              <div dangerouslySetInnerHTML={{ __html: node.content }} />
            )}
            {node.primitive === 'Leaf' && 'value' in node && node.value && (
              <p>{node.value}</p>
            )}
          </div>
        </div>
      )
  }
}