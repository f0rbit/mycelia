import { describe, it, expect } from 'bun:test';
import { MarkdownParser } from './markdown';

describe('MarkdownParser', () => {
  const parser = new MarkdownParser();

  it('should parse simple content node', async () => {
    const content = `
<project id="test-project" title="Test Project">
This is a test project with some content.
</project>
    `;

    const result = await parser.parseContent(content, 'test.mdx');
    
    expect(result.errors).toHaveLength(0);
    expect(Object.keys(result.graph.nodes)).toHaveLength(1);
    
    const node = result.graph.nodes['test-project'];
    expect(node).toBeDefined();
    expect(node.primitive).toBe('Content');
    expect(node.type).toBe('project');
    expect(node.id).toBe('test-project');
    if (node.primitive === 'Content') {
      expect(node.title).toBe('Test Project');
    }
  });

  it('should parse reference node', async () => {
    const content = `
<reference id="test-ref" target="some-target">
Reference to another node
</reference>
    `;

    const result = await parser.parseContent(content, 'test.mdx');
    
    expect(result.errors).toHaveLength(0);
    const node = result.graph.nodes['test-ref'];
    expect(node).toBeDefined();
    expect(node.primitive).toBe('Reference');
    expect(node.type).toBe('reference');
    if (node.primitive === 'Reference') {
      expect(node.target).toBe('some-target');
    }
  });

  it('should parse meta node', async () => {
    const content = `
<tag id="test-tag" value="javascript">
Programming language
</tag>
    `;

    const result = await parser.parseContent(content, 'test.mdx');
    
    expect(result.errors).toHaveLength(0);
    const node = result.graph.nodes['test-tag'];
    expect(node).toBeDefined();
    expect(node.primitive).toBe('Meta');
    expect(node.type).toBe('tag');
    if (node.primitive === 'Meta') {
      expect(node.value).toBe('Programming language');
    }
  });

  it('should handle nested content', async () => {
    const content = `
<project id="parent-project" title="Parent">
  <task id="child-task" title="Child Task">
    Task content here
  </task>
</project>
    `;

    const result = await parser.parseContent(content, 'test.mdx');
    
    expect(result.errors).toHaveLength(0);
    expect(Object.keys(result.graph.nodes)).toHaveLength(2);
    
    const parent = result.graph.nodes['parent-project'];
    const child = result.graph.nodes['child-task'];
    
    expect(parent).toBeDefined();
    expect(child).toBeDefined();
    if (parent.primitive === 'Content') {
      expect(parent.children).toContain('child-task');
    }
  });

  it('should generate unique IDs when not provided', async () => {
    const content = `
<project title="Test Project">
Content without explicit ID
</project>
    `;

    const result = await parser.parseContent(content, 'test.mdx');
    
    expect(result.errors).toHaveLength(0);
    expect(Object.keys(result.graph.nodes)).toHaveLength(1);
    
    const nodeId = Object.keys(result.graph.nodes)[0];
    expect(nodeId).toMatch(/^test-project-/); // Generated ID pattern
  });
});