import { describe, it, expect } from 'bun:test';
import { MarkdownParser } from './markdown';

const parser = new MarkdownParser();

describe('unit: primitives', () => {
  it('content node', async () => {
    const result = await parser.parseContent('<project id="test" title="Test">Content</project>', 'test.mdx');
    const node = result.graph.nodes['test'];
    expect(node.primitive).toBe('Content');
    expect(node.type).toBe('project');
    if (node.primitive === 'Content') expect(node.title).toBe('Test');
  });

  it('reference node', async () => {
    const result = await parser.parseContent('<reference id="ref" target="test">Ref</reference>', 'test.mdx');
    const node = result.graph.nodes['ref'];
    expect(node.primitive).toBe('Reference');
    if (node.primitive === 'Reference') expect(node.target).toBe('test');
  });

  it('meta node', async () => {
    const result = await parser.parseContent('<tag id="t" value="js">JS</tag>', 'test.mdx');
    const node = result.graph.nodes['t'];
    expect(node.primitive).toBe('Meta');
    if (node.primitive === 'Meta') expect(node.value).toBe('JS');
  });
});

describe('unit: hierarchy', () => {
  it('nested content', async () => {
    const result = await parser.parseContent('<project id="p"><task id="t">T</task></project>', 'test.mdx');
    expect(Object.keys(result.graph.nodes)).toHaveLength(2);
    const parent = result.graph.nodes['p'];
    if (parent.primitive === 'Content') expect(parent.children).toContain('t');
  });

  it('deep nesting', async () => {
    const result = await parser.parseContent(`
      <project id="p1"><task id="t1"><note id="n1"><tag id="tag1">deep</tag></note></task></project>
    `, 'test.mdx');
    expect(Object.keys(result.graph.nodes)).toHaveLength(4);
    const p1 = result.graph.nodes['p1'];
    const t1 = result.graph.nodes['t1'];
    const n1 = result.graph.nodes['n1'];
    if (p1.primitive === 'Content') expect(p1.children).toContain('t1');
    if (t1.primitive === 'Content') expect(t1.children).toContain('n1');
    if (n1.primitive === 'Content') expect(n1.children).toContain('tag1');
  });

  it('multiple children', async () => {
    const result = await parser.parseContent(`
      <project id="p"><task id="c1">1</task><task id="c2">2</task><task id="c3">3</task></project>
    `, 'test.mdx');
    const parent = result.graph.nodes['p'];
    if (parent.primitive === 'Content') {
      expect(parent.children).toHaveLength(3);
      expect(parent.children).toContain('c1');
      expect(parent.children).toContain('c2');
      expect(parent.children).toContain('c3');
    }
  });

  it('siblings with nesting', async () => {
    const result = await parser.parseContent(`
      <project id="p1"><section id="s1"><task id="t1">1</task></section><section id="s2"><task id="t2">2</task></section></project>
    `, 'test.mdx');
    expect(Object.keys(result.graph.nodes)).toHaveLength(5);
    const p1 = result.graph.nodes['p1'];
    const s1 = result.graph.nodes['s1'];
    if (p1.primitive === 'Content') expect(p1.children).toHaveLength(2);
    if (s1.primitive === 'Content') expect(s1.children).toContain('t1');
  });
});

describe('unit: edges', () => {
  it('explicit references', async () => {
    const result = await parser.parseContent(`
      <project id="p">P</project><reference id="r" target="p">R</reference>
    `, 'test.mdx');
    const edges = result.graph.edges.filter(e => e.from === 'r' && e.to === 'p' && e.type === 'references');
    expect(edges.length).toBeGreaterThan(0);
  });

  it('content references', async () => {
    const result = await parser.parseContent(`
      <project id="my-proj">P</project><essay id="e">About my-proj here</essay>
    `, 'test.mdx');
    const edges = result.graph.edges.filter(e => e.from === 'e' && e.to === 'my-proj' && e.type === 'references');
    expect(edges.length).toBeGreaterThan(0);
  });

  it('no self references', async () => {
    const result = await parser.parseContent('<project id="self">About self here</project>', 'test.mdx');
    const edges = result.graph.edges.filter(e => e.from === 'self' && e.to === 'self');
    expect(edges).toHaveLength(0);
  });

  it('deduplication', async () => {
    const result = await parser.parseContent(`
      <project id="p1" parent="p2">Child</project><project id="p2"><project id="p1">Nested</project></project>
    `, 'test.mdx');
    const edge_ids = result.graph.edges.map(e => e.id);
    expect(edge_ids.length).toBe(new Set(edge_ids).size);
  });
});

describe('unit: id generation', () => {
  it('auto generates from content', async () => {
    const result = await parser.parseContent('<project>Test Project</project>', 'test.mdx');
    expect(Object.keys(result.graph.nodes)).toHaveLength(1);
    const id = Object.keys(result.graph.nodes)[0];
    expect(id).toMatch(/^test-project-/);
  });

  it('unique ids for similar content', async () => {
    const result = await parser.parseContent(`
      <project>First</project><project>Second</project><project>Third</project>
    `, 'test.mdx');
    const ids = Object.keys(result.graph.nodes);
    expect(ids).toHaveLength(3);
    expect(new Set(ids).size).toBe(3);
  });

  it('truncates long content', async () => {
    const result = await parser.parseContent(`<project>${'a'.repeat(200)}</project>`, 'test.mdx');
    const id = Object.keys(result.graph.nodes)[0];
    expect(id.length).toBeLessThan(100);
  });

  it('handles special chars', async () => {
    const result = await parser.parseContent('<project>@#$% special!</project>', 'test.mdx');
    const id = Object.keys(result.graph.nodes)[0];
    expect(id).toMatch(/^.*-[a-f0-9]{8}$/);
  });
});

describe('unit: attributes', () => {
  it('preserves all attributes', async () => {
    const result = await parser.parseContent('<project id="p" title="T" status="active" custom="val">X</project>', 'test.mdx');
    const node = result.graph.nodes['p'];
    expect(node.attributes.title).toBe('T');
    expect(node.attributes.status).toBe('active');
    expect(node.attributes.custom).toBe('val');
  });

  it('boolean attributes', async () => {
    const result = await parser.parseContent('<project id="p" featured>X</project>', 'test.mdx');
    expect(result.graph.nodes['p'].attributes.featured).toBe(true);
  });

  it('normalizes timestamps', async () => {
    const result = await parser.parseContent('<project id="p" createdAt="2024-01-15">X</project>', 'test.mdx');
    const node = result.graph.nodes['p'];
    expect(node.created_at).toBeDefined();
    expect(node.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

describe('unit: indexes', () => {
  it('by type', async () => {
    const result = await parser.parseContent(`
      <project id="p1">P1</project><project id="p2">P2</project><essay id="e">E</essay>
    `, 'test.mdx');
    expect(result.graph.indexes.byType['project']).toHaveLength(2);
    expect(result.graph.indexes.byType['essay']).toHaveLength(1);
  });

  it('by primitive', async () => {
    const result = await parser.parseContent(`
      <project id="p">P</project><reference id="r" target="p">R</reference><tag id="t">T</tag>
    `, 'test.mdx');
    expect(result.graph.indexes.byPrimitive['Content']).toHaveLength(1);
    expect(result.graph.indexes.byPrimitive['Reference']).toHaveLength(1);
    expect(result.graph.indexes.byPrimitive['Meta']).toHaveLength(1);
  });

  it('inbound/outbound edges', async () => {
    const result = await parser.parseContent(`
      <project id="p"><task id="c1">T1</task><task id="c2">T2</task></project>
    `, 'test.mdx');
    expect(result.graph.indexes.outbound['p'].length).toBe(2);
    expect(result.graph.indexes.inbound['c1'].length).toBe(1);
    expect(result.graph.indexes.inbound['c2'].length).toBe(1);
  });
});

describe('unit: stats', () => {
  it('counts nodes and edges', async () => {
    const result = await parser.parseContent(`
      <project id="p"><task id="t1">T1</task><task id="t2">T2</task></project><essay id="e">E</essay>
    `, 'test.mdx');
    expect(result.graph.meta.stats.nodeCount).toBe(4);
    expect(result.graph.meta.stats.edgeCount).toBeGreaterThan(0);
    expect(result.graph.meta.stats.typeBreakdown['project']).toBe(1);
    expect(result.graph.meta.stats.typeBreakdown['task']).toBe(2);
  });
});

describe('unit: edge cases', () => {
  it('empty file', async () => {
    const result = await parser.parseContent('', 'empty.mdx');
    expect(result.errors).toHaveLength(0);
    expect(Object.keys(result.graph.nodes)).toHaveLength(0);
  });

  it('whitespace only', async () => {
    const result = await parser.parseContent('   \n\n  ', 'ws.mdx');
    expect(Object.keys(result.graph.nodes)).toHaveLength(0);
  });

  it('plain markdown', async () => {
    const result = await parser.parseContent('# Title\n\nParagraph', 'plain.mdx');
    expect(Object.keys(result.graph.nodes)).toHaveLength(0);
  });

  it('empty tag', async () => {
    const result = await parser.parseContent('<project id="e"></project>', 'test.mdx');
    expect(result.graph.nodes['e']).toBeDefined();
  });

  it('mixed markdown and tags', async () => {
    const result = await parser.parseContent(`
      # Title
      <project id="p">Content</project>
      Regular text
    `, 'test.mdx');
    expect(Object.keys(result.graph.nodes)).toHaveLength(1);
    expect(result.graph.nodes['p']).toBeDefined();
  });

  it('text extraction excludes nested tags', async () => {
    const result = await parser.parseContent(`
      <project id="p">Direct text<task id="c">Child text</task>More direct</project>
    `, 'test.mdx');
    const parent = result.graph.nodes['p'];
    if (parent.primitive === 'Content') {
      expect(parent.content).not.toContain('Child text');
      expect(parent.content).toContain('Direct text');
    }
  });
});

describe('unit: error handling', () => {
  it('warns on unknown tags', async () => {
    const result = await parser.parseContent('<unknown id="u">X</unknown>', 'test.mdx');
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some(w => w.includes('unknown'))).toBe(true);
  });

  it('handles malformed attributes', async () => {
    const result = await parser.parseContent('<project id="">Empty</project>', 'test.mdx');
    expect(result.errors.filter(e => e.severity === 'error')).toHaveLength(0);
    expect(Object.keys(result.graph.nodes)).toHaveLength(1);
  });
});
