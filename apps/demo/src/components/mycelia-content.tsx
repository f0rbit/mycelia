'use client'

import { react } from '@mycelia/render'
import type { RenderableTree } from '@mycelia/core'
import { ReferenceLink, ProjectLink, TagLink } from './links'

const { RenderableTreeRenderer, RenderProvider } = react

interface MyceliaContentProps {
  tree: RenderableTree
}

// Custom component registry that maps specific link types to our enhanced components
const customRegistry = {
  // Override default link rendering with our enhanced components
  'reference-link': (props: any) => <ReferenceLink {...props} />,
  'project-link': (props: any) => <ProjectLink {...props} />,
  'tag-link': (props: any) => <TagLink {...props} />,
}

export function MyceliaContent({ tree }: MyceliaContentProps) {
  return (
    <RenderProvider registry={customRegistry}>
      <RenderableTreeRenderer tree={tree} />
    </RenderProvider>
  )
}