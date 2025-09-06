// Main renderer components
export { RenderableTreeRenderer, NodeRenderer } from './RenderableTreeRenderer';

// Primitive components
export * from './primitives/index';

// High-level components
export * from './components/index';

// Registry system
export {
  createComponentRegistry,
  DEFAULT_COMPONENT_REGISTRY,
  Components,
  registerComponent,
  getComponent,
} from './registry';

// Context and theme
export { RenderProvider, useRenderContext, useTheme, useRegistry } from '../shared/context';
export { defaultTheme } from '../shared/theme';
export type { RenderTheme, ComponentRegistry, BaseRenderProps, ContainerRenderProps } from '../shared/types';