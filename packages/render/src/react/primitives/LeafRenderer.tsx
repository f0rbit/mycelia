import type { BaseRenderProps } from '../../shared/types';
import { useTheme, useRenderContext } from '../../shared/context';

/**
 * Renders atomic leaf nodes (Song, Person, Task, etc.)
 */
export function LeafRenderer({ node, className = '', style }: BaseRenderProps) {
  const theme = useTheme();
  const { onNodeClick } = useRenderContext();

  const handleClick = () => {
    if (onNodeClick) {
      onNodeClick(node);
    }
  };

  // Clean styling - no backgrounds, just border and clean colors
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: `4px 12px`,
    border: '1px solid #cbd5e1', // slate-300
    borderRadius: '6px',
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily,
    color: '#1e40af', // blue-700
    cursor: onNodeClick ? 'pointer' : 'default',
    transition: 'all 0.2s ease',
    backgroundColor: 'transparent',
    ...style,
  };

  const hoverStyles: React.CSSProperties = {
    backgroundColor: '#f8fafc', // slate-50
    borderColor: '#94a3b8', // slate-400
  };

  // Get display content
  const displayContent = node.content || 
                        node.props.title || 
                        node.props.name || 
                        node.props.value || 
                        node.id;

  return (
    <span
      className={`mycelia-leaf mycelia-leaf--${node.type} ${className}`}
      style={baseStyles}
      onClick={handleClick}
      title={`${node.type}: ${displayContent}`}
      onMouseEnter={(e) => {
        Object.assign(e.currentTarget.style, hoverStyles);
      }}
      onMouseLeave={(e) => {
        Object.assign(e.currentTarget.style, baseStyles);
      }}
    >
      <span className="mycelia-leaf__content" style={{ fontWeight: '500' }}>
        {displayContent}
      </span>
      {node.props.status && (
        <CleanStatusBadge status={node.props.status} />
      )}
      {node.props.level && (
        <span 
          style={{
            fontSize: theme.typography.fontSize.xs,
            color: '#64748b', // slate-500
            marginLeft: theme.spacing.xs,
          }}
        >
          ({node.props.level})
        </span>
      )}
    </span>
  );
}

/**
 * Clean status badge for leaf nodes
 */
function CleanStatusBadge({ status }: { status: string }) {
  return (
    <span style={{
      fontSize: '0.625rem',
      padding: '2px 6px',
      backgroundColor: '#1d4ed8',
      color: 'white',
      borderRadius: '9999px',
      marginLeft: '4px',
    }}>
      {status}
    </span>
  );
}