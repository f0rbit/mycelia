// Example: app/page.tsx  
// This shows how to create a home page that lists all content

import { nextjs } from '@mycelia/ssr';

const { 
  MyceliaList, 
  getAllMyceliaContent,
  sortByDate,
  filterPublished 
} = nextjs;

export default async function HomePage() {
  const allContent = await getAllMyceliaContent();
  
  // Filter and sort content
  const publishedContent = allContent.filter(filterPublished);
  const recentContent = publishedContent.sort(sortByDate).slice(0, 10);
  
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <header className="space-y-4 pb-6 border-b mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          My Mycelia Site
        </h1>
        <p className="text-lg text-muted-foreground">
          Welcome to my knowledge base with {allContent.length} interconnected pieces of content.
        </p>
      </header>

      <MyceliaList 
        content={recentContent}
        title="Recent Content"
        sort={sortByDate}
      />
      
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">All Content</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {publishedContent.map((item) => (
            <div key={item.slug} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-semibold mb-2">
                <a href={`/${item.slug}`} className="text-blue-600 hover:text-blue-800">
                  {item.frontmatter.title || item.slug}
                </a>
              </h3>
              {item.frontmatter.description && (
                <p className="text-sm text-gray-600 mb-3">
                  {item.frontmatter.description}
                </p>
              )}
              <div className="text-xs text-gray-500">
                {Object.keys(item.graph.nodes).length} nodes
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}