import { notFound } from 'next/navigation';
import { react } from '@mycelia/render';
import { getMyceliaContent, getMyceliaProvider } from './provider';
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
    <nav className="flex items-center space-x-1 text-sm text-gray-600 mb-6">
      {items.map((item, index) => (
        <div key={item.id} className="flex items-center">
          {index > 0 && (
            <span className="mx-2 text-gray-400">/</span>
          )}
          {index === items.length - 1 ? (
            <span className="text-gray-900 font-medium">{item.title}</span>
          ) : (
            <a 
              href={item.path} 
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              {item.title}
            </a>
          )}
        </div>
      ))}
    </nav>
  );
}

const { RenderableTreeRenderer, RenderProvider } = react;

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
  let backlinks: Array<{ id: string; title: string; path: string; type: string; relation: string }> = [];
  
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
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
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

      {/* Rendered content */}
      <div className="mycelia-content prose prose-lg max-w-none">
        <RenderProvider>
          <RenderableTreeRenderer tree={content.renderTree} />
        </RenderProvider>
      </div>

      {/* Backlinks */}
      <MyceliaBacklinks backlinks={backlinks} />

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
  const nodesByType = await provider.getNodesByType?.();
  
  if (!nodesByType || !nodesByType[nodeType]) {
    return (
      <div className="mycelia-index">
        <h1 className="text-3xl font-bold mb-6">
          {title || `All ${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)}s`}
        </h1>
        <p className="text-gray-600">No {nodeType}s found.</p>
      </div>
    );
  }

  let nodes = nodesByType[nodeType];

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
 * Backlinks component props
 */
export interface MyceliaBacklinksProps {
  /** Array of backlink items */
  backlinks: Array<{ id: string; title: string; path: string; type: string; relation: string }>;
}

/**
 * Backlinks component that shows which nodes reference this content
 */
export function MyceliaBacklinks({ backlinks }: MyceliaBacklinksProps) {
  if (!backlinks || backlinks.length === 0) {
    return null;
  }

  // Group backlinks by type
  const groupedBacklinks = backlinks.reduce((acc, backlink) => {
    if (!acc[backlink.type]) {
      acc[backlink.type] = [];
    }
    const typeGroup = acc[backlink.type];
    if (typeGroup) {
      typeGroup.push(backlink);
    }
    return acc;
  }, {} as Record<string, typeof backlinks>);

  const getTypeDisplayName = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1) + 's';
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
              {links.map((link) => (
                <li key={link.id} className="flex items-start gap-3">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full mt-0.5">
                    {link.relation}
                  </span>
                  <a 
                    href={link.path}
                    className="text-blue-600 hover:text-blue-800 hover:underline text-sm flex-1"
                  >
                    {link.title}
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