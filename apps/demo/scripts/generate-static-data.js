#!/usr/bin/env node

/**
 * Generate static data files for complete static site generation
 * This runs at build time to create all necessary JSON files
 */

const fs = require('fs');
const path = require('path');

// Import the existing graph data
const graphData = require('../public/graph.json');

// Ensure directories exist
const dataDir = path.join(__dirname, '..', 'public', 'data');
const nodesDir = path.join(dataDir, 'nodes');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(nodesDir)) {
  fs.mkdirSync(nodesDir, { recursive: true });
}

console.log('🔄 Generating static data files...');

// 1. Copy main graph data to data directory
fs.writeFileSync(
  path.join(dataDir, 'graph.json'),
  JSON.stringify(graphData, null, 2)
);
console.log('✅ Generated data/graph.json');

// 2. Generate separate nodes and edges files
fs.writeFileSync(
  path.join(dataDir, 'nodes.json'),
  JSON.stringify(graphData.nodes, null, 2)
);
console.log('✅ Generated data/nodes.json');

fs.writeFileSync(
  path.join(dataDir, 'edges.json'),
  JSON.stringify(graphData.edges || [], null, 2)
);
console.log('✅ Generated data/edges.json');

// 3. Generate per-node data files for optimized loading
const nodeCount = Object.keys(graphData.nodes).length;
let processedCount = 0;

for (const [nodeId, node] of Object.entries(graphData.nodes)) {
  // Find related edges
  const relatedEdges = (graphData.edges || []).filter(
    edge => edge.from === nodeId || edge.to === nodeId
  );
  
  // Find related nodes
  const relatedNodeIds = new Set();
  relatedEdges.forEach(edge => {
    if (edge.from === nodeId) relatedNodeIds.add(edge.to);
    if (edge.to === nodeId) relatedNodeIds.add(edge.from);
  });
  
  const relatedNodes = {};
  relatedNodeIds.forEach(id => {
    if (graphData.nodes[id]) {
      relatedNodes[id] = graphData.nodes[id];
    }
  });
  
  // Create node-specific data
  const nodeData = {
    node,
    edges: relatedEdges,
    relatedNodes,
    metadata: {
      generatedAt: new Date().toISOString(),
      nodeId
    }
  };
  
  // Write node file
  fs.writeFileSync(
    path.join(nodesDir, `${nodeId}.json`),
    JSON.stringify(nodeData, null, 2)
  );
  
  processedCount++;
  if (processedCount % 100 === 0) {
    console.log(`  Processing nodes: ${processedCount}/${nodeCount}`);
  }
}

console.log(`✅ Generated ${nodeCount} individual node files`);

// 4. Generate type indexes
const typeIndex = {};
for (const [nodeId, node] of Object.entries(graphData.nodes)) {
  const type = node.type || 'unknown';
  if (!typeIndex[type]) {
    typeIndex[type] = [];
  }
  typeIndex[type].push({
    nodeId,
    title: node.attributes?.title || node.attributes?.name || nodeId,
    description: node.attributes?.description || '',
    updatedAt: node.updated_at || node.created_at
  });
}

fs.writeFileSync(
  path.join(dataDir, 'types.json'),
  JSON.stringify(typeIndex, null, 2)
);
console.log('✅ Generated data/types.json');

// 5. Generate metadata file
const metadata = {
  generatedAt: new Date().toISOString(),
  nodeCount: Object.keys(graphData.nodes).length,
  edgeCount: (graphData.edges || []).length,
  types: Object.keys(typeIndex),
  stats: {
    ...graphData.meta?.stats,
    typeBreakdown: Object.fromEntries(
      Object.entries(typeIndex).map(([type, nodes]) => [type, nodes.length])
    )
  }
};

fs.writeFileSync(
  path.join(dataDir, 'metadata.json'),
  JSON.stringify(metadata, null, 2)
);
console.log('✅ Generated data/metadata.json');

console.log('\n✨ Static data generation complete!');
console.log(`   - ${nodeCount} nodes`);
console.log(`   - ${(graphData.edges || []).length} edges`);
console.log(`   - ${Object.keys(typeIndex).length} types`);
console.log(`   - Total size: ${(JSON.stringify(graphData).length / 1024 / 1024).toFixed(2)} MB`);