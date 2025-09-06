import type { BaseRenderProps } from '../../shared/types';
import { useTheme } from '../../shared/context';

/**
 * Renders meta nodes (tags, dates, annotations, etc.)
 */
export function MetaRenderer({ node, className = '', style }: BaseRenderProps) {
  const theme = useTheme();

  const metaType = node.props.metaType || 'annotation';

  // Clean styling - no solid backgrounds, just borders
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 8px',
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily,
    borderRadius: '9999px', // rounded-full
    fontWeight: theme.typography.fontWeight.medium,
    border: '1px solid',
    backgroundColor: 'transparent',
    ...getCleanMetaTypeStyles(metaType),
    ...style,
  };

  // Get display content - handle skill names and levels
  const displayContent = node.props.name || 
                        node.props.value || 
                        node.content || 
                        node.props.title || 
                        node.id;
  
  const skillLevel = node.props.level;

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
      <span className="mycelia-meta__content">{formatContent()}</span>
      {skillLevel && (
        <span 
          className="mycelia-meta__level"
          style={{
            fontSize: '0.7rem',
            opacity: 0.8,
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
 * Get clean styles based on meta type (border-only, no solid backgrounds)
 */
function getCleanMetaTypeStyles(metaType: string): React.CSSProperties {
  switch (metaType) {
    case 'tag':
      return {
        color: '#1d4ed8', // blue-700
        borderColor: '#bfdbfe', // blue-200
      };
    case 'date':
      return {
        color: '#047857', // green-700
        borderColor: '#a7f3d0', // green-200
      };
    case 'status':
      return {
        color: '#b45309', // amber-700
        borderColor: '#fde68a', // amber-200
      };
    case 'priority':
      return {
        color: '#dc2626', // red-600
        borderColor: '#fecaca', // red-200
      };
    case 'note':
    case 'comment':
      return {
        color: '#64748b', // slate-500
        borderColor: '#cbd5e1', // slate-300
      };
    case 'category':
      return {
        color: '#7c3aed', // violet-600
        borderColor: '#ddd6fe', // violet-200
      };
    case 'skill':
      return {
        color: '#059669', // green-600
        borderColor: '#bbf7d0', // green-200
      };
    default:
      return {
        color: '#64748b', // slate-500
        borderColor: '#cbd5e1', // slate-300
      };
  }
}