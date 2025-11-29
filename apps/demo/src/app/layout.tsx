import './globals.css'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Mycelia Demo',
  description: 'Simple demo of Mycelia knowledge graph system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <nav className="bg-white border-b px-6 py-4 shadow-sm">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-gray-900 hover:text-blue-600">
              Mycelia Demo
            </Link>
            <div className="flex gap-6 text-sm">
              <Link href="/getting-started" className="text-gray-600 hover:text-blue-600">
                Getting Started
              </Link>
              <Link href="/examples" className="text-gray-600 hover:text-blue-600">
                Examples
              </Link>
              <Link href="/advanced-features" className="text-gray-600 hover:text-blue-600">
                Advanced
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-blue-600">
                About
              </Link>
            </div>
          </div>
        </nav>
        <main className="max-w-4xl mx-auto px-6 py-8">
          {children}
        </main>
        <footer className="border-t mt-16 py-8 px-6 bg-white">
          <div className="max-w-4xl mx-auto text-center text-gray-600 text-sm">
            <p>Built with Mycelia - Turn your markdown into a knowledge graph</p>
            <p className="mt-2">
              <a href="https://github.com/mycelia" className="text-blue-600 hover:underline">
                GitHub
              </a>
              {' · '}
              <a href="/getting-started" className="text-blue-600 hover:underline">
                Documentation
              </a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
