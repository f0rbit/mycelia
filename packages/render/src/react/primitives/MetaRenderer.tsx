import type { BaseRenderProps } from '../../shared/types';
import { useTheme } from '../../shared/context';

/**
 * Renders meta nodes (tags, dates, annotations, etc.)
 */
export function MetaRenderer({ node, className = '', style }: BaseRenderProps) {
  const theme = useTheme();

  const metaType = node.props.metaType || 'annotation';

  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing.xs,
    padding: `2px ${theme.spacing.xs}`,
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily,
    borderRadius: theme.borderRadius.sm,
    fontWeight: theme.typography.fontWeight.medium,
    ...getMetaTypeStyles(metaType, theme),
    ...style,
  };

  // Get display content - handle skill names and levels
  const displayContent = node.props.name || 
                        node.props.value || 
                        node.content || 
                        node.props.title || 
                        node.id;
  
  const skillLevel = node.props.level;

  // Get meta icon
  const getMetaIcon = () => {
    switch (metaType) {
      case 'tag': return '🏷️';
      case 'date': return '📅';
      case 'status': return '📊';
      case 'priority': return '⚡';
      case 'note': return '📝';
      case 'comment': return '💬';
      case 'category': return '📂';
      case 'skill': return '🔧';
      default: return '💭';
    }
  };

  // Format date if it's a date type
  const formatContent = () => {
    if (metaType === 'date' && displayContent) {
      try {
        const date = new Date(displayContent);
        return date.toLocaleDateString();
      } catch {
        return displayContent;
      }
    }
    return displayContent;
  };

  return (
    <span
      className={`mycelia-meta mycelia-meta--${metaType} ${className}`}
      style={baseStyles}
      title={`${metaType}: ${displayContent}${skillLevel ? ` (${skillLevel})` : ''}`}
    >
      <span className="mycelia-meta__icon">{getMetaIcon()}</span>
      <span className="mycelia-meta__content">{formatContent()}</span>
      {skillLevel && metaType === 'skill' && (
        <span 
          className="mycelia-meta__level"
          style={{
            fontSize: '0.7rem',
            opacity: 0.7,
            marginLeft: '4px',
          }}
        >
          ({skillLevel})
        </span>
      )}
    </span>
  );
}

/**
 * Get styles based on meta type
 */
function getMetaTypeStyles(metaType: string, theme: any): React.CSSProperties {
  switch (metaType) {
    case 'tag':
      return {
        backgroundColor: '#3b82f6',
        color: '#ffffff',
        border: 'none',
      };
    case 'date':
      return {
        backgroundColor: '#10b981',
        color: '#ffffff',
        border: 'none',
      };
    case 'status':
      return {
        backgroundColor: '#f59e0b',
        color: '#ffffff',
        border: 'none',
      };
    case 'priority':
      return {
        backgroundColor: '#ef4444',
        color: '#ffffff',
        border: 'none',
      };
    case 'note':
    case 'comment':
      return {
        backgroundColor: theme.colors.surface,
        color: theme.colors.textSecondary,
        border: `1px solid ${theme.colors.border}`,
      };
    case 'category':
      return {
        backgroundColor: '#8b5cf6',
        color: '#ffffff',
        border: 'none',
      };
    case 'skill':
      return {
        backgroundColor: '#059669',
        color: '#ffffff',
        border: 'none',
      };
    default:
      return {
        backgroundColor: theme.colors.surface,
        color: theme.colors.textSecondary,
        border: `1px solid ${theme.colors.border}`,
      };
  }
}