import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import myceliaConfig from '../../mycelia.json'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  nodeType?: string
  nodeName?: string
  nodeId?: string
}

export function Breadcrumbs({ nodeType, nodeName, nodeId }: BreadcrumbsProps) {
  const items: BreadcrumbItem[] = [
    { label: 'Home', href: '/' }
  ]

  // Add type page if available
  if (nodeType) {
    const typeConfig = myceliaConfig.routes.types.find(t => t.type === nodeType)
    if (typeConfig) {
      items.push({
        label: typeConfig.title,
        href: `/type${typeConfig.path}`
      })
    } else {
      // Fallback for types not in config
      const typeLabel = nodeType.charAt(0).toUpperCase() + nodeType.slice(1) + 's'
      items.push({
        label: typeLabel,
        href: `/type/${nodeType}s`
      })
    }
  }

  // Add current node
  if (nodeName) {
    items.push({
      label: nodeName,
      href: nodeId ? `/node/${nodeId}` : undefined
    })
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="mx-2 h-4 w-4" />
            )}
            {item.href && index < items.length - 1 ? (
              <Link
                href={item.href}
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={index === items.length - 1 ? "text-foreground font-medium" : ""}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}