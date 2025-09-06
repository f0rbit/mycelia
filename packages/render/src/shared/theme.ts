import type { RenderTheme } from './types';

/**
 * Clean default theme for Mycelia renderers - professional, minimal styling
 */
export const defaultTheme: RenderTheme = {
  colors: {
    primary: '#2563eb',           // blue-600
    secondary: '#64748b',         // slate-500  
    accent: '#f59e0b',           // amber-500
    background: 'transparent',    // No backgrounds by default
    surface: 'transparent',       // No surface backgrounds
    text: '#111827',             // gray-900
    textSecondary: '#6b7280',    // gray-500
    border: '#d1d5db',           // gray-300
  },
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px  
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      md: '1rem',       // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
    },
    fontWeight: {
      normal: '400',
      medium: '500', 
      bold: '600',
    },
  },
  shadows: {
    sm: 'none',       // Remove shadows for clean look
    md: 'none',
    lg: 'none',
  },
  borderRadius: {
    sm: '0.25rem',    // 4px
    md: '0.375rem',   // 6px  
    lg: '0.5rem',     // 8px
  },
};