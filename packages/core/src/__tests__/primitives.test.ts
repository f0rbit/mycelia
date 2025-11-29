import { describe, it, expect } from 'bun:test'
import {
  isContentNode,
  isReferenceNode,
  isMetaNode,
  createContentNode,
  createReferenceNode,
  createMetaNode,
} from '../utils.js'
import type { ContentNode, ReferenceNode, MetaNode, MyceliaNode } from '../primitives.js'

describe('type guards', () => {
  const contentNode: ContentNode = {
    id: 'test-1',
    type: 'project',
    primitive: 'Content',
    children: [],
    attributes: {},
    source: { file: 'test.mdx' },
  }

  const referenceNode: ReferenceNode = {
    id: 'ref-1',
    type: 'link',
    primitive: 'Reference',
    target: 'test-1',
    link_type: 'citation',
    attributes: {},
    source: { file: 'test.mdx' },
  }

  const metaNode: MetaNode = {
    id: 'meta-1',
    type: 'tag',
    primitive: 'Meta',
    meta_type: 'tag',
    value: 'typescript',
    attributes: {},
    source: { file: 'test.mdx' },
  }

  describe('isContentNode', () => {
    it('should identify content nodes correctly', () => {
      expect(isContentNode(contentNode)).toBe(true)
    })

    it('should reject reference nodes', () => {
      expect(isContentNode(referenceNode)).toBe(false)
    })

    it('should reject meta nodes', () => {
      expect(isContentNode(metaNode)).toBe(false)
    })

    it('should narrow TypeScript type', () => {
      const node: MyceliaNode = contentNode
      if (isContentNode(node)) {
        // This should compile without error
        expect(node.children).toEqual([])
        expect(node.attributes).toEqual({})
      }
    })
  })

  describe('isReferenceNode', () => {
    it('should identify reference nodes correctly', () => {
      expect(isReferenceNode(referenceNode)).toBe(true)
    })

    it('should reject content nodes', () => {
      expect(isReferenceNode(contentNode)).toBe(false)
    })

    it('should reject meta nodes', () => {
      expect(isReferenceNode(metaNode)).toBe(false)
    })

    it('should narrow TypeScript type', () => {
      const node: MyceliaNode = referenceNode
      if (isReferenceNode(node)) {
        expect(node.target).toBe('test-1')
        expect(node.link_type).toBe('citation')
      }
    })
  })

  describe('isMetaNode', () => {
    it('should identify meta nodes correctly', () => {
      expect(isMetaNode(metaNode)).toBe(true)
    })

    it('should reject content nodes', () => {
      expect(isMetaNode(contentNode)).toBe(false)
    })

    it('should reject reference nodes', () => {
      expect(isMetaNode(referenceNode)).toBe(false)
    })

    it('should narrow TypeScript type', () => {
      const node: MyceliaNode = metaNode
      if (isMetaNode(node)) {
        expect(node.meta_type).toBe('tag')
        expect(node.value).toBe('typescript')
      }
    })
  })
})

describe('node creation', () => {
  const source = { file: 'test.mdx', start: { line: 1, column: 1 } }

  describe('createContentNode', () => {
    it('should create content node with minimal params', () => {
      const node = createContentNode({
        id: 'test-1',
        type: 'project',
        source,
      })

      expect(node.id).toBe('test-1')
      expect(node.type).toBe('project')
      expect(node.primitive).toBe('Content')
      expect(node.children).toEqual([])
      expect(node.attributes).toEqual({})
      expect(node.source).toEqual(source)
    })

    it('should create content node with all params', () => {
      const node = createContentNode({
        id: 'test-2',
        type: 'essay',
        source,
        title: 'My Essay',
        content: 'Essay content here',
        value: 'atomic value',
        children: ['child-1', 'child-2'],
        attributes: { status: 'published' },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      })

      expect(node.title).toBe('My Essay')
      expect(node.content).toBe('Essay content here')
      expect(node.value).toBe('atomic value')
      expect(node.children).toEqual(['child-1', 'child-2'])
      expect(node.attributes).toEqual({ status: 'published' })
      expect(node.created_at).toBe('2024-01-01T00:00:00Z')
      expect(node.updated_at).toBe('2024-01-02T00:00:00Z')
    })

    it('should apply defaults when not provided', () => {
      const node = createContentNode({
        id: 'test-3',
        type: 'task',
        source,
      })

      expect(node.children).toBeDefined()
      expect(node.children).toEqual([])
      expect(node.attributes).toBeDefined()
      expect(node.attributes).toEqual({})
    })
  })

  describe('createReferenceNode', () => {
    it('should create reference node with minimal params', () => {
      const node = createReferenceNode({
        id: 'ref-1',
        type: 'link',
        source,
        target: 'target-id',
        link_type: 'citation',
      })

      expect(node.id).toBe('ref-1')
      expect(node.type).toBe('link')
      expect(node.primitive).toBe('Reference')
      expect(node.target).toBe('target-id')
      expect(node.link_type).toBe('citation')
      expect(node.attributes).toEqual({})
      expect(node.source).toEqual(source)
    })

    it('should create reference node with all params', () => {
      const node = createReferenceNode({
        id: 'ref-2',
        type: 'reference',
        source,
        target: 'book-id',
        link_type: 'bibliography',
        attributes: { page: 42 },
        created_at: '2024-01-01T00:00:00Z',
      })

      expect(node.attributes).toEqual({ page: 42 })
      expect(node.created_at).toBe('2024-01-01T00:00:00Z')
    })
  })

  describe('createMetaNode', () => {
    it('should create meta node with minimal params', () => {
      const node = createMetaNode({
        id: 'meta-1',
        type: 'tag',
        source,
        meta_type: 'tag',
        value: 'typescript',
      })

      expect(node.id).toBe('meta-1')
      expect(node.type).toBe('tag')
      expect(node.primitive).toBe('Meta')
      expect(node.meta_type).toBe('tag')
      expect(node.value).toBe('typescript')
      expect(node.attributes).toEqual({})
      expect(node.target).toBeUndefined()
    })

    it('should create meta node with all params', () => {
      const node = createMetaNode({
        id: 'meta-2',
        type: 'comment',
        source,
        meta_type: 'comment',
        value: 'Great work!',
        target: 'project-1',
        attributes: { author: 'alice' },
        created_at: '2024-01-01T00:00:00Z',
      })

      expect(node.value).toBe('Great work!')
      expect(node.target).toBe('project-1')
      expect(node.attributes).toEqual({ author: 'alice' })
      expect(node.created_at).toBe('2024-01-01T00:00:00Z')
    })
  })
})
