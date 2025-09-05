import type { BaseRenderProps } from '../../shared/types';
import { useRenderContext } from '../../shared/context';

/**
 * Minimalistic leaf renderer - simple inline elements, no cards
 */
export function MinimalLeafRenderer({ node, className = '', style }: BaseRenderProps) {
  const { onNodeClick } = useRenderContext();

  const handleClick = () => {
    if (onNodeClick) {
      onNodeClick(node);
    }
  };

  // Clean inline styles - no backgrounds, just simple borders for clickable items
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 8px',
    border: onNodeClick ? '1px solid #d1d5db' : 'none',
    borderRadius: '6px',
    fontSize: '0.875rem', // 14px
    color: '#374151',
    cursor: onNodeClick ? 'pointer' : 'default',
    textDecoration: 'none',
    transition: 'all 0.15s ease',
    marginRight: '4px',
    marginBottom: '2px',
    ...style,
  };

  // Hover styles for interactive elements
  const hoverStyles: React.CSSProperties = {
    ...baseStyles,
    borderColor: '#9ca3af',
    color: '#1f2937',
  };

  // Get display content
  const displayContent = node.content || 
                        node.props.title || 
                        node.props.name || 
                        node.props.value || 
                        node.id;

  // Status styles - minimal text color only
  const statusStyles: React.CSSProperties = {
    fontSize: '0.75rem',
    color: '#6b7280',
    marginLeft: '4px',
    fontWeight: '500',
  };

  return (
    <span
      className={`mycelia-minimal-leaf mycelia-leaf--${node.type} ${className}`}
      style={baseStyles}
      onClick={handleClick}
      title={`${node.type}: ${displayContent}`}
      onMouseEnter={(e) => {
        if (onNodeClick) {
          Object.assign(e.currentTarget.style, hoverStyles);
        }
      }}
      onMouseLeave={(e) => {
        if (onNodeClick) {
          Object.assign(e.currentTarget.style, baseStyles);
        }
      }}
    >
      <span className="mycelia-leaf__content">{displayContent}</span>
      {node.props.level && (
        <span style={statusStyles}>
          ({node.props.level})
        </span>
      )}
      {node.props.status && (
        <span style={statusStyles}>
          • {node.props.status}
        </span>
      )}
    </span>
  );
}