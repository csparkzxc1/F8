// Provides resolved theme (base colors + variant accent) to descendants.
import React, { createContext, useContext, useMemo } from 'react';
import { baseColors, type BaseColors } from './colors';
import { typography, fontFamily } from './typography';

export type Theme = {
  colors: BaseColors & { accent: string };
  typography: typeof typography;
  fontFamily: typeof fontFamily;
};

const ThemeContext = createContext<Theme | null>(null);

type Props = {
  accentColor: string;
  children: React.ReactNode;
};

export function ThemeProvider({ accentColor, children }: Props) {
  const value = useMemo<Theme>(
    () => ({
      colors: { ...baseColors, accent: accentColor },
      typography,
      fontFamily,
    }),
    [accentColor],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const t = useContext(ThemeContext);
  if (!t) throw new Error('useTheme must be used inside <ThemeProvider>.');
  return t;
}
