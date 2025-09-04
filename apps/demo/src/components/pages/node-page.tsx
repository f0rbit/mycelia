import Link from 'next/link'

interface SimpleNodePageProps {
  node: any
  backlinks: any[]
  breadcrumbs: Array<{id: string, title: string}>
}

export function NodePage({ node, backlinks, breadcrumbs }: SimpleNodePageProps) {
  const title = node.attributes?.title || node.attributes?.name || node.id
  
  // Fix the crazy breadcrumbs - only show direct parent chain
  const cleanBreadcrumbs = breadcrumbs.slice(0, 3) // Limit to 3 levels max
  
  return (
    <article className="max-w-4xl mx-auto py-8 px-6">
      {/* Fixed breadcrumb */}
      {cleanBreadcrumbs.length > 1 && (
        <nav className="text-sm text-gray-600 mb-6">
          {cleanBreadcrumbs.map((crumb: any, index: number) => (
            <span key={crumb.id}>
              {index > 0 && <span className="mx-2">›</span>}
              {index < cleanBreadcrumbs.length - 1 ? (
                <Link href={`/${crumb.id}`} className="text-blue-600 hover:underline">
                  {crumb.title}
                </Link>
              ) : (
                <span className="text-gray-900 font-medium">{crumb.title}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Simple content display */}
      <div className="prose prose-lg max-w-none">
        <h1>{title}</h1>
        
        <p className="text-sm text-gray-500 not-prose mb-6">
          <strong>{node.type}</strong> • {node.id}
        </p>
        
        {/* Show the node content - but formatted better */}
        <div className="leading-relaxed">
          {'value' in node && node.value && (
            <div className="mb-6">
              {/* Try to split content into paragraphs */}
              {node.value.split('\n\n').map((paragraph: string, i: number) => (
                <p key={i} className="mb-4">
                  {paragraph.trim()}
                </p>
              ))}
            </div>
          )}
          
          {'content' in node && node.content && (
            <div className="mb-6">
              {/* Split content into paragraphs and try to identify potential links */}
              {node.content.split('\n\n').map((paragraph: string, i: number) => (
                <p key={i} className="mb-4">
                  {paragraph.trim()}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Backlinks section */}
      {backlinks.length > 0 && (
        <footer className="mt-12 pt-6 border-t border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-3">Referenced in</h3>
          <ul className="space-y-1">
            {backlinks.map((backlinkNode: any) => {
              const backlinkTitle = backlinkNode.attributes?.title || backlinkNode.attributes?.name || backlinkNode.id
              return (
                <li key={backlinkNode.id} className="text-sm">
                  <Link 
                    href={`/${backlinkNode.id}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {backlinkTitle}
                  </Link>
                  <span className="ml-2 text-gray-400">
                    ({backlinkNode.type})
                  </span>
                </li>
              )
            })}
          </ul>
        </footer>
      )}
    </article>
  )
}