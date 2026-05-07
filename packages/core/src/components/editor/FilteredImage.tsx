// Single-pass-equivalent filter chain over an SkImage:
// adjustments → LUT → grain → lightleak. All shaders nest as ImageShaders.
// Exposes a snapshot() handle so the editor can save the rendered pixels
// (not the source) when the user taps 저장.
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

  const adj = getAdjustmentsEffect();
  const grain = getGrainEffect();
  const leak = getLightleakEffect();
  const lutEff = lut ? getLutEffect() : null;

  return (
    <View style={[styles.wrap, { width, height }]}>
      <Canvas ref={canvasRef} style={{ width, height }}>
        <Fill>
          <Shader source={leak} uniforms={uniforms.lightleak}>
            <Shader source={grain} uniforms={uniforms.grain}>
              {lutEff && lut ? (
                <Shader source={lutEff} uniforms={uniforms.lut}>
                  <Shader source={adj} uniforms={uniforms.adjustments}>
                    <ImageShader
                      image={image}
                      fit="cover"
                      rect={{ x: 0, y: 0, width, height }}
                    />
                  </Shader>
                  <ImageShader
                    image={lut}
                    fit="fill"
                    rect={{ x: 0, y: 0, width: 512, height: 512 }}
                  />
                </Shader>
              ) : (
                <Shader source={adj} uniforms={uniforms.adjustments}>
                  <ImageShader
                    image={image}
                    fit="cover"
                    rect={{ x: 0, y: 0, width, height }}
                  />
                </Shader>
              )}
            </Shader>
          </Shader>
        </Fill>
      </Canvas>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { backgroundColor: '#000' },
});
