import { PageHeader, NodeContent, RelatedNodes, ChildNodes } from './shared'
import type { NodePageProps } from './shared'

export function DefaultNodePage(props: NodePageProps) {
  const { node, relatedNodes, childNodes } = props

  return (
    <div className="space-y-8">
      <PageHeader {...props} />
      
      <NodeContent {...props} />

      <div className="grid gap-6 lg:grid-cols-2">
        {childNodes.length > 0 && (
          <ChildNodes {...props} />
        )}
        
        {relatedNodes.length > 0 && (
          <RelatedNodes relatedNodes={relatedNodes} />
        )}
      </div>
    </div>
  )
}