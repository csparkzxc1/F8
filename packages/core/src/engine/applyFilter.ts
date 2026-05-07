// Maps editor-store AdjustmentValues into shader uniforms.
// UI sliders run on -100..100 / 0..100; shaders want -1..1 / 0..1.
import type { AdjustmentValues } from '../variant/types';

export type LutUniforms = {
  intensity: number;
};

export type AdjustmentUniforms = {
  exposure: number;
  pushPull: number;
  shadows: number;
  highlights: number;
  temperature: number;
  tint: number;
};

export type GrainUniforms = {
  amount: number;
  seed: number;
  resolution: [number, number];
};

export type LightleakUniforms = {
  leakAmount: number;
  vignetteAmount: number;
  halation: number;
  resolution: [number, number];
};

export type FilterUniforms = {
  lut: LutUniforms;
  adjustments: AdjustmentUniforms;
  grain: GrainUniforms;
  lightleak: LightleakUniforms;
};

const norm = (v: number) => v / 100;

export function buildUniforms(
  adj: AdjustmentValues,
  resolution: [number, number],
  seed = 0,
): FilterUniforms {
  return {
    lut: {
      intensity: norm(adj.intensity),
    },
    adjustments: {
      exposure: norm(adj.exposure),
      pushPull: adj.pushPull / 200,
      shadows: norm(adj.shadows),
      highlights: norm(adj.highlights),
      temperature: norm(adj.temperature),
      tint: norm(adj.tint),
    },
    grain: {
      // PushPull biases grain up — pushed film is grainier.
      amount: Math.min(1, norm(adj.grain) + Math.max(0, adj.pushPull / 200) * 0.3),
      seed,
      resolution,
    },
    lightleak: {
      leakAmount: norm(adj.lightLeak),
      vignetteAmount: norm(adj.vignette),
      halation: norm(adj.halation),
      resolution,
    },
  };
}
