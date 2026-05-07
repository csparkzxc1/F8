// Single-pass-equivalent filter chain over an SkImage:
// adjustments → LUT → grain → lightleak. All shaders nest as ImageShaders.
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Canvas,
  Fill,
  Shader,
  ImageShader,
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

export function FilteredImage({ image, lut, adjustments, width, height, seed = 0 }: Props) {
  const uniforms = useMemo(
    () => buildUniforms(adjustments, [width, height], seed),
    [adjustments, width, height, seed],
  );

  const adj = getAdjustmentsEffect();
  const grain = getGrainEffect();
  const leak = getLightleakEffect();
  const lutEff = lut ? getLutEffect() : null;

  return (
    <View style={[styles.wrap, { width, height }]}>
      <Canvas style={{ width, height }}>
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
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: '#000' },
});
