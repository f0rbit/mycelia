import Link from 'next/link'
import { MyceliaContent } from '@/components/mycelia-content'
import { loadRenderTree } from '@/lib/content'

export default async function RenderTest() {
  const tree = await loadRenderTree()

  if (!tree) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-6">
        <div className="border-l-4 border-red-400 pl-4 py-4 bg-red-50 rounded">
          <h2 className="text-lg font-semibold text-red-800">Content Not Available</h2>
          <p className="text-red-700 mt-2">
            No renderable tree found. The content needs to be parsed first.
          </p>
          <p className="text-sm text-red-600 mt-2">
            Make sure the content has been parsed by running the CLI or ensure /.mycelia/renderable.json exists.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <header className="space-y-4 pb-6 border-b mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clean Render Test</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Content rendered using updated @mycelia/render package with clean styling
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          The @mycelia/render package now uses professional, clean styling by default (no backgrounds, cards, or emojis)
        </p>
      </header>

      <div className="prose prose-lg max-w-none">
        <MyceliaContent tree={tree} />
      </div>

      <footer className="mt-12 pt-4 border-t text-sm text-muted-foreground">
        <p>
          Content rendered using the updated @mycelia/render package with clean professional styling. 
          {tree?.meta && (
            <>
              {' '}Tree has <strong>{tree.meta.totalNodes} nodes</strong> 
              with <strong>{tree.meta.unresolvedRefs?.length || 0} unresolved references</strong>.
            </>
          )}
        </p>
        <div className="mt-2 flex gap-4">
          <Link href="/portfolio-showcase" className="text-blue-600 hover:underline">
            Compare with Portfolio Showcase
          </Link>
          <Link href="/" className="text-blue-600 hover:underline">
            Back to Home
          </Link>
        </div>
      </footer>
    </div>
  )
}