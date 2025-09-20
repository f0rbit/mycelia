import { MyceliaGraphViewer } from '@mycelia/graph'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'

export default function GraphPage() {
  return (
    <div className="max-w-7xl mx-auto py-8 px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Knowledge Graph Visualization</h1>
        <p className="text-lg text-gray-600">
          Explore the interconnected knowledge graph with interactive visualization
        </p>
      </div>

      {/* Graph Visualization */}
      <Card>
        <CardContent className="p-6">
          <MyceliaGraphViewer
            width={typeof window !== 'undefined' ? window.innerWidth - 100 : 1200}
            height={600}
          />
        </CardContent>
      </Card>

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
                <li>• Larger nodes represent more important content</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}