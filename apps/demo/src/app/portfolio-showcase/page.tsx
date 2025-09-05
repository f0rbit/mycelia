import { notFound } from 'next/navigation'
import { loadNode } from '@/lib/content'
import { PortfolioPage } from '@/components/pages/portfolio-page'

export default async function PortfolioShowcasePage() {
  const nodeData = await loadNode('portfolio-showcase')
  
  if (!nodeData || !nodeData.node) {
    notFound()
  }

  return <PortfolioPage {...nodeData} />
}