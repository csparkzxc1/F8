// Single-pass-equivalent filter chain over an SkImage:
// adjustments → LUT → grain → lightleak. Each pass is gated by an "is-active"
// check so that, on low-spec devices, idle passes (e.g. grain at 0) are
// completely skipped instead of wasting fragment cycles.
//
// Long-press anywhere on the canvas reveals the original 1:1. Independent of
// the CompareSlider — both can be active at once.
import React, { forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import {
  Canvas,
  Fill,
  Shader,
  ImageShader,
  useCanvasRef,
  type SkImage,
} from '@shopify/react-native-skia';
import {
  getAdjustmentsEffect,
  getBodyEffect,
  getGrainEffect,
  getLightleakEffect,
  getLutEffect,
} from '../../engine/shaders';
import { buildUniforms, type BodyEffect } from '../../engine/applyFilter';
import { haptic } from '../../services/haptics';
import type { AdjustmentValues } from '../../variant/types';

type Props = {
  image: SkImage;
  lut?: SkImage;
  adjustments: AdjustmentValues;
  // Optical character of the selected camera body, composited on top of the
  // adjustments (additive vignette/flare + a softness blur pass).
  body?: BodyEffect | null;
  width: number;
  height: number;
  seed?: number;
};

export type FilteredImageHandle = {
  snapshot: () => SkImage | null;
};

export const FilteredImage = forwardRef<FilteredImageHandle, Props>(function FilteredImage(
  { image, lut, adjustments, body, width, height, seed = 0 },
  ref,
) {
  const canvasRef = useCanvasRef();
  const [holding, setHolding] = useState(false);

  const uniforms = useMemo(
    () => buildUniforms(adjustments, [width, height], seed, body),
    [adjustments, body, width, height, seed],
  );

  useImperativeHandle(
    ref,
    () => ({
      snapshot: () => canvasRef.current?.makeImageSnapshot() ?? null,
    }),
    [canvasRef],
  );

  // Per-pass gates. A pass with all uniforms at 0 is a no-op — drop it from
  // the shader chain entirely so low-spec GPUs don't pay the sample cost.
  // While `holding`, skip every pass and render the raw source.
  const grainOn = !holding && uniforms.grain.amount > 0.001;
  const leakOn =
    !holding &&
    (uniforms.lightleak.leakAmount > 0.001 ||
      uniforms.lightleak.vignetteAmount > 0.001 ||
      uniforms.lightleak.halation > 0.001);
  const lutOn = !holding && !!lut && uniforms.lut.intensity > 0.001;
  const bodyOn = !holding && uniforms.body.sigma > 0.01;

  let chain: React.ReactNode;
  if (holding) {
    chain = <ImageShader image={image} fit="cover" rect={{ x: 0, y: 0, width, height }} />;
  } else {
    const adj = getAdjustmentsEffect();
    chain = (
      <Shader source={adj} uniforms={uniforms.adjustments}>
        <ImageShader image={image} fit="cover" rect={{ x: 0, y: 0, width, height }} />
      </Shader>
    );

    if (lutOn && lut) {
      const lutEff = getLutEffect();
      chain = (
        <Shader source={lutEff} uniforms={uniforms.lut}>
          {chain}
          <ImageShader image={lut} fit="fill" rect={{ x: 0, y: 0, width: 512, height: 512 }} />
        </Shader>
      );
    }

    // Optical softness sits between color (adjust/LUT) and texture (grain) so
    // grain stays crisp on top of the softened image.
    if (bodyOn) {
      const bodyEff = getBodyEffect();
      chain = (
        <Shader source={bodyEff} uniforms={uniforms.body}>
          {chain}
        </Shader>
      );
    }

    if (grainOn) {
      const grainEff = getGrainEffect();
      chain = (
        <Shader source={grainEff} uniforms={uniforms.grain}>
          {chain}
        </Shader>
      );
    }

    if (leakOn) {
      const leakEff = getLightleakEffect();
      chain = (
        <Shader source={leakEff} uniforms={uniforms.lightleak}>
          {chain}
        </Shader>
      );
    }
  }

  return (
    <Pressable
      delayLongPress={300}
      onLongPress={() => {
        haptic.tap();
        setHolding(true);
      }}
      onPressOut={() => {
        if (holding) {
          haptic.tap();
          setHolding(false);
        }
      }}
      style={[styles.wrap, { width, height }]}
    >
      <Canvas ref={canvasRef} style={{ width, height }}>
        <Fill>{chain}</Fill>
      </Canvas>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  wrap: { backgroundColor: '#000' },
});
