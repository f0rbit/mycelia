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

  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.text,
    cursor: onNodeClick ? 'pointer' : 'default',
    transition: 'all 0.2s ease',
    ...style,
  };

  // Get display content
  const displayContent = node.content || 
                        node.props.title || 
                        node.props.name || 
                        node.props.value || 
                        node.id;

  // Determine icon based on node type
  const getNodeIcon = () => {
    switch (node.type) {
      case 'person': return '👤';
      case 'collaborator': return '🤝';
      case 'song': return '🎵';
      case 'track': return '🎶';
      case 'task': return '✅';
      case 'note': return '📝';
      case 'book': return '📖';
      case 'film': return '🎬';
      case 'skill': return '🔧';
      case 'tag': return '🏷️';
      default: return '•';
    }
  };

  return (
    <span
      className={`mycelia-leaf mycelia-leaf--${node.type} ${className}`}
      style={baseStyles}
      onClick={handleClick}
      title={`${node.type}: ${displayContent}`}
    >
      <span className="mycelia-leaf__icon">{getNodeIcon()}</span>
      <span className="mycelia-leaf__content">{displayContent}</span>
      {node.props.status && (
        <span 
          className="mycelia-leaf__status"
          style={{
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.textSecondary,
            backgroundColor: theme.colors.accent,
            padding: `2px ${theme.spacing.xs}`,
            borderRadius: theme.borderRadius.sm,
            marginLeft: theme.spacing.xs,
          }}
        >
          {node.props.status}
        </span>
      )}
    </span>
  );
}