import type { ContainerRenderProps } from '../../shared/types';
import { useRenderContext } from '../../shared/context';

/**
 * Minimalistic branch renderer - no cards, no background colors, clean hierarchy
 */
export function MinimalBranchRenderer({ node, children, className = '', style }: ContainerRenderProps) {
  const { onNodeClick } = useRenderContext();

  const handleHeaderClick = () => {
    if (onNodeClick) {
      onNodeClick(node);
    }
  };

  // Clean container with left border for hierarchy
  const containerStyles: React.CSSProperties = {
    borderLeft: '4px solid #3b82f6', // Blue left border for primary sections
    paddingLeft: '16px',
    marginBottom: '24px',
    ...style,
  };

  const headerStyles: React.CSSProperties = {
    marginBottom: '8px',
    cursor: onNodeClick ? 'pointer' : 'default',
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '1.125rem', // 18px
    fontWeight: '600',
    color: '#111827',
    margin: 0,
    marginBottom: '4px',
  };

  const typeStyles: React.CSSProperties = {
    fontSize: '0.75rem', // 12px
    color: '#6b7280',
    textTransform: 'lowercase' as const,
    marginBottom: '8px',
  };

  const contentStyles: React.CSSProperties = {
    fontSize: '0.875rem', // 14px
    color: '#374151',
    lineHeight: '1.6',
    marginBottom: children ? '16px' : 0,
    whiteSpace: 'pre-wrap' as const,
  };

  const childrenContainerStyles: React.CSSProperties = {
    marginLeft: '8px',
    paddingLeft: '12px',
    borderLeft: '2px solid #e5e7eb', // Gray left border for children
  };

  // Get display title - clean, no emojis
  const displayTitle = node.props.title || 
                      node.props.name || 
                      (node.content ? node.content.split('\n')[0] : node.id);

  // Status badge - minimal pill style
  const statusStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '500',
    border: '1px solid #d1d5db',
    color: getStatusColor(node.props.status),
    marginLeft: '8px',
  };

  return (
    <div
      className={`mycelia-minimal-branch ${className}`}
      style={containerStyles}
    >
      {/* Clean header */}
      <header
        className="mycelia-branch-header"
        style={headerStyles}
        onClick={handleHeaderClick}
      >
        <h3 style={titleStyles}>{displayTitle}</h3>
        <div style={typeStyles}>
          {node.type}
          {node.props.status && (
            <span style={statusStyles}>
              {node.props.status}
            </span>
          )}
        </div>
      </header>

      {/* Content */}
      {node.content && (
        <div style={contentStyles}>
          {node.content}
        </div>
      )}

      {/* Children with minimal nesting */}
      {children && (
        <div style={childrenContainerStyles}>
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Get minimal status color - just text color, no backgrounds
 */
function getStatusColor(status: string | undefined): string {
  if (!status) return '#6b7280';
  
  switch (status.toLowerCase()) {
    case 'active':
    case 'published':
      return '#16a34a'; // green text
    case 'wip':
    case 'draft':
      return '#ca8a04'; // yellow text
    case 'archived':
    case 'completed':
      return '#6b7280'; // gray text
    case 'blocked':
    case 'error':
      return '#dc2626'; // red text
    default:
      return '#6b7280';
  }
}