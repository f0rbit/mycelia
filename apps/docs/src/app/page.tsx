import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-4">Mycelia Documentation</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Learn how to build deeply-linked digital gardens with Mycelia
        </p>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/docs" className="block p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">📚 Documentation</h2>
            <p className="text-muted-foreground">
              Complete guide to using Mycelia
            </p>
          </Link>
          
          <Link href="/docs/quick-start" className="block p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">🚀 Quick Start</h2>
            <p className="text-muted-foreground">
              Get up and running in 5 minutes
            </p>
          </Link>
          
          <a href="https://github.com/yourrepo/mycelia" className="block p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">💻 GitHub</h2>
            <p className="text-muted-foreground">
              View source code and contribute
            </p>
          </a>
        </div>
        
        <div className="mt-12 p-6 bg-secondary/20 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">What is Mycelia?</h2>
          <p className="text-muted-foreground mb-4">
            Mycelia is a markdown-based engine for creating deeply-linked project websites, 
            also known as digital gardens. It transforms your content with custom semantic 
            tags into a fully interconnected knowledge graph.
          </p>
          <div className="flex gap-4">
            <Link href="/docs" className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90">
              Read the docs →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}