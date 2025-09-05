import Link from 'next/link'
import { getNodeTypes } from '@/lib/content'

export default async function Home() {
  const nodeTypes = await getNodeTypes()
  const totalNodes = nodeTypes.reduce((sum, { count }) => sum + count, 0)

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="space-y-4 pb-6 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mycelia Knowledge Graph</h1>
          <p className="text-sm text-muted-foreground mt-1">knowledge-base</p>
        </div>
        
        <p className="text-lg text-muted-foreground">
          A dynamic knowledge base with <strong>{totalNodes} interconnected nodes</strong> across {nodeTypes.length} content types. 
          Every concept, project, and idea becomes a discoverable page with contextual links.
        </p>
      </div>

      <main className="mt-8 space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">Browse by Content Type</h2>
          <p className="text-muted-foreground mb-6">Explore the knowledge graph through different semantic lenses:</p>
          
          <div className="grid gap-4 md:grid-cols-2">
            {nodeTypes.slice(0, 6).map(({ type, count }) => (
              <div key={type} className="border-l-4 border-blue-200 pl-4 py-2">
                <h3 className="text-lg font-medium mb-1">
                  <Link href={`/types/${type}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                    {type.charAt(0).toUpperCase() + type.slice(1)}s
                  </Link>
                  <span className="ml-2 text-sm text-muted-foreground font-normal">({count})</span>
                </h3>
                <p className="text-sm text-muted-foreground">
                  {type === 'project' && 'Software projects, applications, and development initiatives'}
                  {type === 'skill' && 'Technical skills, programming languages, and competencies'}
                  {type === 'essay' && 'Written articles, blog posts, and long-form content'}
                  {type === 'task' && 'Action items, todos, and development milestones'}
                  {type === 'research' && 'Research findings, studies, and investigations'}
                  {type === 'note' && 'Quick thoughts, observations, and insights'}
                  {!['project', 'skill', 'essay', 'task', 'research', 'note'].includes(type) && `${count} ${type} nodes in the graph`}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Core Examples</h2>
          <p className="text-muted-foreground mb-6">
            Main content collections that showcase the system's capabilities:
          </p>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
              <div className="flex-1">
                <Link href="/developer-journey" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
                  Developer Journey
                </Link>
                <p className="text-sm text-muted-foreground mt-1">Programming evolution from Scratch to professional development</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
              <div className="flex-1">
                <Link href="/portfolio-showcase" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
                  Portfolio Showcase
                </Link>
                <p className="text-sm text-muted-foreground mt-1">Software projects like Chamber, Burning Blends, Arena</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
              <div className="flex-1">
                <Link href="/blog-content" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
                  Blog Content
                </Link>
                <p className="text-sm text-muted-foreground mt-1">Technical articles and development insights</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
              <div className="flex-1">
                <Link href="/learning-resources" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
                  Learning Resources
                </Link>
                <p className="text-sm text-muted-foreground mt-1">Books, skills, and methodology documentation</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Popular Entry Points</h2>
          <p className="text-muted-foreground mb-6">
            Start exploring from these interconnected nodes:
          </p>
          
          <div className="grid gap-3 md:grid-cols-3">
            <div className="p-3 rounded-lg border hover:bg-accent/50 transition-colors">
              <Link href="/tom-materne" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">Tom Materne</Link>
              <p className="text-sm text-muted-foreground mt-1">Person • Software engineer profile</p>
            </div>
            <div className="p-3 rounded-lg border hover:bg-accent/50 transition-colors">
              <Link href="/developer-blog" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">Developer Blog</Link>
              <p className="text-sm text-muted-foreground mt-1">Project • Technical documentation</p>
            </div>
            <div className="p-3 rounded-lg border hover:bg-accent/50 transition-colors">
              <Link href="/accessibility-testing" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">Accessibility Testing</Link>
              <p className="text-sm text-muted-foreground mt-1">Research • Web accessibility</p>
            </div>
          </div>
        </section>

        <div className="border-l-4 border-blue-200 pl-4 py-2">
          <p className="text-sm text-muted-foreground">
            <strong>How it works:</strong> This demo transforms markdown files with semantic tags into an interconnected knowledge base. 
            Each <code>&lt;Project&gt;</code>, <code>&lt;Skill&gt;</code>, or <code>&lt;Essay&gt;</code> tag becomes a dedicated page 
            with contextual links to related content.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">🚀 Enhanced Renderer</h3>
            <p className="text-sm text-green-700 mb-3">
              Professional styled content rendering with clean hierarchy.
            </p>
            <Link 
              href="/render-test" 
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-700 bg-green-100 border border-green-300 rounded-md hover:bg-green-200 transition-colors"
            >
              View Render Test
            </Link>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">🔗 Interactive Graph</h3>
            <p className="text-sm text-blue-700 mb-3">
              Explore content relationships with interactive graph visualization.
            </p>
            <Link 
              href="/graph" 
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200 transition-colors"
            >
              View Knowledge Graph
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}