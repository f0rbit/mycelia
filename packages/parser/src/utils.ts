import slugify from 'slugify';
import crypto from 'crypto';
import type { TagRegistry } from '@mycelia/core';

export const id = (tag_name: string, text?: string): string => {
  const base = text ? slugify(text.slice(0, 50), { lower: true }) : slugify(tag_name, { lower: true });
  return `${base}-${crypto.randomBytes(4).toString('hex')}`;
};

export const generateId = (tag_name: string, candidate_id?: string, fallback?: string): string => {
  if (candidate_id) return candidate_id;
  return id(tag_name, fallback);
};
export const generateNodeId = generateId;

export const attrs = (attributes: any[] = []): Record<string, any> => {
  const result: Record<string, any> = {};
  if (!attributes) return result;
  
  for (const attr of attributes) {
    if (attr.type === 'mdxJsxAttribute' && attr.name) {
      if (!attr.value) result[attr.name] = true;
      else if (typeof attr.value === 'string') result[attr.name] = attr.value;
      else if (attr.value.type === 'mdxJsxAttributeValueExpression') result[attr.name] = attr.value.value;
    }
  }
  return result;
};

export const group = <T>(items: T[], key: keyof T): Record<string, string[]> =>
  items.reduce((acc, item) => {
    const k = String(item[key]);
    if (!acc[k]) acc[k] = [];
    acc[k].push((item as any).id);
    return acc;
  }, {} as Record<string, string[]>);

export const semantic = (node: any, registry: TagRegistry): boolean =>
  (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') &&
  node.name &&
  registry[node.name.toLowerCase()] !== undefined;

export const date = (str?: string): string | undefined => {
  if (!str) return undefined;
  try { return new Date(str).toISOString(); } 
  catch { return str; }
};

export const edge = (from: string, to: string, type: string): string => 
  `${from}-${type}-${to}`;

export const text = (node: any, registry: TagRegistry): string => {
  if (!node.children) return '';
  const parts: string[] = [];
  
  const collect = (n: any): void => {
    if (n.type === 'text') parts.push(n.value);
    else if (semantic(n, registry)) return;
    else if (n.children) n.children.forEach(collect);
  };
  
  node.children.forEach(collect);
  return parts.join('').replace(/\s+/g, ' ').trim();
};


export const extractAttributes = attrs;
export const groupBy = group;
export const isSemanticTag = semantic;
export const normalizeDate = date;
export const edgeId = edge;
export const extractTextContent = text;

export const createNodeFromMapping = (
  node_id: string,
  tag_name: string,
  mapping: any,
  attributes: Record<string, any>,
  content: string,
  source: any
): any => {
  const base = {
    id: node_id,
    type: attributes.type || tag_name.toLowerCase(),
    primitive: mapping.primitive,
    source,
    attributes: { ...(mapping.attributes || {}), ...attributes }
  };
  
  const created = date(attributes.created_at || attributes.createdAt);
  const updated = date(attributes.updated_at || attributes.updatedAt);
  if (created) (base as any).created_at = created;
  if (updated) (base as any).updated_at = updated;
  
  switch (mapping.primitive) {
    case 'Content':
      return { ...base, primitive: 'Content', title: attributes.title || attributes.name || content.split('\n')[0] || node_id, content, value: attributes.value, children: [], attributes: base.attributes };
    case 'Reference':
      return { ...base, primitive: 'Reference', target: attributes.to || attributes.target || '', link_type: attributes.link_type || 'references', attributes: base.attributes };
    case 'Meta':
      return { ...base, primitive: 'Meta', meta_type: attributes.meta_type || 'tag', value: content || attributes.value || '', target: attributes.target, attributes: base.attributes };
    default:
      throw new Error(`Unknown primitive: ${mapping.primitive}`);
  }
};
