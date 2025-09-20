import Link from 'next/link'
import myceliaConfig from '../../mycelia.json'

export function Navigation() {
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-6 flex h-16 items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="text-xl font-bold text-gray-900">
            Mycelia Demo
          </Link>
          
          <div className="hidden md:flex items-center space-x-6 text-sm">
            {myceliaConfig.routes.types.map(route => (
              <Link 
                key={route.path} 
                href={`/type${route.path}`} 
                className="text-gray-600 hover:text-gray-900 hover:underline"
              >
                {route.title}
              </Link>
            ))}
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
