import { notFound } from 'next/navigation';
import { react } from '@mycelia/render';
import { getMyceliaContent } from './provider';
import type { NextJS, ParsedContent } from '../types';

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

  return (
    <div className="mycelia-page">
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