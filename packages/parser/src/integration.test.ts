import { describe, it, expect } from 'bun:test';
import { parse, parseContent } from './markdown';
import { readFile } from 'fs/promises';

describe('integration: real content', () => {
  it('blog-content.mdx', async () => {
    const content = await readFile('../../examples/blog-content.mdx', 'utf-8');
    const result = await parseContent(content, 'blog-content.mdx');
    
    expect(result.errors.filter(e => e.severity === 'error')).toHaveLength(0);
    expect(Object.keys(result.graph.nodes).length).toBeGreaterThan(40);
    
    expect(result.graph.nodes['tom-materne-blogger']).toBeDefined();
    expect(result.graph.nodes['developer-blog']).toBeDefined();
    expect(result.graph.nodes['nextjs-drizzle-cloudflare']).toBeDefined();
    
    const blog = result.graph.nodes['developer-blog'];
    if (blog.primitive === 'Content') {
      expect(blog.children.length).toBeGreaterThan(0);
    }
  });
  
  it('developer-journey.mdx', async () => {
    const content = await readFile('../../examples/developer-journey.mdx', 'utf-8');
    const result = await parseContent(content, 'developer-journey.mdx');
    
    expect(result.errors.filter(e => e.severity === 'error')).toHaveLength(0);
    expect(Object.keys(result.graph.nodes).length).toBeGreaterThan(10);
    
    expect(result.graph.nodes['tom-materne']).toBeDefined();
    expect(result.graph.nodes['programming-journey']).toBeDefined();
    expect(result.graph.nodes['programming-journey'].type).toBe('project');
  });
  
  it('portfolio-showcase.mdx', async () => {
    const content = await readFile('../../examples/portfolio-showcase.mdx', 'utf-8');
    const result = await parseContent(content, 'portfolio-showcase.mdx');
    
    expect(result.errors.filter(e => e.severity === 'error')).toHaveLength(0);
    expect(Object.keys(result.graph.nodes).length).toBeGreaterThan(20);
    expect(result.graph.nodes['portfolio-showcase']).toBeDefined();
  });
});

describe('integration: multi-file', () => {
  it('parses multiple files', async () => {
    const result = await parse(['../../examples/blog-content.mdx', '../../examples/developer-journey.mdx']);
    
    expect(result.errors.filter(e => e.severity === 'error')).toHaveLength(0);
    expect(Object.keys(result.graph.nodes).length).toBeGreaterThan(50);
    
    expect(result.graph.nodes['tom-materne-blogger']).toBeDefined();
    expect(result.graph.nodes['tom-materne']).toBeDefined();
    expect(result.graph.nodes['developer-blog']).toBeDefined();
    expect(result.graph.nodes['programming-journey']).toBeDefined();
  });
  
  it('combines nodes and edges', async () => {
    const result = await parse(['../../examples/blog-content.mdx', '../../examples/developer-journey.mdx']);
    
    expect(result.graph.meta.stats.nodeCount).toBeGreaterThan(50);
    expect(result.graph.meta.stats.edgeCount).toBeGreaterThan(40);
    expect(result.graph.edges.length).toBe(result.graph.meta.stats.edgeCount);
  });
  
  it('deduplicates edges across files', async () => {
    const result = await parse(['../../examples/blog-content.mdx', '../../examples/developer-journey.mdx']);
    const edge_ids = result.graph.edges.map(e => e.id);
    expect(edge_ids.length).toBe(new Set(edge_ids).size);
  });
});

describe('integration: complete graph', () => {
  it('builds indexes correctly', async () => {
    const result = await parse(['../../examples/*.mdx']);
    
    expect(result.graph.indexes.byType).toBeDefined();
    expect(result.graph.indexes.byPrimitive).toBeDefined();
    expect(result.graph.indexes.bySource).toBeDefined();
    expect(result.graph.indexes.inbound).toBeDefined();
    expect(result.graph.indexes.outbound).toBeDefined();
    
    const node_count = Object.keys(result.graph.nodes).length;
    expect(Object.keys(result.graph.indexes.inbound).length).toBe(node_count);
    expect(Object.keys(result.graph.indexes.outbound).length).toBe(node_count);
  });
  
  it('calculates stats correctly', async () => {
    const result = await parse(['../../examples/*.mdx']);
    
    expect(result.graph.meta.stats.nodeCount).toBe(Object.keys(result.graph.nodes).length);
    expect(result.graph.meta.stats.edgeCount).toBe(result.graph.edges.length);
    
    const total_types = Object.values(result.graph.meta.stats.typeBreakdown).reduce((a, b) => a + b, 0);
    expect(total_types).toBe(result.graph.meta.stats.nodeCount);
  });
  
  it('maintains referential integrity', async () => {
    const result = await parse(['../../examples/*.mdx']);
    
    result.graph.edges.forEach(edge => {
      expect(result.graph.nodes[edge.from]).toBeDefined();
      expect(result.graph.nodes[edge.to]).toBeDefined();
    });
  });
  
  it('hierarchy is consistent', async () => {
    const result = await parse(['../../examples/*.mdx']);
    
    Object.values(result.graph.nodes).forEach(node => {
      if (node.primitive === 'Content') {
        node.children.forEach(child_id => {
          expect(result.graph.nodes[child_id]).toBeDefined();
          const contains_edge = result.graph.edges.find(e => 
            e.from === node.id && e.to === child_id && e.type === 'contains'
          );
          expect(contains_edge).toBeDefined();
        });
      }
    });
  });
});
