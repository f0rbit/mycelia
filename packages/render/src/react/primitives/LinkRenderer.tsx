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

  // Clean link styling - border only, no solid backgrounds
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing.xs,
    padding: '2px 8px',
    backgroundColor: 'transparent',
    color: isResolved ? '#2563eb' : '#64748b', // blue-600 or slate-500
    border: '1px solid',
    borderColor: isResolved ? '#bfdbfe' : '#d1d5db', // blue-200 or slate-300
    borderRadius: theme.borderRadius.sm,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily,
    textDecoration: 'none',
    cursor: isResolved && onReferenceClick ? 'pointer' : 'default',
    opacity: isResolved ? 1 : 0.7,
    transition: 'all 0.2s ease',
    ...style,
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
      <span className="mycelia-link__text">{displayText}</span>
      {!isResolved && (
        <span 
          className="mycelia-link__status"
          style={{
            fontSize: theme.typography.fontSize.xs,
            color: '#dc2626',
            marginLeft: '4px',
          }}
        >
          ❌
        </span>
      )}
    </span>
  );
}