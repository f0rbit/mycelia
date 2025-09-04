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

  const containerStyles: React.CSSProperties = {
    display: 'block',
    margin: `${theme.spacing.md} 0`,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    boxShadow: theme.shadows.sm,
    fontFamily: theme.typography.fontFamily,
    ...style,
  };

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottom: `1px solid ${theme.colors.border}`,
    cursor: onNodeClick ? 'pointer' : 'default',
  };

  const titleStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    margin: 0,
  };

  const metaStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
  };

  const contentStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
    lineHeight: '1.6',
    marginBottom: children ? theme.spacing.md : 0,
  };

  const childrenContainerStyles: React.CSSProperties = {
    paddingLeft: theme.spacing.md,
    borderLeft: `2px solid ${theme.colors.border}`,
  };

  // Get display title
  const displayTitle = node.props.title || 
                      node.props.name || 
                      node.content?.split('\n')[0] || 
                      node.id;

  // Get node icon
  const getNodeIcon = () => {
    switch (node.type) {
      case 'project': return '📁';
      case 'essay': return '📄';
      case 'research': return '🔬';
      case 'collection': return '📚';
      default: return '📦';
    }
  };

  return (
    <div
      className={`mycelia-branch mycelia-branch--${node.type} ${className}`}
      style={containerStyles}
    >
      {/* Header with title and metadata */}
      <header
        className="mycelia-branch__header"
        style={headerStyles}
        onClick={handleHeaderClick}
      >
        <h3 style={titleStyles}>
          <span className="mycelia-branch__icon">{getNodeIcon()}</span>
          {' '}
          {displayTitle}
        </h3>
        
        <div className="mycelia-branch__meta" style={metaStyles}>
          {node.props.status && (
            <span 
              className="mycelia-branch__status"
              style={{
                backgroundColor: getStatusColor(node.props.status, theme),
                color: theme.colors.background,
                padding: `2px ${theme.spacing.xs}`,
                borderRadius: theme.borderRadius.sm,
                fontSize: theme.typography.fontSize.xs,
                fontWeight: theme.typography.fontWeight.medium,
              }}
            >
              {node.props.status}
            </span>
          )}
          
          {node.children.length > 0 && (
            <span className="mycelia-branch__child-count">
              {node.children.length} items
            </span>
          )}
        </div>
      </header>

      {/* Content */}
      {node.content && (
        <div className="mycelia-branch__content" style={contentStyles}>
          {node.content}
        </div>
      )}

      {/* Children */}
      {children && (
        <div className="mycelia-branch__children" style={childrenContainerStyles}>
          {children}
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
                  color: ref.exists ? theme.colors.primary : theme.colors.textSecondary,
                  backgroundColor: theme.colors.surface,
                  padding: `2px ${theme.spacing.xs}`,
                  borderRadius: theme.borderRadius.sm,
                  border: `1px solid ${theme.colors.border}`,
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
    </div>
  );
}

/**
 * Get color for status badge
 */
function getStatusColor(status: string, theme: any): string {
  switch (status.toLowerCase()) {
    case 'active':
    case 'published':
      return '#16a34a'; // green
    case 'wip':
    case 'draft':
      return '#ca8a04'; // yellow
    case 'archived':
    case 'completed':
      return '#6b7280'; // gray
    case 'blocked':
    case 'error':
      return '#dc2626'; // red
    default:
      return theme.colors.secondary;
  }
}