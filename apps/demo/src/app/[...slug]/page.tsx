import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { glob } from 'glob'
import { notFound } from 'next/navigation'
import { compileMDX } from 'next-mdx-remote/rsc'
import Link from 'next/link'

export async function generateStaticParams() {
  const contentPath = join(process.cwd(), 'content/**/*.mdx')
  const files = glob.sync(contentPath)
  
  const slugs = files
    .map(file => {
      const relativePath = file.replace(join(process.cwd(), 'content/'), '')
      const slug = relativePath.replace(/\.mdx?$/, '').split('/')
      if (slug[slug.length - 1] === 'index') {
        slug.pop()
      }
      return { slug: slug.length > 0 ? slug : [''] }
    })
    .filter(({ slug }) => slug.length > 0 && slug[0] !== '')
  
  // Add a fallback empty slug to prevent export errors
  if (slugs.length === 0) {
    return [{ slug: ['fallback'] }]
  }
  
  return slugs
}

export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug: slugArray } = await params
  const slug = slugArray.join('/')
  const contentPath = join(process.cwd(), 'content')
  
  let filePath = join(contentPath, `${slug}.mdx`)
  if (!existsSync(filePath)) {
    filePath = join(contentPath, slug, 'index.mdx')
  }
  
  if (!existsSync(filePath)) {
    notFound()
  }

  const content = readFileSync(filePath, 'utf-8')
  
  const { content: mdxContent } = await compileMDX({
    source: content,
    options: { parseFrontmatter: true },
    components: {
      Link: ({ target, url, children }: any) => {
        // If URL is provided, use it directly
        if (url) {
          return (
            <a href={url} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          )
        }
        // If target is provided, link to the main page (nodes are inline)
        // For this simple demo, all content is on the main pages
        const href = target ? `/#${target}` : '/'
        return (
          <Link href={href} className="text-blue-600 hover:underline">
            {children}
          </Link>
        )
      },
      Project: ({ id, title, status, children }: any) => (
        <div id={id} className="bg-blue-50 border border-blue-200 rounded-lg p-6 my-6 scroll-mt-20">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-xl font-bold text-blue-900">{title || id}</h3>
            {status && (
              <span className="text-xs px-2 py-1 rounded-full bg-blue-200 text-blue-800">
                {status}
              </span>
            )}
          </div>
          <div className="prose prose-sm">{children}</div>
        </div>
      ),
      Task: ({ id, priority, status, children }: any) => (
        <div className="bg-white border border-gray-200 rounded-md p-4 my-3">
          <div className="flex items-center gap-2 mb-2">
            <input type="checkbox" checked={status === 'completed'} readOnly className="mr-2" />
            <span className="font-medium text-gray-900">{children}</span>
            {priority && (
              <span className={`text-xs px-2 py-0.5 rounded-full ml-auto ${
                priority === 'high' ? 'bg-red-100 text-red-800' :
                priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {priority}
              </span>
            )}
          </div>
        </div>
      ),
      Essay: ({ id, title, children }: any) => (
        <article className="prose prose-lg max-w-none">
          {title && <h1>{title}</h1>}
          {children}
        </article>
      ),
      Person: ({ id, name, role, children }: any) => (
        <div id={id} className="bg-purple-50 border border-purple-200 rounded-lg p-6 my-6 scroll-mt-20">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-purple-900">{name || id}</h3>
            {role && <p className="text-purple-700 text-sm">{role}</p>}
          </div>
          <div className="prose prose-sm">{children}</div>
        </div>
      ),
      Skill: ({ id, proficiency, children }: any) => (
        <div className="inline-flex items-center gap-2 bg-white border border-purple-200 rounded-md px-3 py-2 mr-2 mb-2">
          <span className="font-medium text-gray-900">{children}</span>
          {proficiency && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
              {proficiency}
            </span>
          )}
        </div>
      ),
    },
  })

  return (
    <div className="prose prose-lg max-w-none">
      {mdxContent}
    </div>
  )
}
