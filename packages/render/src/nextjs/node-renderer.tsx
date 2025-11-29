import type { MyceliaNode } from '@mycelia/core';

interface NodeRendererProps {
  nodes: Record<string, MyceliaNode>;
  nodeIds: string[];
  linkBase?: string;
}

/**
 * Render a list of nodes as cards with links
 */
export function NodeRenderer({ nodes, nodeIds, linkBase = '' }: NodeRendererProps) {
  if (!nodeIds || nodeIds.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {nodeIds.map(nodeId => {
        const node = nodes[nodeId];
        if (!node) return null;

        const title = getNodeTitle(node);
        const description = getNodeDescription(node);
        const url = `${linkBase}/${node.type}/${node.id}`;

        return (
          <div key={nodeId} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold mb-2">
              <a href={url} className="text-blue-600 hover:text-blue-800">
                {title}
              </a>
            </h3>
            {description && (
              <p className="text-gray-600 text-sm line-clamp-3">
                {description}
              </p>
            )}
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
              <span className="px-2 py-1 bg-gray-100 rounded">
                {node.type}
              </span>
              {node.attributes?.status && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                  {node.attributes.status}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getNodeTitle(node: MyceliaNode): string {
  if ('title' in node && node.title) return node.title;
  if (node.attributes?.title) return node.attributes.title;
  if (node.attributes?.name) return node.attributes.name;
  if ('value' in node && node.value) return node.value;
  return node.id;
}

function getNodeDescription(node: MyceliaNode): string | null {
  if ('content' in node && node.content) {
    // Get first 200 chars of content
    const text = node.content.replace(/<[^>]*>/g, '').trim();
    return text.length > 200 ? text.substring(0, 200) + '...' : text;
  }
  if ('value' in node && node.value) return node.value;
  if (node.attributes?.description) return node.attributes.description;
  return null;
}