'use client'

import Link from 'next/link'
import { ArrowRight, ExternalLink, Hash } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReferenceLinkProps {
  href: string
  children: React.ReactNode
  type?: 'internal' | 'external' | 'anchor'
  variant?: 'default' | 'subtle' | 'prominent'
  showIcon?: boolean
  className?: string
}

export function ReferenceLink({ 
  href, 
  children, 
  type = 'internal',
  variant = 'default',
  showIcon = true,
  className 
}: ReferenceLinkProps) {
  const isExternal = type === 'external' || href.startsWith('http')
  const isAnchor = type === 'anchor' || href.startsWith('#')
  
  const baseClasses = cn(
    'inline-flex items-center gap-1 transition-colors',
    {
      'text-blue-600 hover:text-blue-800 underline decoration-1 underline-offset-2': 
        variant === 'default',
      'text-muted-foreground hover:text-foreground': 
        variant === 'subtle', 
      'text-primary font-medium hover:text-primary/80 bg-primary/5 hover:bg-primary/10 px-2 py-1 rounded-md': 
        variant === 'prominent'
    },
    className
  )

  const icon = showIcon ? (
    isExternal ? <ExternalLink className="w-3 h-3" /> :
    isAnchor ? <Hash className="w-3 h-3" /> :
    <ArrowRight className="w-3 h-3" />
  ) : null

  if (isExternal) {
    return (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className={baseClasses}
      >
        {children}
        {icon}
      </a>
    )
  }

  return (
    <Link href={href} className={baseClasses}>
      {children}
      {icon}
    </Link>
  )
}