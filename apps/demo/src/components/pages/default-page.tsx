import { PageHeader, NodeContent, RelatedNodes, ChildNodes } from './shared'
import type { NodePageProps } from './shared'

export function DefaultNodePage(props: NodePageProps) {
  const { relatedNodes, childNodes } = props

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <PageHeader {...props} />
      
      <div className="mt-8 space-y-8">
        <NodeContent {...props} />

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