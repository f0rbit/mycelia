import Link from 'next/link'
import { Button } from './ui/button'

export function Navigation() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              Mycelia Demo
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/developer-journey">
              <Button variant="ghost" size="sm">
                Journey
              </Button>
            </Link>
            <Link href="/project-portfolio">
              <Button variant="ghost" size="sm">
                Projects
              </Button>
            </Link>
            <Link href="/blog-content">
              <Button variant="ghost" size="sm">
                Blog
              </Button>
            </Link>
            <Link href="/learning-resources">
              <Button variant="ghost" size="sm">
                Learning
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </nav>
  )
}