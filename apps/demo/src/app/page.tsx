import { markdown } from '@mycelia/parser'
import { join } from 'path'
import Link from 'next/link'

export default async function Home() {
  const contentPath = join(process.cwd(), 'content/**/*.mdx')
  const { graph } = await markdown.parse(contentPath)

  const stats = {
    nodes: Object.keys(graph.nodes).length,
    edges: graph.edges.length,
    types: Object.keys(graph.indexes.byType).length,
    files: graph.meta.files
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">
          Welcome to Mycelia Demo
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed">
          A simple example showing how Mycelia turns markdown into knowledge graphs.
          Write content with semantic tags, and Mycelia automatically creates an
          interconnected network of nodes, edges, and relationships.
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-4xl font-bold text-blue-600 mb-1">{stats.nodes}</div>
          <div className="text-gray-600 text-sm">Nodes</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-4xl font-bold text-green-600 mb-1">{stats.edges}</div>
          <div className="text-gray-600 text-sm">Edges</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-4xl font-bold text-purple-600 mb-1">{stats.types}</div>
          <div className="text-gray-600 text-sm">Types</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-4xl font-bold text-orange-600 mb-1">{stats.files}</div>
          <div className="text-gray-600 text-sm">Files</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-gray-900">🚀 Quick Start</h2>
          <ul className="space-y-3">
            <li>
              <Link href="/getting-started" className="text-blue-600 hover:underline font-medium">
                Getting Started Guide
              </Link>
              <p className="text-sm text-gray-600 mt-1">
                Learn the basics of Mycelia in 5 minutes
              </p>
            </li>
            <li>
              <Link href="/examples" className="text-blue-600 hover:underline font-medium">
                Practical Examples
              </Link>
              <p className="text-sm text-gray-600 mt-1">
                Real-world use cases and patterns
              </p>
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-gray-900">📚 Learn More</h2>
          <ul className="space-y-3">
            <li>
              <Link href="/advanced-features" className="text-blue-600 hover:underline font-medium">
                Advanced Features
              </Link>
              <p className="text-sm text-gray-600 mt-1">
                Custom types, queries, and renderers
              </p>
            </li>
            <li>
              <Link href="/about" className="text-blue-600 hover:underline font-medium">
                About This Demo
              </Link>
              <p className="text-sm text-gray-600 mt-1">
                What makes Mycelia special
              </p>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
        <h2 className="text-lg font-bold mb-2 text-blue-900">
          💡 What is Mycelia?
        </h2>
        <p className="text-blue-800 mb-4">
          Mycelia transforms your markdown content into an interconnected knowledge graph.
          Instead of isolated documents, your content becomes a living network of ideas,
          projects, people, and tasks - all automatically linked and explorable.
        </p>
        <div className="flex gap-4">
          <Link 
            href="/getting-started" 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
          >
            Get Started →
          </Link>
          <a 
            href="https://github.com/mycelia" 
            className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-gray-50 font-medium border border-blue-600"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  )
}
