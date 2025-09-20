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
 * Create a node based on simplified tag mapping
 * Pure function that maps tag data to node structure
 */
export function createNodeFromMapping(
  id: string,
  tag_name: string,
  mapping: TagMapping,
  attributes: Record<string, any>,
  content: string,
  source: any
): MyceliaNode {
  const base_props = {
    id,
    type: attributes.type || tag_name.toLowerCase(),
    primitive: mapping.primitive,
    source,
    attributes: { ...(mapping.attributes || {}), ...attributes }
  };

  switch (mapping.primitive) {
    case 'Content':
      return {
        ...base_props,
        primitive: 'Content',
        title: attributes.title || attributes.name || content.split('\n')[0] || id,
        content: content,
        value: attributes.value, // For atomic values
        children: [],
        attributes: base_props.attributes
      };
      
    case 'Reference':
      return {
        ...base_props,
        primitive: 'Reference',
        target: attributes.to || attributes.target || '',
        link_type: attributes.link_type || 'references',
        attributes: base_props.attributes
      };
      
    case 'Meta':
      return {
        ...base_props,
        primitive: 'Meta',
        meta_type: attributes.meta_type || 'tag',
        value: content || attributes.value || '',
        target: attributes.target,
        attributes: base_props.attributes
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