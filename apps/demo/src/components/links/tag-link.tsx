'use client'

import Link from 'next/link'
import { Tag } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TagLinkProps {
  href: string
  children: React.ReactNode
  category?: 'skill' | 'technology' | 'concept' | 'tool' | 'framework'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function TagLink({ 
  href, 
  children, 
  category = 'concept',
  size = 'sm',
  className 
}: TagLinkProps) {
  const isExternal = href.startsWith('http')
  
  const baseClasses = cn(
    'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition-colors hover:shadow-sm',
    {
      'bg-purple-100 text-purple-800 hover:bg-purple-200': category === 'skill',
      'bg-blue-100 text-blue-800 hover:bg-blue-200': category === 'technology', 
      'bg-green-100 text-green-800 hover:bg-green-200': category === 'concept',
      'bg-orange-100 text-orange-800 hover:bg-orange-200': category === 'tool',
      'bg-red-100 text-red-800 hover:bg-red-200': category === 'framework'
    },
    {
      'text-xs px-2 py-0.5': size === 'sm',
      'text-sm px-3 py-1': size === 'md', 
      'text-base px-4 py-2': size === 'lg'
    },
    className
  )

  if (isExternal) {
    return (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className={baseClasses}
      >
        <Tag className="w-3 h-3" />
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={baseClasses}>
      <Tag className="w-3 h-3" />
      {children}
    </Link>
  )
}