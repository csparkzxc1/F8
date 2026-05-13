# F8

Film camera app series. f/8 and be there.

## Development

```bash
pnpm install
pnpm seoul     # Start F8 Seoul
pnpm tokyo     # Start F8 Tokyo
pnpm wedding   # Start F8 Wedding
```

Each variant runs the same `@f8/core` package against its own
`variant.config.ts` (city name, accent color, preset packs, copy).

## Architecture

- pnpm workspaces + Turborepo
- React Native 0.76 + Expo SDK 52 + Dev Client
- Skia for the filter engine (LUT + adjustments + grain + lightleak shaders)
- Vision Camera for the capture surface; Skia frame processor wiring is
  stubbed pending on-device profiling (see `services/cameraFrameProcessor.ts`)
- React Navigation v7 stack
- Zustand + AsyncStorage for editor / IAP / preferences state
- expo-media-library, expo-sharing, expo-haptics for system bridges
- react-native-iap for non-consumable preset packs
- PostHog (opt-in) for analytics

```
apps/
  f8-seoul/           Korean street tones
  f8-tokyo/           Neon-night tones (skeleton)
  f8-wedding/         Soft pastel tones (skeleton)
packages/
  core/               Shared screens, engine, shaders, services, navigation
  presets-common/     The free 6 (Noeul → Hyuil) + dummy LUT PNGs
  presets-seoul/      Vintage Korea pack (Ugi → Dongbaek) + dummy LUT PNGs
  presets-tokyo/      (scaffolded)
  presets-wedding/    (scaffolded)
tools/
  build-luts.py       Parametric LUT generator (real film recipes)
  generate-dummy-luts.ts  Zero-dep PNG fallback used during development
  cube-to-png.py      Convert .cube LUT → 512×512 strip
```

## Build & ship

```bash
# After EAS login + Apple Developer setup
eas build --platform ios --profile preview      # internal distribution / sideload
eas build --platform ios --profile production   # App Store submission
eas build --platform android --profile production
```

Bundle ids live in each `apps/*/variant.config.ts` and
`apps/*/app.config.ts`. Replace `com.csparkzxc1.f8.*` with the production
reverse-domain before any store submission.

## Phases

1. Monorepo + variant system + skeleton screens.
2. Filter engine (4 SkSL shaders) + 12 presets + editor surface.
3. Editor: compare slider, long-press original, save, share, overlays.
4. Camera (preset rail, flash, flip, grid) + IAP pack store.
5. Polish: ErrorBoundary, onboarding gate, About, accessibility, EAS configs.

## Status

- Placeholder app icons / splash live under `apps/*/assets`. Swap before
  store submission.
- Bundled LUT PNGs are tinted-identity placeholders; the live shader
  chain is correct but the actual film color science arrives with real
  scans / parametric recipes.
- `settings/url constants` (Terms, Privacy, Contact) need real URLs.

## License

Proprietary. All rights reserved.
