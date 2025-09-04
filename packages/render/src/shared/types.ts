import type { RenderableNode } from '@mycelia/core';
import type { ReactNode } from 'react';

/**
 * Base props for all renderable components
 */
export interface BaseRenderProps {
  node: RenderableNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Component registry for mapping node types to React components
 */
export interface ComponentRegistry {
  [nodeType: string]: React.ComponentType<BaseRenderProps>;
}

/**
 * Theme configuration for rendering
 */
export interface RenderTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    fontWeight: {
      normal: string;
      medium: string;
      bold: string;
    };
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
}

/**
 * Context for passing theme and registry down the component tree
 */
export interface RenderContext {
  theme: RenderTheme;
  registry: ComponentRegistry;
  onNodeClick?: (node: RenderableNode) => void;
  onReferenceClick?: (referenceId: string) => void;
}

/**
 * Props for wrapper components that can contain children
 */
export interface ContainerRenderProps extends BaseRenderProps {
  children?: ReactNode;
}