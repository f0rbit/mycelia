import Link from 'next/link'

export function Navigation() {
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-6 flex h-16 items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="text-xl font-bold text-gray-900">
            Mycelia
          </Link>
          
          <div className="hidden md:flex items-center space-x-6 text-sm">
            <Link href="/types" className="text-gray-600 hover:text-gray-900 hover:underline">
              Browse Types
            </Link>
            <Link href="/types/project" className="text-gray-600 hover:text-gray-900 hover:underline">
              Projects
            </Link>
            <Link href="/types/essay" className="text-gray-600 hover:text-gray-900 hover:underline">
              Essays
            </Link>
            <Link href="/types/skill" className="text-gray-600 hover:text-gray-900 hover:underline">
              Skills
            </Link>
          </div>
        </div>

        <div className="text-xs text-gray-500 font-mono">
          317 nodes • 11 types
        </div>
      </div>
    </nav>
  )
}