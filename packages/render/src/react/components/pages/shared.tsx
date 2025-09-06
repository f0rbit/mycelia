import type { MyceliaNode } from '@mycelia/core'

export interface NodePageProps {
  node: MyceliaNode
  graph?: any
  renderTree?: any
  children?: any[]
  childNodes?: MyceliaNode[]
  relatedNodes?: MyceliaNode[]
}

export interface PageHeaderProps {
  title?: string
  type?: string
  date?: string
  children?: React.ReactNode
}

import * as React from 'react'

export function PageHeader({ title, type, date, children }: PageHeaderProps) {
  return (
    <header className="space-y-4 pb-6 border-b mb-6">
      <div>
        {title && (
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        )}
        {type && (
          <p className="text-lg text-muted-foreground mt-2 capitalize">{type}</p>
        )}
        {date && (
          <p className="text-sm text-muted-foreground mt-1">{date}</p>
        )}
      </div>
      {children}
    </header>
  )
}