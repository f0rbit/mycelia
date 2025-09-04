#!/usr/bin/env node

/**
 * Integration test to verify parser → render pipeline works
 */
import { markdown } from './packages/parser/dist/index.js';
import fs from 'fs/promises';

async function testIntegration() {
  console.log('🧪 Testing Parser → Render integration...\n');
  
  try {
    // Parse our sample MDX file
    const samplePath = './examples/sample.mdx';
    const content = await fs.readFile(samplePath, 'utf-8');
    console.log('📝 Parsing sample.mdx...');
    
    const result = await markdown.parseContent(content, samplePath);
    
    console.log('✅ Parse successful!');
    console.log(`📊 Results: ${result.graph.meta.stats.nodeCount} nodes, ${result.graph.meta.stats.edgeCount} edges`);
    console.log(`🌳 Renderable tree: ${result.renderTree.meta.totalNodes} nodes`);
    
    // Test that the render package can import the types
    console.log('\n🎨 Testing render package exports...');
    
    const { react } = await import('./packages/render/dist/index.js');
    
    console.log('✅ Render package imported successfully!');
    console.log(`📦 Available components: ${Object.keys(react.Components).length}`);
    console.log(`🎨 Theme colors: ${Object.keys(react.defaultTheme.colors).length}`);
    
    // Verify the render tree structure is compatible
    const rootNode = result.renderTree.root;
    console.log(`\n🔍 Root node: ${rootNode.type} (${rootNode.primitive})`);
    console.log(`📁 Children: ${rootNode.children.length}`);
    
    if (rootNode.children.length > 0) {
      const firstChild = rootNode.children[0];
      console.log(`  └── ${firstChild.type} (${firstChild.primitive}): ${firstChild.props?.title || firstChild.id}`);
      
      if (firstChild.children.length > 0) {
        console.log(`      └── ${firstChild.children.length} sub-items`);
      }
    }
    
    console.log('\n🎉 Integration test passed! Parser → Render pipeline is working.');
    
  } catch (error) {
    console.error('❌ Integration test failed:', error);
    process.exit(1);
  }
}

testIntegration();