'use client';

import { useState } from 'react';
import { MyceliaGraphViewer as ForceGraph, CytoscapeGraph } from '@mycelia/graph';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export default function GraphPage() {
  const [implementation, setImplementation] = useState<'force' | 'cytoscape'>('cytoscape');
  const [layout, setLayout] = useState<'cose-bilkent' | 'dagre' | 'circle' | 'breadthfirst'>('cose-bilkent');

  return (
    <div className="max-w-7xl mx-auto py-8 px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Knowledge Graph Visualization</h1>
        <p className="text-lg text-gray-600">
          Explore the interconnected knowledge graph with interactive visualization
        </p>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Visualization Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Implementation Selector */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Visualization Library
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setImplementation('cytoscape')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    implementation === 'cytoscape'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cytoscape (Advanced)
                </button>
                <button
                  onClick={() => setImplementation('force')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    implementation === 'force'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Force Graph (Simple)
                </button>
              </div>
            </div>

            {/* Layout Selector (Cytoscape only) */}
            {implementation === 'cytoscape' && (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Layout Algorithm
                </label>
                <div className="flex gap-2 flex-wrap">
                  {(['cose-bilkent', 'dagre', 'circle', 'breadthfirst'] as const).map(l => (
                    <button
                      key={l}
                      onClick={() => setLayout(l)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        layout === l
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {l.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {layout === 'cose-bilkent' && 'Force-directed layout with edge bundling'}
                  {layout === 'dagre' && 'Hierarchical layout for directed graphs'}
                  {layout === 'circle' && 'Nodes arranged in a circle'}
                  {layout === 'breadthfirst' && 'Tree-like hierarchical layout'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Graph Visualization */}
      <Card>
        <CardContent className="p-6">
          {implementation === 'cytoscape' ? (
            <CytoscapeGraph
              width={typeof window !== 'undefined' ? window.innerWidth - 100 : 1200}
              height={600}
              layout={layout}
              interactive={true}
            />
          ) : (
            <ForceGraph
              width={typeof window !== 'undefined' ? window.innerWidth - 100 : 1200}
              height={600}
            />
          )}
        </CardContent>
      </Card>

      {/* Features */}
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cytoscape Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Advanced layout algorithms (hierarchical, force-directed, circular)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>High performance with large graphs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Compound nodes and edge bundling</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Professional graph analysis tools</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Force Graph Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Simple and intuitive physics-based layout</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Smooth animations and transitions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Canvas-based rendering for performance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Lightweight and easy to use</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">How to Use</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Navigation</h3>
              <ul className="space-y-1">
                <li>• <strong>Click</strong> nodes to open their detail pages</li>
                <li>• <strong>Drag</strong> to pan around the graph</li>
                <li>• <strong>Scroll</strong> to zoom in/out</li>
                <li>• <strong>Hover</strong> to highlight connections</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Filtering</h3>
              <ul className="space-y-1">
                <li>• Use type filters to show/hide node categories</li>
                <li>• Connected nodes remain visible when filtering</li>
                <li>• Clear filters to show all nodes</li>
                <li>• Layout automatically adjusts after filtering</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}