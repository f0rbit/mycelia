'use client'

import Link from 'next/link'
import { Folder, GitBranch, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProjectLinkProps {
  href: string
  children: React.ReactNode
  type?: 'project' | 'repo' | 'demo'
  status?: 'active' | 'archived' | 'in-progress'
  className?: string
}

export function ProjectLink({ 
  href, 
  children, 
  type = 'project',
  status = 'active',
  className 
}: ProjectLinkProps) {
  const isExternal = href.startsWith('http')
  
  const baseClasses = cn(
    'inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-all hover:shadow-md',
    {
      'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100': 
        type === 'project',
      'bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100': 
        type === 'repo',
      'bg-green-50 border-green-200 text-green-800 hover:bg-green-100': 
        type === 'demo'
    },
    {
      'opacity-60': status === 'archived',
      'border-dashed': status === 'in-progress'
    },
    className
  )

  const icon = type === 'project' ? <Folder className="w-4 h-4" /> :
               type === 'repo' ? <GitBranch className="w-4 h-4" /> :
               <Globe className="w-4 h-4" />

  const statusIndicator = status !== 'active' && (
    <span className={cn(
      'text-xs px-2 py-0.5 rounded-full',
      {
        'bg-yellow-200 text-yellow-800': status === 'in-progress',
        'bg-gray-200 text-gray-600': status === 'archived'
      }
    )}>
      {status}
    </span>
  )

  if (isExternal) {
    return (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className={baseClasses}
      >
        {icon}
        <span className="flex-1">{children}</span>
        {statusIndicator}
      </a>
    )
  }

  return (
    <Link href={href} className={baseClasses}>
      {icon}
      <span className="flex-1">{children}</span>
      {statusIndicator}
    </Link>
  )
}