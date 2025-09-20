import { nextjs } from '@mycelia/ssr';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const { getMyceliaProvider } = nextjs;

export default async function HomePage() {
  const provider = getMyceliaProvider();
  const allContent = await provider.getAllContent();
  
  // Collect all nodes from all content
  const allNodes = new Map<string, any>();
  for (const content of allContent) {
    Object.entries(content.graph.nodes).forEach(([id, node]) => {
      if (!allNodes.has(id)) {
        allNodes.set(id, node);
      }
    });
  }
  
  // Group nodes by type
  const nodesByType = new Map<string, any[]>();
  allNodes.forEach((node, id) => {
    const type = node.type || 'unknown';
    if (!nodesByType.has(type)) {
      nodesByType.set(type, []);
    }
    nodesByType.get(type)!.push({ ...node, id });
  });
  
  // Define type priority and colors
  const typePriority = ['portfolio', 'person', 'project', 'essay', 'skill', 'research', 'task', 'note', 'tag'];
  const typeColors: Record<string, string> = {
    portfolio: 'bg-purple-50 text-purple-700 border-purple-200',
    person: 'bg-blue-50 text-blue-700 border-blue-200',
    project: 'bg-green-50 text-green-700 border-green-200',
    essay: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    skill: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    research: 'bg-pink-50 text-pink-700 border-pink-200',
    task: 'bg-orange-50 text-orange-700 border-orange-200',
    note: 'bg-gray-50 text-gray-700 border-gray-200',
    tag: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  };
  
  // Sort types by priority
  const sortedTypes = Array.from(nodesByType.keys()).sort((a, b) => {
    const aIndex = typePriority.indexOf(a);
    const bIndex = typePriority.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
  
  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">Mycelia Knowledge Graph</h1>
        <p className="text-xl text-gray-600">
          Explore {allNodes.size} interconnected nodes across {nodesByType.size} types
        </p>
      </div>
      
      {/* Quick Links */}
      <div className="flex justify-center gap-4 mb-12">
        <Link href="/graph" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          View Graph
        </Link>
        <Link href="/tag" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
          Browse Tags
        </Link>
      </div>
      
      {/* Node Types Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {sortedTypes.map(type => {
          const nodes = nodesByType.get(type)!;
          const colorClass = typeColors[type] || 'bg-gray-50 text-gray-700 border-gray-200';
          
          return (
            <Card key={type} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="capitalize">{type}s</CardTitle>
                  <Badge variant="outline">{nodes.length}</Badge>
                </div>
                <CardDescription>
                  Browse all {type} nodes in the knowledge graph
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Show first 3 items */}
                <div className="space-y-2 mb-4">
                  {nodes.slice(0, 3).map(node => (
                    <Link
                      key={node.id}
                      href={`/node/${node.id}`}
                      className="block text-sm text-blue-600 hover:text-blue-800 hover:underline truncate"
                    >
                      {node.attributes?.title || node.attributes?.name || node.attributes?.value || node.id}
                    </Link>
                  ))}
                </div>
                {nodes.length > 3 && (
                  <p className="text-sm text-gray-500">
                    +{nodes.length - 3} more {type}s
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Featured Content */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Featured Content</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Portfolio */}
          {nodesByType.get('portfolio')?.slice(0, 1).map(node => (
            <Card key={node.id} className="md:col-span-2">
              <CardHeader>
                <Badge className="w-fit mb-2">Portfolio</Badge>
                <CardTitle>
                  <Link href={`/node/${node.id}`} className="hover:text-blue-600">
                    {node.attributes?.title || node.id}
                  </Link>
                </CardTitle>
                <CardDescription>{node.attributes?.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link 
                  href={`/node/${node.id}`}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800"
                >
                  Explore Portfolio →
                </Link>
              </CardContent>
            </Card>
          ))}
          
          {/* Recent Projects */}
          {nodesByType.get('project')?.slice(0, 2).map(node => (
            <Card key={node.id}>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">Project</Badge>
                  {node.attributes?.status && (
                    <Badge variant="secondary">{node.attributes.status}</Badge>
                  )}
                </div>
                <CardTitle>
                  <Link href={`/node/${node.id}`} className="hover:text-blue-600">
                    {node.attributes?.title || node.id}
                  </Link>
                </CardTitle>
                <CardDescription>{node.attributes?.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Nodes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allNodes.size}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Node Types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nodesByType.size}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Content Files</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allContent.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Edges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allContent.reduce((sum, c) => sum + c.graph.edges.length, 0)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}