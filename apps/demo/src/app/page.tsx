import { nextjs } from '@mycelia/ssr';

const { MyceliaPage, getMyceliaContent } = nextjs;

export default async function HomePage() {
  // Get index content specifically
  const content = await getMyceliaContent([]);
  
  if (content) {
    return <MyceliaPage params={Promise.resolve({ slug: [] })} content={content} />;
  }

  // Fallback if no index.mdx exists
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <header className="space-y-4 pb-6 border-b mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome to Mycelia
        </h1>
        <p className="text-lg text-muted-foreground">
          Your content-driven knowledge base is ready. Add MDX files to the <code>content/</code> folder to get started.
        </p>
      </header>

      <div className="prose prose-lg max-w-none">
        <h2>Getting Started</h2>
        <p>
          Create an <code>index.mdx</code> file in your content directory to customize this home page.
          All other MDX files will automatically become pages based on their folder structure.
        </p>
        
        <h2>Features</h2>
        <ul>
          <li><strong>Zero Configuration</strong>: Just add MDX files to see them rendered</li>
          <li><strong>Automatic Routing</strong>: File paths become URL paths</li>
          <li><strong>Semantic Markup</strong>: Use Mycelia tags for rich content relationships</li>
          <li><strong>Clean Rendering</strong>: Professional typography without visual clutter</li>
        </ul>

        <h2>Example Structure</h2>
        <pre>
{`content/
├── index.mdx           → /
├── about.mdx           → /about  
├── blog/
│   ├── post-1.mdx      → /blog/post-1
│   └── post-2.mdx      → /blog/post-2
└── projects/
    └── my-project.mdx  → /projects/my-project`}
        </pre>
      </div>
    </div>
  );
}