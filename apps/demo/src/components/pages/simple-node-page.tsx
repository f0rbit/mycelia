import Link from 'next/link'
import { MyceliaContent } from '@/components/mycelia-content'
import type { NodePageProps } from './shared'

export function SimpleNodePage({ node, relatedNodes, childNodes, parentNode, breadcrumbs }: NodePageProps) {
  const title = node.attributes?.title || node.attributes?.name || node.id
  
  return (
    <article className="max-w-3xl mx-auto py-8 px-4">
      {/* Simple breadcrumb */}
      {breadcrumbs.length > 1 && (
        <nav className="text-sm text-gray-600 mb-4">
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.id}>
              {index > 0 && <span className="mx-2">›</span>}
              {index < breadcrumbs.length - 1 ? (
                <Link href={`/${crumb.id}`} className="hover:text-blue-600">
                  {crumb.title}
                </Link>
              ) : (
                <span className="font-medium">{crumb.title}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Main content */}
      <div className="prose prose-lg max-w-none">
        <h1>{title}</h1>
        
        {/* Show node content if it exists */}
        {'value' in node && node.value && (
          <div className="whitespace-pre-wrap leading-relaxed">
            {node.value}
          </div>
        )}
        
        {'content' in node && node.content && (
          <div className="whitespace-pre-wrap leading-relaxed">
            {node.content}
          </div>
        )}

        {/* Show child content hierarchically */}
        {childNodes.length > 0 && (
          <div className="mt-8 space-y-6">
            {childNodes.map(child => {
              const childTitle = child.attributes?.title || child.attributes?.name || child.id
              const childContent = 'value' in child ? child.value : 'content' in child ? child.content : ''
              
              return (
                <section key={child.id} className="border-l-2 border-gray-200 pl-6">
                  <h2 className="text-xl font-semibold mb-3">
                    <Link href={`/${child.id}`} className="text-blue-600 hover:text-blue-800 no-underline">
                      {childTitle}
                    </Link>
                  </h2>
                  
                  {childContent && (
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {childContent.length > 300 ? 
                        `${childContent.substring(0, 300)}...` : 
                        childContent
                      }
                    </div>
                  )}
                  
                  <div className="mt-2">
                    <Link 
                      href={`/${child.id}`} 
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Read more →
                    </Link>
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </div>

      {/* Simple related/referenced section */}
      {relatedNodes.length > 0 && (
        <footer className="mt-12 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Referenced in</h3>
          <div className="flex flex-wrap gap-2">
            {relatedNodes.map(relatedNode => {
              const relatedTitle = relatedNode.attributes?.title || relatedNode.attributes?.name || relatedNode.id
              return (
                <Link 
                  key={relatedNode.id} 
                  href={`/${relatedNode.id}`}
                  className="inline-block bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-sm text-gray-700 no-underline transition-colors"
                >
                  {relatedTitle}
                </Link>
              )
            })}
          </div>
        </footer>
      )}
    </article>
  )
}