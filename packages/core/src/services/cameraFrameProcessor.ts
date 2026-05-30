// Live LUT preview via vision-camera's Skia frame processor.
//
// Gated behind ENABLE_LIVE_LUT. Turning it on requires:
//   1. `react-native-worklets-core` installed (peer dep) + its babel plugin —
//      see apps/f8-seoul/babel.config.js
//   2. A native rebuild (`expo prebuild` + `pod install`) so the worklets +
//      Skia frame-processor native modules link
//   3. On-device profiling — the build machine can't measure FPS, so the perf
//      TODOs below (orientation transform, per-frame allocation) are tuned on
//      hardware before flipping the flag for release.
//
// With the flag OFF this returns `undefined`, so <Camera> uses its normal
// preview and the editor remains the source of truth.
//
// Race-safety: the active preset's LUT image lives on a SharedValue and the
// worklet body is built once (empty deps). Switching presets only writes the
// new SkImage into the SharedValue — no worklet runtime tear-down, so frames
// in flight never reference a disposed closure.
import { useEffect, useMemo } from 'react';
import {
  useSkiaFrameProcessor,
  type DrawableFrameProcessor,
} from 'react-native-vision-camera';
import { useSharedValue } from 'react-native-worklets-core';
import { Skia, TileMode, FilterMode, MipmapMode } from '@shopify/react-native-skia';
import { LUT_SHADER } from '../engine/shaders/lut';
import type { Preset } from '../variant/types';
import type { SkImage } from '@shopify/react-native-skia';

export const ENABLE_LIVE_LUT = true;

type Params = {
  preset: Preset | null;
  // The active preset's LUT, loaded once on the JS thread (via useImage) and
  // handed to the worklet through a SharedValue. Null → pass the frame through
  // ungraded.
  lut: SkImage | null;
};

// Live intensity is always 100% — there's no strength slider on the camera.
const LIVE_INTENSITY = 1;

export function useFilmFrameProcessor({ lut }: Params): DrawableFrameProcessor | undefined {
  // SharedValue ferries the SkImage across the JS↔worklet boundary without
  // rebuilding the worklet body on every preset change.
  const lutSv = useSharedValue<SkImage | null>(null);
  useEffect(() => {
    lutSv.value = lut ?? null;
  }, [lut, lutSv]);

  // `useSkiaFrameProcessor` must be called unconditionally to keep hook order
  // stable; we gate the *return* on the flag instead. Empty deps → the worklet
  // body is compiled once and reused for the screen's lifetime.
  const frameProcessor = useSkiaFrameProcessor(
    (frame) => {
      'worklet';
      const currentLut = lutSv.value;

      // Pass-through paths: no LUT loaded yet, or the frame surface didn't
      // hand us a usable SkImage (happens on the first frame after rotation,
      // some front-camera transitions, and occasionally between presets).
      if (!currentLut) {
        frame.render();
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const frameImage = (frame as any).__skImage;
      if (!frameImage || typeof frameImage.makeShaderOptions !== 'function') {
        frame.render();
        return;
      }

      // Compile + cache the LUT effect on the worklet runtime's globalThis so
      // we don't recompile every frame (Skia objects don't cross runtimes, so
      // we can't reuse the JS-thread getLutEffect()).
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const g = globalThis as any;
      if (!g.__f8LutEffect) {
        g.__f8LutEffect = Skia.RuntimeEffect.Make(LUT_SHADER);
      }
      const effect = g.__f8LutEffect;
      if (!effect) {
        frame.render();
        return;
      }

      const srcShader = frameImage.makeShaderOptions(
        TileMode.Clamp,
        TileMode.Clamp,
        FilterMode.Linear,
        MipmapMode.None,
      );
      const lutShader = currentLut.makeShaderOptions(
        TileMode.Clamp,
        TileMode.Clamp,
        FilterMode.Linear,
        MipmapMode.None,
      );
      const shader = effect.makeShaderWithChildren([LIVE_INTENSITY], [srcShader, lutShader]);

      const paint = Skia.Paint();
      paint.setShader(shader);
      // TODO(device): drawing __skImage's shader directly skips the orientation
      // transform frame.render() would apply — verify front/back + portrait on
      // hardware and wrap in the frame's orientation matrix if needed.
      frame.drawRect(Skia.XYWHRect(0, 0, frame.width, frame.height), paint);
    },
    [],
  );

  return useMemo(
    () => (ENABLE_LIVE_LUT ? frameProcessor : undefined),
    [frameProcessor],
  );
}
