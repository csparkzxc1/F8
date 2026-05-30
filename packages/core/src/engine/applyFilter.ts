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

export type BodyUniforms = {
  // Gaussian sigma in pixels for the optical-softness pass. 0 when inactive.
  sigma: number;
  resolution: [number, number];
};

export type FilterUniforms = {
  lut: LutUniforms;
  adjustments: AdjustmentUniforms;
  grain: GrainUniforms;
  lightleak: LightleakUniforms;
  body: BodyUniforms;
};

// Camera-body optical character that composites onto the active preset. Only
// the three fields the shader chain consumes — vignette and flareIntensity are
// additive (0..100 UI scale, clamped), softness drives the blur pass.
export type BodyEffect = {
  vignette: number;
  softness: number;
  flareIntensity: number;
};

const norm = (v: number) => v / 100;
const clamp100 = (v: number) => Math.min(100, Math.max(0, v));

// softness (0..30, from CameraBody) → gaussian sigma in px:
//   ≤10        → 0        (sharp)
//   10..20     → 0..0.5   (subtle)
//   >20        → 0.5..1.0 (moderate)
// TODO: tune softness intensity after physical device testing
export function softnessToSigma(softness: number): number {
  if (softness <= 10) return 0;
  if (softness <= 20) return (softness - 10) / 20;
  return 0.5 + (softness - 20) / 20;
}

export function buildUniforms(
  adj: AdjustmentValues,
  resolution: [number, number],
  seed = 0,
  body?: BodyEffect | null,
): FilterUniforms {
  // Body vignette / flare add on top of the preset's values, clamped to 100;
  // softness is body-only.
  const vignette = clamp100(adj.vignette + (body?.vignette ?? 0));
  const halation = clamp100(adj.halation + (body?.flareIntensity ?? 0));
  const sigma = softnessToSigma(body?.softness ?? 0);

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
      vignetteAmount: norm(vignette),
      halation: norm(halation),
      resolution,
    },
    body: {
      sigma,
      resolution,
    },
  };
}
