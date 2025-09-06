import { notFound } from 'next/navigation'
import { loadNode } from '@/lib/content'
// Temporary: not using @mycelia/render until components are fixed

export default async function PortfolioShowcasePage() {
  const nodeData = await loadNode('portfolio-showcase')
  
  if (!nodeData || !nodeData.node) {
    notFound()
  }

  // Temporary simplified rendering
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <h1 className="text-3xl font-bold mb-4">Portfolio Showcase</h1>
      <p>Temporary placeholder until components are fixed.</p>
    </div>
  )
}