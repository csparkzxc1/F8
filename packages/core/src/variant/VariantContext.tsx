// React context exposing the active F8 VariantConfig to all screens/components.
import React, { createContext, useContext, useMemo } from 'react';
import type { VariantConfig } from './types';

const VariantContext = createContext<VariantConfig | null>(null);

type Props = {
  config: VariantConfig;
  children: React.ReactNode;
};

export function VariantProvider({ config, children }: Props) {
  const value = useMemo(() => config, [config]);
  return <VariantContext.Provider value={value}>{children}</VariantContext.Provider>;
}

export function useVariant(): VariantConfig {
  const ctx = useContext(VariantContext);
  if (!ctx) {
    throw new Error('useVariant must be used inside <VariantProvider>.');
  }
  return ctx;
}
