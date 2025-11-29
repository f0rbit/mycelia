import { describe, it, expect } from 'bun:test'
import {
  createEmptyGraph,
  validateGraph,
  mergeGraphs,
  createContentNode,
  createMetaNode,
} from '../utils.js'
import type { MyceliaGraph } from '../graph.js'

describe('createEmptyGraph', () => {
  it('should create empty graph with initialized structures', () => {
    const graph = createEmptyGraph()

    expect(graph.nodes).toEqual({})
    expect(graph.edges).toEqual([])
    expect(graph.indexes).toBeDefined()
    expect(graph.indexes.byType).toEqual({})
    expect(graph.indexes.byTag).toEqual({})
    expect(graph.indexes.byPrimitive).toEqual({})
    expect(graph.indexes.bySource).toEqual({})
    expect(graph.indexes.inbound).toEqual({})
    expect(graph.indexes.outbound).toEqual({})
    expect(graph.meta).toBeDefined()
    expect(graph.meta.version).toBe('0.1.0')
    expect(graph.meta.files).toBe(0)
    expect(graph.meta.sources).toEqual([])
    expect(graph.meta.stats.nodeCount).toBe(0)
    expect(graph.meta.stats.edgeCount).toBe(0)
    expect(graph.meta.stats.typeBreakdown).toEqual({})
  })

  it('should accept custom version', () => {
    const graph = createEmptyGraph('1.2.3')
    expect(graph.meta.version).toBe('1.2.3')
  })

  it('should generate timestamp', () => {
    const graph = createEmptyGraph()
    expect(graph.meta.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })
})

describe('validateGraph', () => {
  it('should validate empty graph', () => {
    const graph = createEmptyGraph()
    const result = validateGraph(graph)

    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
    expect(result.warnings).toEqual([])
  })

  it('should validate graph with nodes and edges', () => {
    const graph = createEmptyGraph()
    graph.nodes['node-1'] = createContentNode({
      id: 'node-1',
      type: 'project',
      source: { file: 'test.mdx' },
    })
    graph.nodes['node-2'] = createContentNode({
      id: 'node-2',
      type: 'task',
      source: { file: 'test.mdx' },
    })
    graph.edges = [{
      id: 'edge-1',
      from: 'node-1',
      to: 'node-2',
      type: 'contains',
    }]

    const result = validateGraph(graph)
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('should detect broken edge references (missing source)', () => {
    const graph = createEmptyGraph()
    graph.nodes['node-2'] = createContentNode({
      id: 'node-2',
      type: 'task',
      source: { file: 'test.mdx' },
    })
    graph.edges = [{
      id: 'edge-1',
      from: 'missing-node',
      to: 'node-2',
      type: 'contains',
    }]

    const result = validateGraph(graph)
    expect(result.valid).toBe(false)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]).toContain('missing source node "missing-node"')
  })

  it('should detect broken edge references (missing target)', () => {
    const graph = createEmptyGraph()
    graph.nodes['node-1'] = createContentNode({
      id: 'node-1',
      type: 'project',
      source: { file: 'test.mdx' },
    })
    graph.edges = [{
      id: 'edge-1',
      from: 'node-1',
      to: 'missing-target',
      type: 'contains',
    }]

    const result = validateGraph(graph)
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain('missing target node "missing-target"')
  })

  it('should warn about orphaned index entries', () => {
    const graph = createEmptyGraph()
    graph.indexes.byType['project'] = ['missing-node']

    const result = validateGraph(graph)
    expect(result.valid).toBe(true)
    expect(result.warnings).toHaveLength(1)
    expect(result.warnings[0]).toContain('references missing node "missing-node"')
  })

  it('should warn about incorrect stats', () => {
    const graph = createEmptyGraph()
    graph.nodes['node-1'] = createContentNode({
      id: 'node-1',
      type: 'project',
      source: { file: 'test.mdx' },
    })
    graph.meta.stats.nodeCount = 5

    const result = validateGraph(graph)
    expect(result.valid).toBe(true)
    expect(result.warnings[0]).toContain("doesn't match actual")
  })
})

describe('mergeGraphs', () => {
  it('should merge two empty graphs', () => {
    const g1 = createEmptyGraph()
    const g2 = createEmptyGraph()
    const merged = mergeGraphs(g1, g2)

    expect(merged.nodes).toEqual({})
    expect(merged.edges).toEqual([])
    expect(merged.meta.stats.nodeCount).toBe(0)
  })

  it('should merge graphs without conflicts', () => {
    const g1 = createEmptyGraph()
    g1.nodes['node-1'] = createContentNode({
      id: 'node-1',
      type: 'project',
      source: { file: 'file1.mdx' },
    })
    g1.edges = [{ id: 'edge-1', from: 'node-1', to: 'node-2', type: 'contains' }]
    g1.meta.files = 1
    g1.meta.sources = ['file1.mdx']

    const g2 = createEmptyGraph()
    g2.nodes['node-2'] = createContentNode({
      id: 'node-2',
      type: 'task',
      source: { file: 'file2.mdx' },
    })
    g2.edges = [{ id: 'edge-2', from: 'node-2', to: 'node-3', type: 'references' }]
    g2.meta.files = 1
    g2.meta.sources = ['file2.mdx']

    const merged = mergeGraphs(g1, g2)

    expect(Object.keys(merged.nodes)).toHaveLength(2)
    expect(merged.nodes['node-1']).toBeDefined()
    expect(merged.nodes['node-2']).toBeDefined()
    expect(merged.edges).toHaveLength(2)
    expect(merged.meta.files).toBe(2)
    expect(merged.meta.sources).toEqual(['file1.mdx', 'file2.mdx'])
  })

  it('should handle node conflicts (g2 overwrites g1)', () => {
    const g1 = createEmptyGraph()
    g1.nodes['node-1'] = createContentNode({
      id: 'node-1',
      type: 'project',
      source: { file: 'file1.mdx' },
      title: 'Original Title',
    })

    const g2 = createEmptyGraph()
    g2.nodes['node-1'] = createContentNode({
      id: 'node-1',
      type: 'project',
      source: { file: 'file2.mdx' },
      title: 'Updated Title',
    })

    const merged = mergeGraphs(g1, g2)

    expect(merged.nodes['node-1'].title).toBe('Updated Title')
    expect(merged.nodes['node-1'].source.file).toBe('file2.mdx')
  })

  it('should deduplicate edges by ID', () => {
    const g1 = createEmptyGraph()
    g1.edges = [{ id: 'edge-1', from: 'a', to: 'b', type: 'contains' }]

    const g2 = createEmptyGraph()
    g2.edges = [
      { id: 'edge-1', from: 'a', to: 'b', type: 'contains' },
      { id: 'edge-2', from: 'b', to: 'c', type: 'references' },
    ]

    const merged = mergeGraphs(g1, g2)

    expect(merged.edges).toHaveLength(2)
    expect(merged.edges.find(e => e.id === 'edge-1')).toBeDefined()
    expect(merged.edges.find(e => e.id === 'edge-2')).toBeDefined()
  })

  it('should rebuild indexes correctly', () => {
    const g1 = createEmptyGraph()
    g1.nodes['proj-1'] = createContentNode({
      id: 'proj-1',
      type: 'project',
      source: { file: 'file1.mdx' },
    })

    const g2 = createEmptyGraph()
    g2.nodes['task-1'] = createContentNode({
      id: 'task-1',
      type: 'task',
      source: { file: 'file2.mdx' },
    })

    const merged = mergeGraphs(g1, g2)

    expect(merged.indexes.byType['project']).toEqual(['proj-1'])
    expect(merged.indexes.byType['task']).toEqual(['task-1'])
    expect(merged.indexes.byPrimitive['Content']).toEqual(['proj-1', 'task-1'])
    expect(merged.indexes.bySource['file1.mdx']).toEqual(['proj-1'])
    expect(merged.indexes.bySource['file2.mdx']).toEqual(['task-1'])
  })

  it('should recalculate stats correctly', () => {
    const g1 = createEmptyGraph()
    g1.nodes['n1'] = createContentNode({ id: 'n1', type: 'project', source: { file: 'f1.mdx' } })
    g1.nodes['n2'] = createContentNode({ id: 'n2', type: 'task', source: { file: 'f1.mdx' } })
    g1.edges = [{ id: 'e1', from: 'n1', to: 'n2', type: 'contains' }]

    const g2 = createEmptyGraph()
    g2.nodes['n3'] = createContentNode({ id: 'n3', type: 'project', source: { file: 'f2.mdx' } })

    const merged = mergeGraphs(g1, g2)

    expect(merged.meta.stats.nodeCount).toBe(3)
    expect(merged.meta.stats.edgeCount).toBe(1)
    expect(merged.meta.stats.typeBreakdown).toEqual({
      project: 2,
      task: 1,
    })
  })

  it('should not mutate input graphs', () => {
    const g1 = createEmptyGraph()
    g1.nodes['n1'] = createContentNode({ id: 'n1', type: 'project', source: { file: 'f1.mdx' } })
    
    const g2 = createEmptyGraph()
    g2.nodes['n2'] = createContentNode({ id: 'n2', type: 'task', source: { file: 'f2.mdx' } })

    const g1NodeCount = Object.keys(g1.nodes).length
    const g2NodeCount = Object.keys(g2.nodes).length

    mergeGraphs(g1, g2)

    expect(Object.keys(g1.nodes)).toHaveLength(g1NodeCount)
    expect(Object.keys(g2.nodes)).toHaveLength(g2NodeCount)
  })

  it('should rebuild inbound and outbound edge indexes', () => {
    const g1 = createEmptyGraph()
    g1.nodes['n1'] = createContentNode({ id: 'n1', type: 'project', source: { file: 'f1.mdx' } })
    g1.nodes['n2'] = createContentNode({ id: 'n2', type: 'task', source: { file: 'f1.mdx' } })
    g1.edges = [{ id: 'e1', from: 'n1', to: 'n2', type: 'contains' }]

    const g2 = createEmptyGraph()
    g2.nodes['n3'] = createContentNode({ id: 'n3', type: 'task', source: { file: 'f2.mdx' } })
    g2.edges = [{ id: 'e2', from: 'n2', to: 'n3', type: 'references' }]

    const merged = mergeGraphs(g1, g2)

    expect(merged.indexes.outbound['n1']).toEqual(['e1'])
    expect(merged.indexes.outbound['n2']).toEqual(['e2'])
    expect(merged.indexes.inbound['n2']).toEqual(['e1'])
    expect(merged.indexes.inbound['n3']).toEqual(['e2'])
  })

  it('should rebuild tag indexes from meta nodes', () => {
    const g1 = createEmptyGraph()
    g1.nodes['tag-1'] = createMetaNode({
      id: 'tag-1',
      type: 'tag',
      source: { file: 'f1.mdx' },
      meta_type: 'tag',
      value: 'typescript',
      target: 'proj-1',
    })

    const g2 = createEmptyGraph()
    g2.nodes['tag-2'] = createMetaNode({
      id: 'tag-2',
      type: 'tag',
      source: { file: 'f2.mdx' },
      meta_type: 'tag',
      value: 'react',
      target: 'proj-2',
    })

    const merged = mergeGraphs(g1, g2)

    expect(merged.indexes.byTag['typescript']).toEqual(['proj-1'])
    expect(merged.indexes.byTag['react']).toEqual(['proj-2'])
  })
})
