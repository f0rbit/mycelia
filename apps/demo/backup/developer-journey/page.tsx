import { notFound } from 'next/navigation'
import { loadNode, loadNodeAsRenderTree } from '@/lib/content'
import { MyceliaContent } from '@/components/mycelia-content'

export default async function DeveloperJourneyPage() {
  const nodeData = await loadNode('developer-journey')
  const renderTree = await loadNodeAsRenderTree('developer-journey')
  
  if (!nodeData?.node) {
    notFound()
  }

  const { node, childNodes } = nodeData

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="space-y-4 pb-6 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {node.attributes?.title || 'Developer Journey'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">timeline</p>
        </div>
        
        <p className="text-lg text-muted-foreground">
          Complete programming journey from Scratch to professional development
        </p>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span><strong>{childNodes.length}</strong> items</span>
          <span><strong>{node.type}</strong></span>
        </div>
      </div>

      <div className="mt-8 max-w-none">
        {renderTree ? (
          <MyceliaContent tree={renderTree} />
        ) : (
          <div className="text-muted-foreground">
            Content tree not available. Please ensure the content has been parsed.
          </div>
        )}
      </div>
    </div>
  )
}