import { buildHistogram, suggestAdjustments } from '../engine/autoAdjust';

describe('buildHistogram', () => {
  it('normalizes bins so they sum to 1', () => {
    const pixels = new Uint8Array([10, 10, 200, 200, 200]);
    const h = buildHistogram(pixels);
    const sum = h.bins.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 5);
  });

  it('keeps a 256-length bin array', () => {
    const h = buildHistogram(new Uint8Array([0, 128, 255]));
    expect(h.bins).toHaveLength(256);
  });
});

describe('suggestAdjustments', () => {
  function uniformPixels(value: number, count = 1024): Uint8Array {
    const px = new Uint8Array(count);
    px.fill(value);
    return px;
  }

  it('lifts exposure when the image is too dark', () => {
    const dark = buildHistogram(uniformPixels(40));
    const adj = suggestAdjustments(dark);
    expect(adj.exposure).toBeGreaterThan(0);
  });

  it('drops exposure when the image is too bright', () => {
    const bright = buildHistogram(uniformPixels(220));
    const adj = suggestAdjustments(bright);
    expect(adj.exposure).toBeLessThan(0);
  });

  it('clamps suggestions into [-100, 100]', () => {
    const black = buildHistogram(uniformPixels(0));
    const adj = suggestAdjustments(black);
    expect(adj.exposure).toBeLessThanOrEqual(100);
    expect(adj.exposure).toBeGreaterThanOrEqual(-100);
    expect(adj.shadows).toBeLessThanOrEqual(100);
    expect(adj.shadows).toBeGreaterThanOrEqual(-100);
  });

  it('leaves a well-balanced image close to neutral', () => {
    const balanced = buildHistogram(uniformPixels(128));
    const adj = suggestAdjustments(balanced);
    expect(Math.abs(adj.exposure)).toBeLessThan(5);
  });
});
