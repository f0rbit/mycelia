import type { ContainerRenderProps } from '../../shared/types';
import { useTheme, useRenderContext } from '../../shared/context';

/**
 * Renders branch nodes that contain children (Project, Essay, etc.)
 */
export function BranchRenderer({ node, children, className = '', style }: ContainerRenderProps) {
  const theme = useTheme();
  const { onNodeClick } = useRenderContext();

  const handleHeaderClick = () => {
    if (onNodeClick) {
      onNodeClick(node);
    }
  };

  // Clean container styling - no backgrounds, cards, or shadows
  const containerStyles: React.CSSProperties = {
    display: 'block',
    margin: `${theme.spacing.lg} 0`,
    paddingLeft: theme.spacing.lg,
    borderLeft: `4px solid #dbeafe`, // blue-100
    fontFamily: theme.typography.fontFamily,
    ...style,
  };

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    cursor: onNodeClick ? 'pointer' : 'default',
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '1.5rem', // text-2xl equivalent
    fontWeight: theme.typography.fontWeight.bold,
    color: '#111827', // gray-900
    margin: 0,
    textDecoration: onNodeClick ? 'none' : 'none',
    cursor: onNodeClick ? 'pointer' : 'default',
  };





  const contentStyles: React.CSSProperties = {
    fontSize: '1.125rem', // text-lg
    color: '#374151', // gray-700
    lineHeight: '1.75', // leading-relaxed
    marginBottom: children ? theme.spacing.lg : 0,
  };

  const childrenContainerStyles: React.CSSProperties = {
    marginLeft: theme.spacing.lg,
    marginTop: theme.spacing.md,
  };

  const childrenHeaderStyles: React.CSSProperties = {
    fontSize: '1.125rem', // text-lg
    fontWeight: '600', // font-semibold
    color: '#1f2937', // gray-800
    marginBottom: theme.spacing.sm,
  };

  // Get display title
  const displayTitle = node.props.title || 
                      node.props.name || 
                      node.content?.split('\n')[0] || 
                      node.id;

  return (
    <article
      className={`mycelia-branch mycelia-branch--${node.type} ${className}`}
      style={containerStyles}
    >
      {/* Header with title and metadata */}
      <header className="mycelia-branch__header" style={{ marginBottom: theme.spacing.sm }}>
        <div style={headerStyles}>
          <h3 style={titleStyles} onClick={handleHeaderClick}>
            {displayTitle}
          </h3>
          
          {node.props.status && (
            <CleanStatusBadge status={node.props.status} />
          )}
        </div>
        
        {node.props.category && (
          <p style={{
            fontSize: theme.typography.fontSize.sm,
            color: '#4b5563', // gray-600
            fontWeight: theme.typography.fontWeight.medium,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin: 0,
          }}>
            {node.props.category.replace(/-/g, ' ')}
          </p>
        )}
      </header>

      {/* Content */}
      {node.content && node.children.length === 0 && (
        <div className="mycelia-branch__content" style={contentStyles}>
          {node.content.split('\n\n').slice(0, 2).map((paragraph: string, i: number) => (
            paragraph.trim() && (
              <p key={i} style={{ marginBottom: '1rem' }}>
                {paragraph.trim()}
              </p>
            )
          ))}
        </div>
      )}

      {/* Children */}
      {children && (
        <div className="mycelia-branch__children" style={childrenContainerStyles}>
          <h4 style={childrenHeaderStyles}>
            {node.type === 'project' ? 'Components' : 'Items'}
          </h4>
          <div style={{ display: 'grid', gap: theme.spacing.sm }}>
            {children}
          </div>
        </div>
      )}

      {/* References */}
      {node.resolvedRefs.length > 0 && (
        <div className="mycelia-branch__references" style={{ marginTop: theme.spacing.md }}>
          <h4 style={{
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.textSecondary,
            margin: `0 0 ${theme.spacing.sm} 0`,
          }}>
            References
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing.xs }}>
            {node.resolvedRefs.map((ref) => (
              <span
                key={ref.id}
                className="mycelia-branch__reference"
                style={{
                  fontSize: theme.typography.fontSize.xs,
                  color: ref.exists ? '#2563eb' : theme.colors.textSecondary,
                  border: '1px solid #d1d5db',
                  padding: `2px ${theme.spacing.xs}`,
                  borderRadius: theme.borderRadius.sm,
                  cursor: ref.exists ? 'pointer' : 'default',
                }}
                onClick={() => {
                  if (ref.exists && useRenderContext().onReferenceClick) {
                    useRenderContext().onReferenceClick?.(ref.id);
                  }
                }}
                title={ref.exists ? `Go to ${ref.title}` : `Missing: ${ref.id}`}
              >
                {ref.title}
                {!ref.exists && ' ❌'}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

/**
 * Clean status badge component without background
 */
function CleanStatusBadge({ status }: { status: string }) {
  const getStatusStyle = (status: string): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      padding: '2px 8px',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '500',
      border: '1px solid',
      display: 'inline-flex',
      alignItems: 'center',
    };

    switch (status.toLowerCase()) {
      case 'active':
      case 'published':
      case 'completed':
        return { ...baseStyle, color: '#15803d', borderColor: '#bbf7d0' };
      case 'wip':
      case 'development':
      case 'in-progress':
        return { ...baseStyle, color: '#a16207', borderColor: '#fde68a' };
      case 'planned':
      case 'draft':
        return { ...baseStyle, color: '#1d4ed8', borderColor: '#bfdbfe' };
      case 'archived':
        return { ...baseStyle, color: '#374151', borderColor: '#d1d5db' };
      default:
        return { ...baseStyle, color: '#374151', borderColor: '#d1d5db' };
    }
  };
  
  return (
    <span style={getStatusStyle(status)}>
      {status}
    </span>
  );
}