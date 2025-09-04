'use client'

import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { RenderContext } from './types';
import { defaultTheme } from './theme';

const MyceliaRenderContext = createContext<RenderContext | null>(null);

export interface RenderProviderProps {
  children: ReactNode;
  theme?: Partial<RenderContext['theme']>;
  registry?: RenderContext['registry'];
  onNodeClick?: RenderContext['onNodeClick'];
  onReferenceClick?: RenderContext['onReferenceClick'];
}

export function RenderProvider({
  children,
  theme = {},
  registry = {},
  onNodeClick,
  onReferenceClick,
}: RenderProviderProps) {
  const contextValue: RenderContext = {
    theme: { ...defaultTheme, ...theme },
    registry,
    onNodeClick,
    onReferenceClick,
  };

  return (
    <MyceliaRenderContext.Provider value={contextValue}>
      {children}
    </MyceliaRenderContext.Provider>
  );
}

export function useRenderContext(): RenderContext {
  const context = useContext(MyceliaRenderContext);
  if (!context) {
    throw new Error('useRenderContext must be used within a RenderProvider');
  }
  return context;
}

export function useTheme() {
  return useRenderContext().theme;
}

export function useRegistry() {
  return useRenderContext().registry;
}