import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Mycelia Demo</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A markdown-based engine for creating deeply-linked project websites. 
          Explore how content gets parsed into rich, interconnected knowledge graphs.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Developer Journey</CardTitle>
            <CardDescription>
              A complete programming journey from Scratch to professional development
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/developer-journey">
              <Button variant="outline" className="w-full">
                Explore Journey
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Portfolio</CardTitle>
            <CardDescription>
              Projects like Chamber, Burning Blends, Arena, and GM-Server
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/project-portfolio">
              <Button variant="outline" className="w-full">
                View Projects
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Blog Content</CardTitle>
            <CardDescription>
              Technical blog posts and writing on development topics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/blog-content">
              <Button variant="outline" className="w-full">
                Read Blog
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Learning Resources</CardTitle>
            <CardDescription>
              Skills, books, and learning methodology documentation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/learning-resources">
              <Button variant="outline" className="w-full">
                Browse Resources
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}