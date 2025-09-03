import slugify from 'slugify';
import crypto from 'crypto';
import type { MyceliaNode, TagMapping } from '@mycelia/core';

/**
 * Generate a unique ID for a node
 */
export function generateNodeId(
  type: string, 
  candidateId?: string, 
  fallbackContent?: string
): string {
  if (candidateId) return candidateId;
  
  const base = fallbackContent ? 
    slugify(fallbackContent.slice(0, 50), { lower: true }) : 
    slugify(type, { lower: true });
    
  const hash = crypto.randomBytes(4).toString('hex');
  return `${base}-${hash}`;
}

/**
 * Extract attributes from MDX JSX element
 */
export function extractAttributes(attributes: any[] = []): Record<string, any> {
  const attrs: Record<string, any> = {};
  
  if (!attributes) return attrs;
  
  for (const attr of attributes) {
    if (attr.type === 'mdxJsxAttribute' && attr.name) {
      if (!attr.value) {
        attrs[attr.name] = true;
      } else if (typeof attr.value === 'string') {
        attrs[attr.name] = attr.value;
      } else if (attr.value.type === 'mdxJsxAttributeValueExpression') {
        attrs[attr.name] = attr.value.value;
      }
    }
  }
  
  return attrs;
}

/**
 * Create a node based on tag mapping
 */
export function createNodeFromMapping(
  id: string,
  tagName: string,
  mapping: TagMapping,
  attributes: Record<string, any>,
  content: string,
  source: any
): MyceliaNode {
  const baseProps = {
    id,
    type: attributes.type || mapping.defaultProps?.type || tagName.toLowerCase(),
    primitive: mapping.primitive,
    source,
    ...mapping.defaultProps,
    attributes: { ...mapping.defaultProps, ...attributes }
  };

  switch (mapping.primitive) {
    case 'Leaf':
      return {
        ...baseProps,
        primitive: 'Leaf',
        value: content || attributes.value,
        attributes: baseProps.attributes
      };
      
    case 'Branch':
      return {
        ...baseProps,
        primitive: 'Branch',
        title: attributes.title || attributes.name || content.split('\n')[0] || id,
        content: content,
        children: [],
        attributes: baseProps.attributes
      };
      
    case 'Trunk':
      return {
        ...baseProps,
        primitive: 'Trunk',
        title: attributes.title || attributes.name || content.split('\n')[0] || id,
        description: content,
        children: [],
        attributes: baseProps.attributes
      };
      
    case 'Link':
      return {
        ...baseProps,
        primitive: 'Link',
        target: attributes.to || attributes.target || '',
        linkType: attributes.linkType || mapping.defaultProps?.linkType || 'references',
        attributes: baseProps.attributes
      };
      
    case 'Meta':
      return {
        ...baseProps,
        primitive: 'Meta',
        metaType: attributes.metaType || mapping.defaultProps?.metaType || 'annotation',
        value: content || attributes.value || '',
        target: attributes.target,
        attributes: baseProps.attributes
      };
      
    default:
      throw new Error(`Unknown primitive: ${mapping.primitive}`);
  }
}

/**
 * Normalize date string
 */
export function normalizeDate(dateStr?: string): string | undefined {
  if (!dateStr) return undefined;
  
  try {
    return new Date(dateStr).toISOString();
  } catch {
    return dateStr;
  }
}