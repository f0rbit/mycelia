#!/usr/bin/env node

/**
 * Verify that the static export is complete and functional
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outDir = path.join(__dirname, '..', 'out');

console.log('🔍 Verifying static export...\n');

let allGood = true;

// 1. Check if out directory exists
if (!fs.existsSync(outDir)) {
  console.error('❌ Output directory does not exist at:', outDir);
  console.log('   Run: npm run build');
  process.exit(1);
}
console.log('✅ Output directory exists');

// 2. Check critical files
const criticalFiles = [
  'index.html',
  'data/graph.json',
  'data/nodes.json',
  'data/edges.json',
  'data/metadata.json',
  'data/types.json',
  'graph/index.html',
  'type/projects/index.html',
  'type/people/index.html',
  'type/skills/index.html'
];

for (const file of criticalFiles) {
  const filePath = path.join(outDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing critical file: ${file}`);
    allGood = false;
  } else {
    const size = fs.statSync(filePath).size;
    console.log(`✅ ${file} (${(size / 1024).toFixed(1)} KB)`);
  }
}

// 3. Check node pages
const nodesDir = path.join(outDir, 'node');
if (!fs.existsSync(nodesDir)) {
  console.error('❌ Node pages directory missing');
  allGood = false;
} else {
  const nodePages = fs.readdirSync(nodesDir).filter(f => fs.statSync(path.join(nodesDir, f)).isDirectory());
  console.log(`✅ ${nodePages.length} node pages generated`);
  
  // Check a sample node page
  if (nodePages.length > 0) {
    const sampleNode = nodePages[0];
    const samplePath = path.join(nodesDir, sampleNode, 'index.html');
    if (!fs.existsSync(samplePath)) {
      console.error(`❌ Sample node page missing index.html: ${sampleNode}`);
      allGood = false;
    }
  }
}

// 4. Check data integrity
const graphPath = path.join(outDir, 'data', 'graph.json');
if (fs.existsSync(graphPath)) {
  try {
    const graph = JSON.parse(fs.readFileSync(graphPath, 'utf-8'));
    const nodeCount = Object.keys(graph.nodes || {}).length;
    const edgeCount = (graph.edges || []).length;
    console.log(`✅ Graph data: ${nodeCount} nodes, ${edgeCount} edges`);
    
    // Check individual node data files
    const nodeDataDir = path.join(outDir, 'data', 'nodes');
    if (fs.existsSync(nodeDataDir)) {
      const nodeFiles = fs.readdirSync(nodeDataDir).filter(f => f.endsWith('.json'));
      console.log(`✅ ${nodeFiles.length} individual node data files`);
    }
  } catch (e) {
    console.error('❌ Invalid graph.json:', e.message);
    allGood = false;
  }
}

// 5. Check static assets
const assetsDir = path.join(outDir, '_next', 'static');
if (!fs.existsSync(assetsDir)) {
  console.error('❌ Static assets directory missing');
  allGood = false;
} else {
  console.log('✅ Static assets directory exists');
}

// 6. Calculate total size
function getDirSize(dir) {
  let size = 0;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      size += getDirSize(filePath);
    } else {
      size += stat.size;
    }
  }
  return size;
}

const totalSize = getDirSize(outDir);
console.log(`\n📊 Total export size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

// Final verdict
console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('✅ STATIC EXPORT VERIFICATION PASSED!');
  console.log('\nYou can now:');
  console.log('1. Serve locally: cd out && python3 -m http.server 8000');
  console.log('2. Deploy to GitHub Pages, Netlify, Vercel, S3, etc.');
  console.log('3. The site will work completely offline!');
} else {
  console.error('❌ STATIC EXPORT VERIFICATION FAILED');
  console.log('\nPlease fix the issues above and run: npm run build');
  process.exit(1);
}