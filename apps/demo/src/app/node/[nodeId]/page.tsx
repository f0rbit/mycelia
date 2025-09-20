import { nextjs } from '@mycelia/ssr';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SemanticNodeRenderer } from '../../../components/semantic-node-renderer';

const { 
  getMyceliaProvider,
  generateContentMetadata 
} = nextjs;

interface PageProps {
  params: Promise<{ nodeId: string }>;
}

// Generate static params for all nodes
export async function generateStaticParams() {
  const provider = getMyceliaProvider();
  const allContent = await provider.getAllContent();
  
  const nodeIds = new Set<string>();
  for (const content of allContent) {
    Object.keys(content.graph.nodes).forEach(nodeId => {
      nodeIds.add(nodeId);
    });
  }
  
  return Array.from(nodeIds).map(nodeId => ({
    nodeId: nodeId,
  }));
}

// Generate metadata for each node
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { nodeId } = await params;
  const provider = getMyceliaProvider();
  const content = await provider.getContentByNodeId(nodeId);
  
  if (!content) {
    return { title: 'Node Not Found' };
  }
  
  const node = content.graph.nodes[nodeId];
  if (!node) {
    return { title: 'Node Not Found' };
  }
  
  const title = node.attributes?.title || 
                node.attributes?.name || 
                node.attributes?.value ||
                nodeId;
  
  const description = node.attributes?.description || 
                     node.attributes?.summary ||
                     (node.type ? `${node.type}: ${title}` : title);
  
  return {
    title,
    description,
  };
}

// The page component
export default async function NodePage({ params }: PageProps) {
  const { nodeId } = await params;
  const provider = getMyceliaProvider();
  
  // Get the node content
  const content = await provider.getContentByNodeId(nodeId);
  
  if (!content) {
    notFound();
  }
  
  const node = content.graph.nodes[nodeId];
  if (!node) {
    notFound();
  }
  
  // Get related data
  const breadcrumbs = await provider.getBreadcrumbs?.(nodeId) || [];
  const backlinks = await provider.getBacklinks?.(nodeId) || [];
  
  // Get edges for this node
  const edges = content.graph.edges || [];
  const childNodes: any[] = [];
  const referencedNodes: any[] = [];
  
  // Find relationships
  edges.forEach(edge => {
    if (edge.from === nodeId) {
      const targetNode = content.graph.nodes[edge.to];
      if (targetNode) {
        if (edge.type === 'contains') {
          childNodes.push(targetNode);
        } else if (edge.type === 'references') {
          referencedNodes.push(targetNode);
        }
      }
    }
  });
  
  return (
    <SemanticNodeRenderer
      node={node}
      nodeId={nodeId}
      breadcrumbs={breadcrumbs}
      backlinks={backlinks}
      childNodes={childNodes}
      referencedNodes={referencedNodes}
      htmlContent={content.htmlContent}
    />
  );
}