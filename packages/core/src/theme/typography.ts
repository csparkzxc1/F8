// Typography scale. Headlines tight & heavy, body neutral.
export const typography = {
  display: { fontSize: 56, fontWeight: '900' as const, letterSpacing: -1.5 },
  h1: { fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.8 },
  h2: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.4 },
  body: { fontSize: 16, fontWeight: '400' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
  mono: { fontSize: 12, fontWeight: '500' as const, letterSpacing: 0.3 },
} as const;

export const fontFamily = {
  display: 'SF Pro Display',
  text: 'Pretendard',
} as const;
