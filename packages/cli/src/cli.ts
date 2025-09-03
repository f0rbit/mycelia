#!/usr/bin/env node

import { writeFile } from 'fs/promises';
import { markdown } from '@mycelia/parser';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: mycelia parse <glob-pattern>');
    console.log('Example: mycelia parse "content/**/*.md"');
    process.exit(1);
  }

  const command = args[0];
  
  if (command === 'parse') {
    const pattern = args[1] || 'content/**/*.md';
    console.log(`Parsing files: ${pattern}`);
    
    try {
      const result = await markdown.parse(pattern);
      
      console.log(`\n📊 Parse Results:`);
      console.log(`- Files processed: ${result.graph.meta.files}`);
      console.log(`- Nodes created: ${result.graph.meta.stats.nodeCount}`);
      console.log(`- Edges created: ${result.graph.meta.stats.edgeCount}`);
      console.log(`- Errors: ${result.errors.length}`);
      console.log(`- Warnings: ${result.warnings.length}`);
      
      if (result.errors.length > 0) {
        console.log('\n❌ Errors:');
        result.errors.forEach(error => {
          console.log(`  ${error.file}:${error.line || '?'} - ${error.message}`);
        });
      }
      
      if (result.warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        result.warnings.forEach(warning => {
          console.log(`  ${warning}`);
        });
      }
      
      // Save outputs
      await writeFile('.mycelia/graph.json', JSON.stringify(result.graph, null, 2));
      await writeFile('.mycelia/renderable.json', JSON.stringify(result.renderTree, null, 2));
      
      console.log('\n💾 Output saved:');
      console.log('  - .mycelia/graph.json');
      console.log('  - .mycelia/renderable.json');
      
    } catch (error) {
      console.error('❌ Failed to parse:', error);
      process.exit(1);
    }
  } else {
    console.log('Unknown command:', command);
    console.log('Available commands: parse');
    process.exit(1);
  }
}

main().catch(console.error);