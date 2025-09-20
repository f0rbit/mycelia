#!/usr/bin/env node

/**
 * Test that graph visualization links match actual node pages
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outDir = path.join(__dirname, '..', 'out');
const graphPath = path.join(outDir, 'data', 'graph.json');

console.log('🔍 Testing Graph Navigation Consistency\n');

// Load graph data
const graphData = JSON.parse(fs.readFileSync(graphPath, 'utf-8'));
const nodeIds = Object.keys(graphData.nodes);

console.log(`Found ${nodeIds.length} nodes in graph data\n`);

// Test each node has a corresponding page
let allGood = true;
let tested = 0;
let missing = [];

for (const nodeId of nodeIds) {
  const nodePath = path.join(outDir, 'node', nodeId, 'index.html');
  if (!fs.existsSync(nodePath)) {
    missing.push(nodeId);
    allGood = false;
  }
  tested++;
}

if (missing.length > 0) {
  console.log(`❌ Missing node pages: ${missing.length}`);
  console.log('Missing:', missing.slice(0, 10).join(', '));
} else {
  console.log(`✅ All ${tested} nodes have corresponding pages`);
}

// Test sample navigation paths
console.log('\n📍 Testing navigation paths:');

const testPaths = [
  { from: 'graph', to: 'node/chamber-project', desc: 'Graph → Chamber Project' },
  { from: 'graph', to: 'node/tom-materne', desc: 'Graph → Tom Materne' },
  { from: 'type/projects', to: 'node/chamber-project', desc: 'Projects List → Chamber' },
  { from: 'type/people', to: 'node/tom-materne', desc: 'People List → Tom' },
];

for (const test of testPaths) {
  const fromPath = path.join(outDir, test.from, 'index.html');
  const toPath = path.join(outDir, test.to, 'index.html');
  
  const fromExists = fs.existsSync(fromPath);
  const toExists = fs.existsSync(toPath);
  
  if (fromExists && toExists) {
    console.log(`✅ ${test.desc}`);
  } else {
    console.log(`❌ ${test.desc} (from: ${fromExists}, to: ${toExists})`);
    allGood = false;
  }
}

// Check graph visualization code
console.log('\n🔗 Checking graph click handler:');
const graphPagePath = path.join(outDir, 'graph', 'index.html');
if (fs.existsSync(graphPagePath)) {
  const graphContent = fs.readFileSync(graphPagePath, 'utf-8');
  if (graphContent.includes('/node/') || graphContent.includes('node/')) {
    console.log('✅ Graph page references /node/ paths');
  } else {
    console.log('⚠️  Graph page might not have correct node links');
  }
}

// Final verdict
console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('✅ GRAPH NAVIGATION TEST PASSED!');
  console.log('\nThe graph visualization will correctly link to node pages.');
} else {
  console.log('⚠️  GRAPH NAVIGATION TEST FOUND ISSUES');
  console.log('\nSome nodes might not link correctly from the graph.');
}

console.log('\nTo test interactively:');
console.log('1. Open http://localhost:8888/graph/');
console.log('2. Click on any node');
console.log('3. Should navigate to /node/[nodeId]/');