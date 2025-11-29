// @ts-ignore - package types might be missing
import { unified } from 'unified';
// @ts-ignore
import remarkParse from 'remark-parse';
// @ts-ignore
import remarkMdx from 'remark-mdx';
// @ts-ignore
import remarkGfm from 'remark-gfm';
// @ts-ignore
import remarkHtml from 'remark-html';

/**
 * Process MDX content to HTML
 * Handles markdown with embedded MDX components
 */
export async function processMarkdownToHtml(content: string): Promise<string> {
  try {
    // Create processor with MDX support
    const processor = unified()
      .use(remarkParse)
      .use(remarkMdx)
      .use(remarkGfm)
      .use(remarkHtml, {
        // Allow dangerous HTML since we trust our MDX content
        allowDangerousHtml: true
      });
    
    const result = await processor.process(content);
    return String(result);
  } catch (error) {
    console.error('Error processing markdown to HTML:', error);
    // Return escaped content as fallback
    return `<pre>${escapeHtml(content)}</pre>`;
  }
}

/**
 * Reconstruct MDX element as HTML string
 * This preserves custom components for React rendering
 */
function reconstructMdxElement(node: any): string {
  const name = node.name;
  const attrs = node.attributes
    ?.map((attr: any) => {
      if (attr.type === 'mdxJsxAttribute') {
        const value = attr.value;
        if (typeof value === 'string') {
          return `${attr.name}="${escapeHtml(value)}"`;
        } else if (value === null) {
          return attr.name;
        }
      }
      return '';
    })
    .filter(Boolean)
    .join(' ');
  
  const children = node.children
    ?.map((child: any) => {
      if (child.type === 'text') {
        return child.value;
      } else if (child.type === 'mdxJsxFlowElement' || child.type === 'mdxJsxTextElement') {
        return reconstructMdxElement(child);
      }
      return '';
    })
    .join('');
  
  if (node.selfClosing || !children) {
    return `<${name}${attrs ? ' ' + attrs : ''} />`;
  }
  
  return `<${name}${attrs ? ' ' + attrs : ''}>${children}</${name}>`;
}

/**
 * Basic HTML escaping for security
 */
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Extract plain text from MDX content for summaries
 */
export function extractTextFromMdx(content: string): string {
  // Remove MDX/JSX tags
  let text = content.replace(/<[^>]+>/g, '');
  // Remove markdown formatting
  text = text.replace(/[#*_`~\[\]()]/g, '');
  // Collapse whitespace
  text = text.replace(/\s+/g, ' ').trim();
  return text;
}

/**
 * Get reading time estimate
 */
export function getReadingTime(content: string): number {
  const text = extractTextFromMdx(content);
  const words = text.split(/\s+/).length;
  const wordsPerMinute = 200;
  return Math.ceil(words / wordsPerMinute);
}