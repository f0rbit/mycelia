import type { BaseRenderProps } from '../../shared/types';
import { useTheme, useRenderContext } from '../../shared/context';

/**
 * Renders link nodes that reference other nodes
 */
export function LinkRenderer({ node, className = '', style }: BaseRenderProps) {
  const theme = useTheme();
  const { onReferenceClick } = useRenderContext();

  const handleClick = () => {
    if (onReferenceClick && node.props.target) {
      onReferenceClick(node.props.target);
    }
  };

  // Find the target reference in resolved refs
  const targetRef = node.resolvedRefs.find(ref => ref.id === node.props.target);
  const isResolved = Boolean(targetRef?.exists);

  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing.xs,
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    backgroundColor: isResolved ? theme.colors.primary : theme.colors.surface,
    color: isResolved ? theme.colors.background : theme.colors.textSecondary,
    border: `1px solid ${isResolved ? theme.colors.primary : theme.colors.border}`,
    borderRadius: theme.borderRadius.sm,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily,
    textDecoration: 'none',
    cursor: isResolved && onReferenceClick ? 'pointer' : 'default',
    opacity: isResolved ? 1 : 0.7,
    transition: 'all 0.2s ease',
    ...style,
  };

  // Get link type icon
  const getLinkIcon = () => {
    const linkType = node.props.linkType || 'references';
    switch (linkType) {
      case 'collaborates': return '🤝';
      case 'references': return '🔗';
      case 'mentions': return '💬';
      case 'derives': return '🔄';
      case 'tags': return '🏷️';
      default: return '➡️';
    }
  };

  // Get display text
  const displayText = targetRef?.title || 
                     node.props.title || 
                     node.props.target || 
                     node.id;

  return (
    <span
      className={`mycelia-link mycelia-link--${node.props.linkType || 'reference'} ${className}`}
      style={baseStyles}
      onClick={handleClick}
      title={isResolved 
        ? `${node.props.linkType || 'references'}: ${displayText}` 
        : `Unresolved link: ${node.props.target}`
      }
    >
      <span className="mycelia-link__icon">{getLinkIcon()}</span>
      <span className="mycelia-link__text">{displayText}</span>
      {!isResolved && (
        <span 
          className="mycelia-link__status"
          style={{
            fontSize: theme.typography.fontSize.xs,
            color: '#dc2626',
          }}
        >
          ❌
        </span>
      )}
    </span>
  );
}