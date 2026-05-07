// Histogram-driven auto exposure/shadow/highlight suggestion.
// Returns a *delta* that the editor merges onto current values.
import type { AdjustmentValues } from '../variant/types';
import { defaultAdjustments } from '../store/editorStore';

export type Histogram = {
  // 256-bin luminance histogram, normalized so values sum to 1.
  bins: number[];
};

export function buildHistogram(grayPixels: Uint8Array): Histogram {
  const bins = new Array<number>(256).fill(0);
  for (let i = 0; i < grayPixels.length; i++) {
    const v = grayPixels[i];
    if (v !== undefined) bins[v]! += 1;
  }
  const total = grayPixels.length || 1;
  for (let i = 0; i < bins.length; i++) bins[i] = bins[i]! / total;
  return { bins };
}

function percentile(h: Histogram, p: number): number {
  let acc = 0;
  for (let i = 0; i < h.bins.length; i++) {
    acc += h.bins[i]!;
    if (acc >= p) return i;
  }
  return 255;
}

export function suggestAdjustments(h: Histogram): AdjustmentValues {
  const p5 = percentile(h, 0.05);
  const p50 = percentile(h, 0.5);
  const p95 = percentile(h, 0.95);

  // Aim for: shadows around 20, mid 128, highlights 235.
  const shadowDelta = (20 - p5) / 2;
  const exposureDelta = (128 - p50) / 1.6;
  const highlightDelta = (235 - p95) / 2;

  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

  return {
    ...defaultAdjustments,
    exposure: clamp(exposureDelta, -100, 100),
    shadows: clamp(shadowDelta, -100, 100),
    highlights: clamp(highlightDelta, -100, 100),
  };
}
