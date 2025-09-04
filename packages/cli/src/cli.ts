#!/usr/bin/env node

import { writeFile, mkdir, readFile } from 'fs/promises';
import { resolve } from 'path';
import { markdown } from '@mycelia/parser';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage:');
    console.log('  mycelia parse <glob-pattern> [--output=path] [--format=json|pretty]');
    console.log('  mycelia parse-file <file-path> [--output=stdout]');
    console.log('');
    console.log('Examples:');
    console.log('  mycelia parse "content/**/*.md"');
    console.log('  mycelia parse-file example.mdx');
    console.log('  mycelia parse-file example.mdx --output=stdout');
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
      
      // Ensure output directory exists
      try {
        await mkdir('.mycelia', { recursive: true });
      } catch {}
      
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
  } else if (command === 'parse-file') {
    const filePath = args[1];
    if (!filePath) {
      console.log('Usage: mycelia parse-file <file-path> [--output=stdout]');
      process.exit(1);
    }
    
    const outputToStdout = args.includes('--output=stdout');
    
    try {
      const absolutePath = resolve(filePath);
      const content = await readFile(absolutePath, 'utf-8');
      const result = await markdown.parseContent(content, absolutePath);
      
      if (outputToStdout) {
        console.log(JSON.stringify(result.graph, null, 2));
      } else {
        console.log(`\n📊 Parse Results for ${filePath}:`);
        console.log(`- Nodes created: ${result.graph.meta.stats.nodeCount}`);
        console.log(`- Edges created: ${result.graph.meta.stats.edgeCount}`);
        console.log(`- Errors: ${result.errors.length}`);
        console.log(`- Warnings: ${result.warnings.length}`);
        
        if (result.errors.length > 0) {
          console.log('\n❌ Errors:');
          result.errors.forEach(error => {
            console.log(`  ${error.message}`);
          });
        }
        
        if (result.warnings.length > 0) {
          console.log('\n⚠️  Warnings:');
          result.warnings.forEach(warning => {
            console.log(`  ${warning}`);
          });
        }
        
        console.log('\n🔗 Graph JSON:');
        console.log(JSON.stringify(result.graph, null, 2));
      }
      
    } catch (error) {
      console.error('❌ Failed to parse file:', error);
      process.exit(1);
    }
  } else {
    console.log('Unknown command:', command);
    console.log('Available commands: parse, parse-file');
    process.exit(1);
  }
}

main().catch(console.error);