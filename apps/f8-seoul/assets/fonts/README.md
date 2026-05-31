# Bundled fonts

Drop the F8 wordmark face here before running `expo prebuild`. The Inter family is SIL OFL licensed and free to redistribute with the app — download `Inter-Black.ttf` (weight 900) from the official source at https://rsms.me/inter/ or https://fonts.google.com/specimen/Inter, save it as:

```
apps/f8-seoul/assets/fonts/Inter-Black.ttf
```

The `expo-font` plugin entry in `app.config.ts` will pick it up automatically and add it to iOS `UIAppFonts`. Skia's `FontMgr.System().matchFamilyStyle('Inter', { weight: Black })` will then resolve to this face, and `applyWatermark` stamps the wordmark in the brand voice.

Without the file, the watermark falls back to SF Pro Display Black → Helvetica Neue → Helvetica → Arial — readable, but not on brand.
