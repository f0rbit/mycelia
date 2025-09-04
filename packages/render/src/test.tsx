/**
 * Simple test file to verify the render package works
 * This is not a proper unit test, just a compilation check
 */
import type { RenderableTree } from '@mycelia/core';
import { react } from './index';

// Test data matching our parser output structure
const testRenderableTree: RenderableTree = {
  root: {
    id: 'root',
    type: 'root',
    primitive: 'Trunk',
    props: { title: 'Test Document' },
    children: [
      {
        id: 'project-1',
        type: 'project',
        primitive: 'Branch',
        props: { title: 'My Project', status: 'active' },
        content: 'This is a test project with some content.',
        children: [
          {
            id: 'task-1',
            type: 'task',
            primitive: 'Leaf',
            props: { title: 'Complete task', priority: 'high' },
            content: 'Task description here',
            children: [],
            resolvedRefs: []
          },
          {
            id: 'person-1',
            type: 'person',
            primitive: 'Leaf',
            props: { name: 'Alice Johnson' },
            content: 'Alice is the project lead',
            children: [],
            resolvedRefs: []
          }
        ],
        resolvedRefs: [
          {
            id: 'person-1',
            type: 'person',
            primitive: 'Leaf',
            title: 'Alice Johnson',
            exists: true
          }
        ]
      }
    ],
    content: 'Root content',
    resolvedRefs: []
  },
  meta: {
    totalNodes: 4,
    unresolvedRefs: [],
    warnings: []
  }
};

// Test that we can create the components
export function TestRenderer() {
  return (
    <react.RenderProvider>
      <react.RenderableTreeRenderer tree={testRenderableTree} />
    </react.RenderProvider>
  );
}

// Test individual components
export function TestIndividualComponents() {
  const project = testRenderableTree.root.children[0];
  const task = project?.children[0];
  
  if (!project || !task) return null;

  return (
    <react.RenderProvider>
      <react.LeafRenderer node={task} />
      <react.BranchRenderer node={project} />
    </react.RenderProvider>
  );
}

// Test that the exports work
console.log('Render package exports:', {
  react: typeof react,
  RenderableTreeRenderer: typeof react.RenderableTreeRenderer,
  Components: typeof react.Components,
  defaultTheme: typeof react.defaultTheme,
});