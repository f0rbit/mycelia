import type { ContainerRenderProps } from '../../shared/types';
import { useTheme, useRenderContext } from '../../shared/context';

/**
 * Renders trunk nodes that establish scope/context (Document, Collection, etc.)
 */
export function TrunkRenderer({ node, children, className = '', style }: ContainerRenderProps) {
  const theme = useTheme();
  const { onNodeClick } = useRenderContext();

  const handleHeaderClick = () => {
    if (onNodeClick) {
      onNodeClick(node);
    }
  };

  const containerStyles: React.CSSProperties = {
    display: 'block',
    margin: `${theme.spacing.lg} 0`,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    border: `2px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.md,
    fontFamily: theme.typography.fontFamily,
    ...style,
  };

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottom: `2px solid ${theme.colors.border}`,
    cursor: onNodeClick ? 'pointer' : 'default',
  };

  const titleStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    margin: 0,
  };

  const descriptionStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    lineHeight: '1.6',
    marginBottom: children ? theme.spacing.lg : 0,
    fontStyle: 'italic',
  };

  const childrenContainerStyles: React.CSSProperties = {
    display: 'grid',
    gap: theme.spacing.md,
  };

  // Get display title
  const displayTitle = node.props.title || 
                      node.props.name || 
                      node.content?.split('\n')[0] || 
                      node.id;

  // Get description
  const description = node.props.description || 
                     (node.content && node.content !== displayTitle ? node.content : undefined);

  // Get node icon
  const getNodeIcon = () => {
    switch (node.type) {
      case 'document': return '📄';
      case 'collection': return '📁';
      case 'workspace': return '🏠';
      case 'root': return '🌳';
      default: return '🗂️';
    }
  };

  return (
    <div
      className={`mycelia-trunk mycelia-trunk--${node.type} ${className}`}
      style={containerStyles}
    >
      {/* Header */}
      <header
        className="mycelia-trunk__header"
        style={headerStyles}
        onClick={handleHeaderClick}
      >
        <h2 style={titleStyles}>
          <span className="mycelia-trunk__icon">{getNodeIcon()}</span>
          {' '}
          {displayTitle}
        </h2>
        
        {node.children.length > 0 && (
          <span 
            className="mycelia-trunk__summary"
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.textSecondary,
              backgroundColor: theme.colors.background,
              padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
              borderRadius: theme.borderRadius.md,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            {node.children.length} items
          </span>
        )}
      </header>

      {/* Description */}
      {description && (
        <div className="mycelia-trunk__description" style={descriptionStyles}>
          {description}
        </div>
      )}

      {/* Children */}
      {children && (
        <div className="mycelia-trunk__children" style={childrenContainerStyles}>
          {children}
        </div>
      )}
    </div>
  );
}