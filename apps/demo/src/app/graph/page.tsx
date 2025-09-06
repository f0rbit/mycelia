import { MyceliaGraphViewer } from '@mycelia/graph'
import Link from 'next/link'

export default function GraphPage() {
  return (
    <div>
      <MyceliaGraphViewer />
      
      <footer className="max-w-7xl mx-auto mt-8 pt-4 border-t text-sm text-muted-foreground px-6">
        <div className="flex gap-4">
          <Link href="/render-test" className="text-blue-600 hover:underline">
            View Content Rendering
          </Link>
          <Link href="/" className="text-blue-600 hover:underline">
            Back to Home
          </Link>
        </div>
      </footer>
    </div>
  )
}