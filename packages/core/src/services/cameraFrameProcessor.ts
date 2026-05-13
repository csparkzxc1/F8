// Vision-camera frame processor wiring for live LUT preview.
//
// Status: skeleton. The worklet here is intentionally a no-op pass-through.
// Wiring an actual Skia LUT into the frame processor on every frame requires:
//   1. `react-native-worklets-core` installed and configured in babel
//   2. `@shopify/react-native-skia`'s `useSkiaFrameProcessor` hook (Skia
//      integration ships as a separate plugin for vision-camera v4)
//   3. A 720p (or 540p on low-end) downscale before the LUT pass so the GPU
//      isn't grinding on a 4K texture each frame
//
// We hold off on enabling those on this 4 GB build machine — we can't profile
// 60 fps without a device — and ship the editor preview as the source of
// truth. When Phase 5 EAS builds let us measure on hardware, swap this stub
// for the real Skia frame processor and remove the ENABLE_LIVE_LUT flag.
import { useMemo } from 'react';
import { useFrameProcessor, type ReadonlyFrameProcessor } from 'react-native-vision-camera';
import type { Preset, AdjustmentValues } from '../variant/types';

export const ENABLE_LIVE_LUT = false;

type Params = {
  preset: Preset | null;
  adjustments: AdjustmentValues;
};

export function useFilmFrameProcessor({
  preset,
  adjustments,
}: Params): ReadonlyFrameProcessor | undefined {
  // `useFrameProcessor` has to be called unconditionally — it owns a worklet
  // capture context that React relies on for lifetime tracking.
  const presetId = preset?.id ?? null;
  const intensity = adjustments.intensity;

  const fp = useFrameProcessor(
    (frame) => {
      'worklet';
      // TODO: bind preset.lutAsset + adjustments through to a Skia frame
      // processor (`useSkiaFrameProcessor` from @shopify/react-native-skia).
      // For now this is a pass-through so the preview keeps running while
      // we land the editor pipeline first.
      // Touch the captured vars so the worklet picks up changes when the
      // user switches presets.
      void presetId;
      void intensity;
      void frame;
    },
    [presetId, intensity],
  );

  return useMemo(() => (ENABLE_LIVE_LUT ? fp : undefined), [fp]);
}
