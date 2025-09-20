import { notFound } from 'next/navigation';
// import { react } from '@mycelia/render';
import { getMyceliaContent, getMyceliaProvider } from './provider';
import { NodeRenderer } from './node-renderer';
import type { NextJS, ParsedContent } from '../types';

/**
 * Breadcrumb component props
 */
export interface MyceliaBreadcrumbProps {
  /** Array of breadcrumb items */
  items: Array<{ id: string; title: string; path: string }>;
}

/**
 * Breadcrumb navigation component
 */
export function MyceliaBreadcrumb({ items }: MyceliaBreadcrumbProps) {
  if (!items || items.length <= 1) {
    return null;
  }

  return (
    <nav className="mb-6 text-sm text-muted-foreground">
      {items.map((crumb, index) => (
        <span key={crumb.id}>
          {index > 0 && <span className="mx-2">/</span>}
          {index === items.length - 1 ? (
            <span className="font-medium text-gray-900">{crumb.title}</span>
          ) : (
            <a href={crumb.path} className="hover:text-blue-600">
              {crumb.title}
            </a>
          )}
        </span>
      ))}
    </nav>
  );
}

// const { RenderableTreeRenderer, RenderProvider } = react;

/**
 * Props for MyceliaPage component
 */
export interface MyceliaPageProps extends NextJS.PageProps {
  /** Optional content override (for custom content loading) */
  content?: ParsedContent;
}

/**
 * Universal page component that renders any Mycelia content
 */
export async function MyceliaPage({ params, content: customContent }: MyceliaPageProps) {
  const { slug } = await params;
  
  // Use custom content or load from provider
  const content = customContent || await getMyceliaContent(slug);
  
  if (!content) {
    notFound();
  }

  const firstNodeId = Object.keys(content.graph.nodes)[0];
  const title = content.frontmatter.title || 
                (firstNodeId ? content.graph.nodes[firstNodeId]?.attributes?.title : undefined) ||
                content.slug;

  // Get breadcrumbs and backlinks if we have a node ID
  const provider = getMyceliaProvider();
  let breadcrumbs: Array<{ id: string; title: string; path: string }> = [];
  let backlinks: Array<{ node: any; path: string }> = [];
  
  if (firstNodeId) {
    // Get breadcrumbs
    if (provider.getBreadcrumbs) {
      try {
        breadcrumbs = await provider.getBreadcrumbs(firstNodeId);
      } catch (error) {
        console.warn('Failed to load breadcrumbs:', error);
      }
    }
    
    // Get backlinks
    if (provider.getBacklinks) {
      try {
        backlinks = await provider.getBacklinks(firstNodeId);
      } catch (error) {
        console.warn('Failed to load backlinks:', error);
      }
    }
  }

  return (
    <div className="mycelia-page">
      {/* Breadcrumb navigation */}
      <MyceliaBreadcrumb items={breadcrumbs} />
      
      {/* Page header with frontmatter data */}
      <header className="mycelia-page-header space-y-4 pb-6 border-b mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {content.frontmatter.description && (
            <p className="text-lg text-muted-foreground mt-2">
              {content.frontmatter.description}
            </p>
          )}
        </div>
        
        {/* Metadata */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {/* Get node attributes from first node */}
          {firstNodeId && (() => {
            const node = content.graph.nodes[firstNodeId];
            if (!node?.attributes) return null;
            
            return (
              <>
                {node.attributes.status && <StatusBadge status={node.attributes.status} />}
                
                {node.attributes.startDate && (
                  <span className="inline-flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    {new Date(node.attributes.startDate).getFullYear()}
                    {node.attributes.endDate && ` - ${new Date(node.attributes.endDate).getFullYear()}`}
                  </span>
                )}
                
                {node.attributes.location && (
                  <span className="inline-flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {node.attributes.location}
                  </span>
                )}

                {node.attributes.url && (
                  <a 
                    href={node.attributes.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                      <path d="M5 5a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2v-2a1 1 0 10-2 0v2H5V7h2a1 1 0 000-2H5z" />
                    </svg>
                    View External
                  </a>
                )}

                {node.attributes.level && (
                  <span className="inline-flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                    </svg>
                    Level: {node.attributes.level}
                  </span>
                )}
              </>
            );
          })()}
          
          {/* Fallback to frontmatter */}
          {content.frontmatter.date && (
            <span>
              {new Date(content.frontmatter.date).toLocaleDateString()}
            </span>
          )}
          
          {content.frontmatter.category && (
            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
              {content.frontmatter.category}
            </span>
          )}
          
          {content.frontmatter.tags && Array.isArray(content.frontmatter.tags) && (
            <div className="flex gap-2">
              {content.frontmatter.tags.map((tag: string) => (
                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="mt-8 space-y-8">
        {/* Main node content */}
        {firstNodeId && content.graph.nodes[firstNodeId] && (() => {
          const mainNode = content.graph.nodes[firstNodeId];
          return (
            <div className="mycelia-content">
              <div className="prose prose-lg max-w-none">
                {'content' in mainNode && mainNode.content && (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <p className="text-lg">{mainNode.content}</p>
                  </div>
                )}
                {'value' in mainNode && mainNode.value && (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <p className="text-lg">{mainNode.value}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Display related nodes only (excluding the main node) */}
        {Object.keys(content.graph.nodes).length > 1 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Related Content</h2>
            <NodeRenderer 
              nodes={content.graph.nodes} 
              nodeIds={Object.keys(content.graph.nodes).filter(id => id !== firstNodeId)}
            />
          </div>
        )}

        {/* Child nodes - nodes contained by this one */}
        <MyceliaChildNodes nodeId={firstNodeId} />

        {/* Related nodes - nodes that reference or are referenced by this one */}
        <MyceliaRelatedNodes nodeId={firstNodeId} />

        {/* Backlinks */}
        <MyceliaBacklinks backlinks={backlinks} />
      </div>

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-12 p-4 bg-gray-50 rounded-lg">
          <summary className="cursor-pointer text-sm font-medium text-gray-700">
            Debug Info
          </summary>
          <div className="mt-2 space-y-2 text-xs text-gray-600">
            <div><strong>Slug:</strong> {content.slug}</div>
            <div><strong>File Path:</strong> {content.filePath}</div>
            <div><strong>Last Modified:</strong> {content.mtime.toISOString()}</div>
            <div><strong>Nodes:</strong> {Object.keys(content.graph.nodes).length}</div>
            <div><strong>Edges:</strong> {content.graph.edges.length}</div>
            {Object.keys(content.frontmatter).length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer font-medium">Frontmatter</summary>
                <pre className="mt-1 text-xs overflow-x-auto">
                  {JSON.stringify(content.frontmatter, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </details>
      )}
    </div>
  );
}

/**
 * Simple content listing component
 */
export interface MyceliaListProps {
  /** Array of content to display */
  content: ParsedContent[];
  /** Optional title for the list */
  title?: string;
  /** Optional filter function */
  filter?: (content: ParsedContent) => boolean;
  /** Optional sort function */
  sort?: (a: ParsedContent, b: ParsedContent) => number;
}

export function MyceliaList({ 
  content, 
  title = 'Content', 
  filter, 
  sort 
}: MyceliaListProps) {
  let filteredContent = filter ? content.filter(filter) : content;
  
  if (sort) {
    filteredContent = [...filteredContent].sort(sort);
  }

  return (
    <div className="mycelia-list">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      
      <div className="space-y-6">
        {filteredContent.map((item) => {
          const firstNodeId = Object.keys(item.graph.nodes)[0];
          const title = item.frontmatter.title || 
                       (firstNodeId ? item.graph.nodes[firstNodeId]?.attributes?.title : undefined) ||
                       item.slug;
          
          return (
            <article key={item.slug} className="border-l-4 border-blue-100 pl-6 py-4">
              <h3 className="text-xl font-semibold mb-2">
                <a href={`/${item.slug}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                  {title}
                </a>
              </h3>
              
              {item.frontmatter.description && (
                <p className="text-gray-600 mb-3">{item.frontmatter.description}</p>
              )}
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {item.frontmatter.date && (
                  <span>{new Date(item.frontmatter.date).toLocaleDateString()}</span>
                )}
                
                {item.frontmatter.category && (
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                    {item.frontmatter.category}
                  </span>
                )}
                
                <span>{Object.keys(item.graph.nodes).length} nodes</span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Props for the Index component
 */
export interface MyceliaIndexProps {
  /** The node type to index (e.g., 'project', 'tag', 'skill') */
  of: string;
  /** Title for the index page */
  title?: string;
  /** Sort options */
  sortBy?: 'title' | 'date' | 'count' | 'status';
  /** Group options */
  groupBy?: 'category' | 'status' | 'type';
  /** Show counts for each item */
  showCounts?: boolean;
  /** Show only published items */
  publishedOnly?: boolean;
  /** Custom filter function */
  filter?: (node: any) => boolean;
}

/**
 * Index component that displays all nodes of a given type
 */
export async function MyceliaIndex({ 
  of: nodeType, 
  title,
  sortBy = 'title',
  groupBy,
  showCounts = false,
  publishedOnly = true,
  filter
}: MyceliaIndexProps) {
  const provider = getMyceliaProvider();
  const nodesOfType = await provider.getNodesByType?.(nodeType);
  
  if (!nodesOfType || nodesOfType.length === 0) {
    return (
      <div className="mycelia-index">
        <h1 className="text-3xl font-bold mb-6">
          {title || `All ${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)}s`}
        </h1>
        <p className="text-gray-600">No {nodeType}s found.</p>
      </div>
    );
  }

  let nodes = nodesOfType.map(item => item.node);

  // Apply filter if provided
  if (filter) {
    nodes = nodes.filter(filter);
  }

  // Apply published filter
  if (publishedOnly) {
    nodes = nodes.filter(node => 
      node.attributes?.published !== false && 
      node.attributes?.draft !== true
    );
  }

  // Sort nodes
  nodes = [...nodes].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        const titleA = a.attributes?.title || a.attributes?.name || a.id;
        const titleB = b.attributes?.title || b.attributes?.name || b.id;
        return String(titleA).localeCompare(String(titleB));
      
      case 'date':
        const dateA = new Date(a.attributes?.date || a.attributes?.createdAt || 0);
        const dateB = new Date(b.attributes?.date || b.attributes?.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      
      case 'status':
        const statusA = a.attributes?.status || 'unknown';
        const statusB = b.attributes?.status || 'unknown';
        return String(statusA).localeCompare(String(statusB));
      
      default:
        return 0;
    }
  });

  // Group nodes if requested
  const groupedNodes: Record<string, any[]> = {};
  if (groupBy) {
    for (const node of nodes) {
      const groupKey = node.attributes?.[groupBy] || 'Other';
      if (!groupedNodes[groupKey]) {
        groupedNodes[groupKey] = [];
      }
      groupedNodes[groupKey].push(node);
    }
  } else {
    groupedNodes['All'] = nodes;
  }

  const getNodeTitle = (node: any) => 
    node.attributes?.title || node.attributes?.name || node.attributes?.value || node.id;

  const getNodeDescription = (node: any) => 
    node.attributes?.description || node.attributes?.summary || node.value || null;

  const getNodeUrl = (node: any) => node.hierarchicalPath || `/${node.id}`;

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': case 'done': case 'published':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'in-progress': case 'active': case 'working':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'planned': case 'todo': case 'upcoming':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'archived': case 'deprecated': case 'cancelled':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-purple-50 text-purple-700 border-purple-200';
    }
  };

  return (
    <div className="mycelia-index">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-4">
          {title || `All ${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)}s`}
        </h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{nodes.length} {nodeType}(s) total</span>
          {groupBy && <span>Grouped by {groupBy}</span>}
          <span>Sorted by {sortBy}</span>
        </div>
      </header>

      {/* Content */}
      <div className="space-y-8">
        {Object.entries(groupedNodes).map(([groupName, groupNodes]) => (
          <section key={groupName}>
            {groupBy && Object.keys(groupedNodes).length > 1 && (
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b">
                {groupName} 
                {showCounts && ` (${groupNodes.length})`}
              </h2>
            )}
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {groupNodes.map((node) => (
                <article 
                  key={node.id} 
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <h3 className="font-medium mb-2">
                    <a 
                      href={getNodeUrl(node)} 
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {getNodeTitle(node)}
                    </a>
                  </h3>
                  
                  {getNodeDescription(node) && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {getNodeDescription(node)}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 text-xs">
                    {node.attributes?.status && (
                      <span className={`px-2 py-1 rounded-full border ${getStatusBadgeColor(node.attributes.status)}`}>
                        {node.attributes.status}
                      </span>
                    )}
                    
                    {node.attributes?.category && (
                      <span className="px-2 py-1 bg-gray-50 text-gray-700 rounded-full">
                        {node.attributes.category}
                      </span>
                    )}
                    
                    {node.attributes?.date && (
                      <span className="text-gray-500">
                        {new Date(node.attributes.date).toLocaleDateString()}
                      </span>
                    )}
                    
                    {showCounts && node.attributes?.count && (
                      <span className="text-gray-500">
                        {node.attributes.count} uses
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

/**
 * Simplified backlinks component props
 */
export interface MyceliaBacklinksProps {
  /** Array of backlink items with simplified format */
  backlinks: Array<{ node: any; path: string }>;
}

/**
 * Simplified backlinks component that shows which nodes reference this content
 */
export function MyceliaBacklinks({ backlinks }: MyceliaBacklinksProps) {
  if (!backlinks || backlinks.length === 0) {
    return null;
  }

  // Group backlinks by node type
  const groupedBacklinks = backlinks.reduce((acc, { node, path }) => {
    const nodeType = node.type || 'unknown';
    if (!acc[nodeType]) {
      acc[nodeType] = [];
    }
    acc[nodeType].push({ node, path });
    return acc;
  }, {} as Record<string, Array<{ node: any; path: string }>>);

  const getTypeDisplayName = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1) + 's';
  };

  const getNodeTitle = (node: any) => {
    if (node.primitive === 'Content' && node.title) return node.title;
    if (node.primitive === 'Meta' && node.value) return node.value;
    if (node.attributes?.title) return node.attributes.title;
    if (node.attributes?.name) return node.attributes.name;
    return node.id || 'Untitled';
  };

  return (
    <aside className="mt-12 p-6 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">
        Referenced by {backlinks.length} {backlinks.length === 1 ? 'item' : 'items'}
      </h3>
      
      <div className="space-y-4">
        {Object.entries(groupedBacklinks).map(([type, links]) => (
          <div key={type}>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              {getTypeDisplayName(type)} ({links.length})
            </h4>
            
            <ul className="space-y-2">
              {links.map(({ node, path }) => (
                <li key={node.id} className="flex items-start gap-3">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full mt-0.5">
                    {node.primitive}
                  </span>
                  <a 
                    href={path}
                    className="text-blue-600 hover:text-blue-800 hover:underline text-sm flex-1"
                  >
                    {getNodeTitle(node)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}

/**
 * Status badge component with semantic colors
 */
export interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
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

/**
 * Component to display child nodes (nodes contained by this one)
 */
export interface MyceliaChildNodesProps {
  nodeId?: string;
}

export async function MyceliaChildNodes({ nodeId }: MyceliaChildNodesProps) {
  if (!nodeId) return null;
  
  const provider = getMyceliaProvider();
  const allContent = await provider.getAllContent();
  
  // Find child nodes by looking for containment edges
  const childNodes: any[] = [];
  for (const content of allContent) {
    if (content.graph.edges) {
      for (const edge of content.graph.edges) {
        if (edge.from === nodeId && edge.type === 'contains') {
          // Find the child node
          for (const contentItem of allContent) {
            if (contentItem.graph.nodes[edge.to]) {
              childNodes.push(contentItem.graph.nodes[edge.to]);
              break;
            }
          }
        }
      }
    }
  }
  
  if (childNodes.length === 0) return null;
  
  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Contains</h2>
      <div className="grid gap-3">
        {childNodes.map(child => (
          <div key={child.id} className="border-l-4 border-blue-200 pl-4 py-2">
            <a 
              href={`/${child.id}`} 
              className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
            >
              {child.attributes?.title || child.attributes?.name || child.id}
            </a>
            <span className="ml-2 text-sm text-muted-foreground">({child.type})</span>
            {'value' in child && child.value && (
              <p className="text-sm text-muted-foreground mt-1">
                {child.value.substring(0, 150)}
                {child.value.length > 150 && '...'}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * Component to display related nodes (nodes that reference or are referenced by this one)
 */
export interface MyceliaRelatedNodesProps {
  nodeId?: string;
}

export async function MyceliaRelatedNodes({ nodeId }: MyceliaRelatedNodesProps) {
  if (!nodeId) return null;
  
  const provider = getMyceliaProvider();
  const allContent = await provider.getAllContent();
  
  // Find related nodes by looking for reference edges (both directions)
  const relatedNodes: any[] = [];
  const processedIds = new Set<string>();
  
  for (const content of allContent) {
    if (content.graph.edges) {
      for (const edge of content.graph.edges) {
        let targetNodeId: string | null = null;
        
        // Check if this node references another (outbound)
        if (edge.from === nodeId && edge.type === 'references' && !processedIds.has(edge.to)) {
          targetNodeId = edge.to;
        }
        // Check if another node references this one (inbound) - exclude containment
        else if (edge.to === nodeId && edge.type === 'references' && !processedIds.has(edge.from)) {
          targetNodeId = edge.from;
        }
        
        if (targetNodeId) {
          processedIds.add(targetNodeId);
          // Find the target node
          for (const contentItem of allContent) {
            if (contentItem.graph.nodes[targetNodeId]) {
              relatedNodes.push(contentItem.graph.nodes[targetNodeId]);
              break;
            }
          }
        }
      }
    }
  }
  
  if (relatedNodes.length === 0) return null;
  
  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Related</h2>
      <div className="flex flex-wrap gap-2">
        {relatedNodes.map(related => (
          <a
            key={related.id}
            href={`/${related.id}`}
            className="inline-flex items-center px-3 py-1 bg-gray-50 border border-gray-200 rounded-md text-sm hover:bg-gray-100"
          >
            {related.attributes?.title || related.attributes?.name || related.id}
            <span className="ml-1 text-xs text-muted-foreground">({related.type})</span>
          </a>
        ))}
      </div>
    </section>
  );
}
