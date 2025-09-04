import Link from 'next/link'
import { getNodeTypes } from '@/lib/content'

export default async function Home() {
  const nodeTypes = await getNodeTypes()
  const totalNodes = nodeTypes.reduce((sum, { count }) => sum + count, 0)

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <header className="mb-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Mycelia Knowledge Graph</h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
          A dynamic knowledge base with <strong>{totalNodes} interconnected nodes</strong> across {nodeTypes.length} content types. 
          Every concept, project, and idea becomes a discoverable page with contextual links.
        </p>
      </header>

      <main className="prose prose-lg max-w-none">
        <section className="mb-12">
          <h2>Browse by Content Type</h2>
          <p>Explore the knowledge graph through different semantic lenses:</p>
          
          <div className="grid gap-6 md:grid-cols-2 not-prose">
            {nodeTypes.slice(0, 6).map(({ type, count }) => (
              <div key={type} className="border-l-4 border-blue-200 pl-4">
                <h3 className="text-lg font-semibold mb-2">
                  <Link href={`/types/${type}`} className="text-blue-700 hover:text-blue-900 no-underline hover:underline">
                    {type.charAt(0).toUpperCase() + type.slice(1)}s
                  </Link>
                  <span className="ml-2 text-sm text-gray-500 font-normal">({count})</span>
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
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

        <section className="mb-12">
          <h2>How It Works</h2>
          <p>
            This demo transforms markdown files with semantic tags into an interconnected knowledge base. 
            Each <code>&lt;Project&gt;</code>, <code>&lt;Skill&gt;</code>, or <code>&lt;Essay&gt;</code> tag becomes a dedicated page 
            with contextual links to related content.
          </p>
          
          <div className="border-l-4 border-gray-200 pl-4 text-sm text-gray-700 not-prose">
            <p className="mb-2"><strong>Original Examples:</strong></p>
            <ul className="space-y-1">
              <li><Link href="/developer-journey" className="text-blue-600 hover:underline">Developer Journey</Link> - Programming evolution from Scratch to professional development</li>
              <li><Link href="/project-portfolio" className="text-blue-600 hover:underline">Project Portfolio</Link> - Software projects like Chamber, Burning Blends, Arena</li>
              <li><Link href="/blog-content" className="text-blue-600 hover:underline">Blog Content</Link> - Technical articles and development insights</li>
              <li><Link href="/learning-resources" className="text-blue-600 hover:underline">Learning Resources</Link> - Books, skills, and methodology documentation</li>
            </ul>
          </div>
        </section>

        <section>
          <h2>Explore the Graph</h2>
          <p>
            Start anywhere and follow the links. Each page shows its content plus references to where it's mentioned elsewhere. 
            Try these entry points:
          </p>
          
          <div className="grid gap-4 md:grid-cols-3 not-prose text-sm">
            <div>
              <Link href="/tom-materne" className="text-blue-600 hover:underline font-medium">Tom Materne</Link>
              <p className="text-gray-600">Person • Software engineer profile and journey</p>
            </div>
            <div>
              <Link href="/developer-blog" className="text-blue-600 hover:underline font-medium">Developer Blog</Link>
              <p className="text-gray-600">Project • Technical blog and documentation</p>
            </div>
            <div>
              <Link href="/accessibility-testing" className="text-blue-600 hover:underline font-medium">Accessibility Testing</Link>
              <p className="text-gray-600">Research • Web accessibility methodology</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}