import type { ContainerRenderProps } from '../../shared/types';
import { useRenderContext } from '../../shared/context';

/**
 * Minimalistic trunk renderer - clean section headers, no card styling
 */
export function MinimalTrunkRenderer({ node, children, className = '', style }: ContainerRenderProps) {
  const { onNodeClick } = useRenderContext();

  const handleHeaderClick = () => {
    if (onNodeClick) {
      onNodeClick(node);
    }
  };

  // Clean container with minimal spacing
  const containerStyles: React.CSSProperties = {
    marginBottom: '32px',
    ...style,
  };

  const headerStyles: React.CSSProperties = {
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '8px',
    marginBottom: '16px',
    cursor: onNodeClick ? 'pointer' : 'default',
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '1.5rem', // 24px
    fontWeight: '600',
    color: '#111827',
    margin: 0,
    marginBottom: '4px',
  };

  const typeStyles: React.CSSProperties = {
    fontSize: '0.75rem', // 12px
    color: '#6b7280',
    textTransform: 'lowercase' as const,
  };

  const descriptionStyles: React.CSSProperties = {
    fontSize: '1rem', // 16px
    color: '#6b7280',
    lineHeight: '1.6',
    marginBottom: children ? '24px' : 0,
    fontStyle: 'italic',
  };

  const childrenContainerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  };

  // Get display title
  const displayTitle = node.props.title || 
                      node.props.name || 
                      (node.content ? node.content.split('\n')[0] : node.id);

  // Get description  
  const description = node.props.description || 
                     (node.content && node.content !== displayTitle ? node.content : undefined);

  return (
    <section
      className={`mycelia-minimal-trunk ${className}`}
      style={containerStyles}
    >
      {/* Clean header */}
      <header
        style={headerStyles}
        onClick={handleHeaderClick}
      >
        <h2 style={titleStyles}>{displayTitle}</h2>
        <div style={typeStyles}>{node.type}</div>
      </header>

      {/* Description */}
      {description && (
        <div style={descriptionStyles}>
          {description}
        </div>
      )}

      {/* Children */}
      {children && (
        <div style={childrenContainerStyles}>
          {children}
        </div>
      )}
    </section>
  );
}