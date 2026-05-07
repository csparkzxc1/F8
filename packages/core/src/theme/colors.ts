// Base color tokens. Variant accents are injected via ThemeProvider.
export const baseColors = {
  bg: '#0A0A0A',
  surface: '#161616',
  surfaceElevated: '#1F1F1F',
  border: '#2A2A2A',
  text: '#FAFAFA',
  textMuted: '#8A8A8A',
  textDimmed: '#5A5A5A',
  danger: '#E5484D',
  success: '#30A46C',
} as const;

export const variantAccents = {
  seoul: '#E8C39E',
  tokyo: '#FF6B9D',
  wedding: '#F5E6D3',
  mono: '#D4D4D4',
  cinema: '#C9A96E',
} as const;

export type BaseColors = typeof baseColors;
