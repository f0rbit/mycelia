import { loadExample } from '@/lib/content'
import { MyceliaContent } from '@/components/mycelia-content'

export default async function DeveloperJourneyPage() {
  const { renderTree, stats } = await loadExample('developer-journey')

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="space-y-4 pb-6 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Developer Journey</h1>
          <p className="text-sm text-muted-foreground mt-1">timeline</p>
        </div>
        
        <p className="text-lg text-muted-foreground">
          Complete programming journey from Scratch to professional development
        </p>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span><strong>{stats.nodeCount}</strong> nodes</span>
          <span><strong>{stats.edgeCount}</strong> connections</span>
        </div>
      </div>

      <div className="mt-8 max-w-none">
        <MyceliaContent tree={renderTree} />
      </div>
    </div>
  )
}