import Link from 'next/link'

export function Navigation() {
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-6 flex h-16 items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="text-xl font-bold text-gray-900">
            Mycelia Demo
          </Link>
          
          <div className="hidden md:flex items-center space-x-6 text-sm">
            <Link href="/blog" className="text-gray-600 hover:text-gray-900 hover:underline">
              Blog
            </Link>
            <Link href="/projects" className="text-gray-600 hover:text-gray-900 hover:underline">
              Projects
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900 hover:underline">
              About
            </Link>
            <Link href="/graph" className="text-gray-600 hover:text-gray-900 hover:underline">
              Graph
            </Link>
          </div>
        </div>

        <div className="text-xs text-gray-500 font-mono">
          Powered by @mycelia/ssr
        </div>
      </div>
    </nav>
  )
}