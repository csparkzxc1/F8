// Single-pass-equivalent filter chain over an SkImage:
// adjustments → LUT → grain → lightleak. Each pass is gated by an "is-active"
// check so that, on low-spec devices, idle passes (e.g. grain at 0) are
// completely skipped instead of wasting fragment cycles.
import React, { forwardRef, useImperativeHandle, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
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
  getGrainEffect,
  getLightleakEffect,
  getLutEffect,
} from '../../engine/shaders';
import { buildUniforms } from '../../engine/applyFilter';
import type { AdjustmentValues } from '../../variant/types';

type Props = {
  image: SkImage;
  lut?: SkImage;
  adjustments: AdjustmentValues;
  width: number;
  height: number;
  seed?: number;
};

export type FilteredImageHandle = {
  snapshot: () => SkImage | null;
};

export const FilteredImage = forwardRef<FilteredImageHandle, Props>(function FilteredImage(
  { image, lut, adjustments, width, height, seed = 0 },
  ref,
) {
  const canvasRef = useCanvasRef();

  const uniforms = useMemo(
    () => buildUniforms(adjustments, [width, height], seed),
    [adjustments, width, height, seed],
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
  const grainOn = uniforms.grain.amount > 0.001;
  const leakOn =
    uniforms.lightleak.leakAmount > 0.001 ||
    uniforms.lightleak.vignetteAmount > 0.001 ||
    uniforms.lightleak.halation > 0.001;
  const lutOn = !!lut && uniforms.lut.intensity > 0.001;

  const adj = getAdjustmentsEffect();

  // Build the chain bottom-up: source → adjustments → [lut] → [grain] → [leak].
  let chain = (
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

  return (
    <View style={[styles.wrap, { width, height }]}>
      <Canvas ref={canvasRef} style={{ width, height }}>
        <Fill>{chain}</Fill>
      </Canvas>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { backgroundColor: '#000' },
});
