import { describe, it, expect } from 'bun:test';
import { MarkdownParser } from './markdown.js';

describe('MarkdownParser', () => {
  const parser = new MarkdownParser();

  it('should parse simple MDX with Project tag', async () => {
    const content = `
# Test Document

<Project id="test-project" title="My Test Project">
  This is a test project with some content.
</Project>
`;
    
    const result = await parser.parseContent(content, 'test.mdx');
    
    expect(result.errors).toHaveLength(0);
    expect(Object.keys(result.graph.nodes)).toHaveLength(1);
    
    const projectNode = Object.values(result.graph.nodes)[0];
    expect(projectNode.type).toBe('project');
    expect(projectNode.primitive).toBe('Branch');
    expect(projectNode.id).toBe('test-project');
    expect(projectNode.source.file).toBe('test.mdx');
  });

  it('should parse nested structures with parent-child relationships', async () => {
    const content = `
<Project id="main-project" title="Main Project">
  <Task id="task1" title="First Task">
    This is the first task
  </Task>
  <Task id="task2" title="Second Task">
    This is the second task
  </Task>
</Project>
`;
    
    const result = await parser.parseContent(content, 'nested.mdx');
    
    expect(result.errors).toHaveLength(0);
    expect(Object.keys(result.graph.nodes)).toHaveLength(3);
    expect(result.graph.edges).toHaveLength(2);
    
    // Check project node
    const projectNode = result.graph.nodes['main-project'];
    expect(projectNode.primitive).toBe('Branch');
    expect((projectNode as any).children).toEqual(['task1', 'task2']);
    
    // Check containment edges
    const containsEdges = result.graph.edges.filter(e => e.type === 'contains');
    expect(containsEdges).toHaveLength(2);
    expect(containsEdges[0].from).toBe('main-project');
    expect(containsEdges[0].to).toBe('task1');
  });

  it('should create reference edges between nodes', async () => {
    const content = `
<Project id="project1">
  <Task id="task1">Task references person1</Task>
</Project>

<Person id="person1" name="Alice">Alice is a collaborator</Person>
`;
    
    const result = await parser.parseContent(content, 'references.mdx');
    
    expect(result.errors).toHaveLength(0);
    expect(Object.keys(result.graph.nodes)).toHaveLength(3);
    
    // Should have contain edges + reference edge
    const referenceEdges = result.graph.edges.filter(e => e.type === 'references');
    expect(referenceEdges.length).toBeGreaterThan(0);
  });

  it('should handle Link nodes with explicit targets', async () => {
    const content = `
<Project id="project1">
  <Ref to="external-task" />
</Project>
`;
    
    const result = await parser.parseContent(content, 'links.mdx');
    
    expect(result.errors).toHaveLength(0);
    
    const linkNode = Object.values(result.graph.nodes).find(n => n.primitive === 'Link');
    expect(linkNode).toBeDefined();
    expect((linkNode as any).target).toBe('external-task');
    
    // Should create reference edge
    const refEdge = result.graph.edges.find(e => e.type === 'references' && e.to === 'external-task');
    expect(refEdge).toBeDefined();
  });

  it('should build proper indexes', async () => {
    const content = `
<Project id="project1">
  <Task id="task1">Task content</Task>
  <Person id="person1">Person content</Person>
</Project>
`;
    
    const result = await parser.parseContent(content, 'indexes.mdx');
    
    expect(result.graph.indexes.byType.project).toEqual(['project1']);
    expect(result.graph.indexes.byType.task).toEqual(['task1']);
    expect(result.graph.indexes.byType.person).toEqual(['person1']);
    
    expect(result.graph.indexes.byPrimitive.Branch).toEqual(['project1']);
    expect(result.graph.indexes.byPrimitive.Leaf).toContain('task1');
    expect(result.graph.indexes.byPrimitive.Leaf).toContain('person1');
    
    expect(result.graph.indexes.bySource['indexes.mdx']).toHaveLength(3);
  });

  it('should create proper renderable tree', async () => {
    const content = `
<Project id="project1" title="My Project">
  <Task id="task1">First task</Task>
</Project>
`;
    
    const result = await parser.parseContent(content, 'renderable.mdx');
    
    expect(result.renderTree.root.children).toHaveLength(1);
    
    const projectRenderable = result.renderTree.root.children[0];
    expect(projectRenderable.id).toBe('project1');
    expect(projectRenderable.type).toBe('project');
    expect(projectRenderable.primitive).toBe('Branch');
    expect(projectRenderable.children).toHaveLength(1);
    
    const taskRenderable = projectRenderable.children[0];
    expect(taskRenderable.id).toBe('task1');
    expect(taskRenderable.content).toBe('First task');
  });

  it('should handle unknown tags with warnings', async () => {
    const content = `
<UnknownTag id="test">
  This is an unknown tag
</UnknownTag>
`;
    
    const result = await parser.parseContent(content, 'unknown.mdx');
    
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain('Unknown tag');
    expect(Object.keys(result.graph.nodes)).toHaveLength(0);
  });

  it('should generate metadata correctly', async () => {
    const content = `<Project id="test">Test</Project>`;
    
    const result = await parser.parseContent(content, 'meta.mdx');
    
    expect(result.graph.meta.files).toBe(1);
    expect(result.graph.meta.sources).toEqual(['meta.mdx']);
    expect(result.graph.meta.stats.nodeCount).toBe(1);
    expect(result.graph.meta.stats.edgeCount).toBe(0);
    expect(result.graph.meta.generatedAt).toBeTruthy();
    expect(result.graph.meta.version).toBe('0.1.0');
  });

  it('should handle multiple files', async () => {
    // This test would require actual files, but we can test the logic
    const content1 = `<Project id="project1">Project 1</Project>`;
    const content2 = `<Project id="project2">Project 2</Project>`;
    
    // Parse separately and verify structure
    const result1 = await parser.parseContent(content1, 'file1.mdx');
    const result2 = await parser.parseContent(content2, 'file2.mdx');
    
    expect(Object.keys(result1.graph.nodes)).toHaveLength(1);
    expect(Object.keys(result2.graph.nodes)).toHaveLength(1);
    expect(result1.graph.nodes['project1']).toBeTruthy();
    expect(result2.graph.nodes['project2']).toBeTruthy();
  });

  it('should generate JSON serializable output', async () => {
    const content = `
<Project id="test" title="JSON Test">
  <Task id="subtask">A subtask</Task>
</Project>
`;
    
    const result = await parser.parseContent(content, 'json.mdx');
    
    // Test that the graph can be serialized to JSON
    expect(() => JSON.stringify(result.graph)).not.toThrow();
    
    const jsonString = JSON.stringify(result.graph, null, 2);
    const parsed = JSON.parse(jsonString);
    
    expect(parsed.nodes.test).toBeTruthy();
    expect(parsed.nodes.subtask).toBeTruthy();
    expect(parsed.edges.length).toBeGreaterThan(0); // Should have at least containment edges
    expect(parsed.meta).toBeTruthy();
    expect(parsed.indexes).toBeTruthy();
  });
});