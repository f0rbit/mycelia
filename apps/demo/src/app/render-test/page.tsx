'use client'

import type { RenderableTree, RenderableNode } from '@mycelia/core'
import { useEffect, useState } from 'react'
import Link from 'next/link'

// Clean component for rendering individual nodes - matches demo app styling
function CleanNodeRenderer({ node }: { node: RenderableNode }) {
  const title = node.props.title || node.props.name || node.content?.split('\n')[0] || node.id
  
  // Render different node types with clean styling
  switch (node.primitive) {
    case 'Leaf':
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-md text-sm">
          <span className="text-blue-700 font-medium">{title}</span>
          {node.props.status && (
            <span className="text-xs px-2 py-0.5 bg-blue-600 text-white rounded-full">
              {node.props.status}
            </span>
          )}
          {node.props.level && (
            <span className="text-xs text-blue-600">
              ({node.props.level})
            </span>
          )}
        </div>
      )
    
    case 'Branch':
    case 'List':
      return (
        <article className="border-l-4 border-blue-100 pl-6 space-y-4 mb-8">
          <header className="space-y-2">
            <div className="flex items-center gap-3">
              <Link 
                href={`/${node.id}`} 
                className="text-2xl font-bold text-gray-900 hover:text-blue-600 hover:underline"
              >
                {title}
              </Link>
              {node.props.status && (
                <StatusBadge status={node.props.status} />
              )}
            </div>
            
            {node.props.category && (
              <p className="text-sm text-gray-600 font-medium uppercase tracking-wide">
                {node.props.category.replace(/-/g, ' ')}
              </p>
            )}
          </header>
          
          {node.content && node.children.length === 0 && (
            <div className="prose prose-lg max-w-none">
              <div className="text-lg leading-relaxed">
                {node.content.split('\n\n').slice(0, 2).map((paragraph: string, i: number) => (
                  paragraph.trim() && (
                    <p key={i} className="mb-4 text-gray-700">
                      {paragraph.trim()}
                    </p>
                  )
                ))}
              </div>
            </div>
          )}
          
          {/* Child nodes */}
          {node.children.length > 0 && (
            <div className="space-y-4 ml-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">
                {node.type === 'project' ? 'Components' : 'Items'}
              </h4>
              <div className="grid gap-3">
                {node.children.map((child: RenderableNode) => (
                  <CleanNodeRenderer key={child.id} node={child} />
                ))}
              </div>
            </div>
          )}
        </article>
      )
    
    case 'Meta':
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {title}
          {node.props.level && ` (${node.props.level})`}
        </span>
      )
    
    case 'Trunk':
      return (
        <div className="space-y-8">
          {node.children.map((child: RenderableNode) => (
            <CleanNodeRenderer key={child.id} node={child} />
          ))}
        </div>
      )
    
    default:
      return (
        <div className="p-3 border-l-4 border-gray-300 bg-gray-50">
          <span className="text-sm text-gray-600">
            {node.primitive}: {title}
          </span>
        </div>
      )
  }
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

export default function RenderTest() {
  const [tree, setTree] = useState<RenderableTree | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadRenderTree() {
      try {
        console.log('Attempting to fetch /.mycelia/renderable.json')
        const response = await fetch('/.mycelia/renderable.json')
        console.log('Response status:', response.status, response.statusText)
        
        if (!response.ok) {
          throw new Error(`Failed to load renderable tree: ${response.status} ${response.statusText}`)
        }
        
        const data = await response.json()
        console.log('Successfully loaded tree with', Object.keys(data).length, 'root keys')
        setTree(data)
      } catch (err) {
        console.error('Error loading render tree:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    loadRenderTree()
  }, [])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading content...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-6">
        <div className="border-l-4 border-red-400 pl-4 py-4 bg-red-50 rounded">
          <h2 className="text-lg font-semibold text-red-800">Error Loading Content</h2>
          <p className="text-red-700 mt-2">{error}</p>
          <p className="text-sm text-red-600 mt-2">
            Make sure the content has been parsed by running: <code>node packages/cli/dist/cli.js parse "examples/*.mdx"</code>
          </p>
        </div>
      </div>
    )
  }

  if (!tree) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-6">
        <p className="text-muted-foreground">No content tree available.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <header className="space-y-4 pb-6 border-b mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clean Render Test</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Professional styled rendering (no emojis)
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          This uses the same clean styling approach as the portfolio-showcase page
        </p>
      </header>

      <div className="prose prose-lg max-w-none">
        <CleanNodeRenderer node={tree.root} />
      </div>

      <footer className="mt-12 pt-4 border-t text-sm text-muted-foreground">
        <p>
          Content rendered with clean professional styling. 
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