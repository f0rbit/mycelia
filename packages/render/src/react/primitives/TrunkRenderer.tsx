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

  // Clean trunk styling - simple space separation without cards
  const containerStyles: React.CSSProperties = {
    display: 'block',
    margin: `${theme.spacing.lg} 0`,
    fontFamily: theme.typography.fontFamily,
    ...style,
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '1.875rem', // text-3xl
    fontWeight: theme.typography.fontWeight.bold,
    color: '#111827', // gray-900
    margin: `0 0 ${theme.spacing.md} 0`,
    cursor: onNodeClick ? 'pointer' : 'default',
  };

  const descriptionStyles: React.CSSProperties = {
    fontSize: '1.125rem', // text-lg
    color: '#6b7280', // gray-500
    lineHeight: '1.75',
    marginBottom: children ? theme.spacing.lg : 0,
  };

  const childrenContainerStyles: React.CSSProperties = {
    display: 'grid',
    gap: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  };

  // Get display title
  const displayTitle = node.props.title || 
                      node.props.name || 
                      node.content?.split('\n')[0] || 
                      node.id;

  // Get description
  const description = node.props.description || 
                     (node.content && node.content !== displayTitle ? node.content : undefined);

  return (
    <div
      className={`mycelia-trunk mycelia-trunk--${node.type} ${className}`}
      style={containerStyles}
    >
      {/* Clean header without decorations */}
      <header className="mycelia-trunk__header">
        <h2 style={titleStyles} onClick={handleHeaderClick}>
          {displayTitle}
        </h2>
        
        {node.children.length > 0 && (
          <p style={{
            fontSize: theme.typography.fontSize.sm,
            color: '#6b7280', // gray-500
            margin: `0 0 ${theme.spacing.sm} 0`,
          }}>
            {node.children.length} items
          </p>
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