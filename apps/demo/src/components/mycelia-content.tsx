'use client'

import { react } from '@mycelia/render'
import type { RenderableTree } from '@mycelia/core'

const { RenderableTreeRenderer, RenderProvider } = react

interface MyceliaContentProps {
  tree: RenderableTree
}

export function MyceliaContent({ tree }: MyceliaContentProps) {
  return (
    <RenderProvider>
      <RenderableTreeRenderer tree={tree} />
    </RenderProvider>
  )
}