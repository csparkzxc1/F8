import { buildUniforms } from '../engine/applyFilter';
import { defaultAdjustments } from '../store/editorStore';

describe('buildUniforms', () => {
  const res: [number, number] = [800, 800];

  it('normalizes 0..100 sliders to 0..1 shader space', () => {
    const u = buildUniforms({ ...defaultAdjustments, intensity: 50, exposure: 25 }, res);
    expect(u.lut.intensity).toBe(0.5);
    expect(u.adjustments.exposure).toBe(0.25);
  });

  it('normalizes pushPull -200..200 to -1..1', () => {
    expect(buildUniforms({ ...defaultAdjustments, pushPull: 200 }, res).adjustments.pushPull).toBe(1);
    expect(buildUniforms({ ...defaultAdjustments, pushPull: -200 }, res).adjustments.pushPull).toBe(-1);
    expect(buildUniforms({ ...defaultAdjustments, pushPull: 0 }, res).adjustments.pushPull).toBe(0);
  });

  it('boosts grain when push/pull is positive', () => {
    const baseline = buildUniforms({ ...defaultAdjustments, grain: 0, pushPull: 0 }, res);
    const pushed = buildUniforms({ ...defaultAdjustments, grain: 0, pushPull: 200 }, res);
    expect(pushed.grain.amount).toBeGreaterThan(baseline.grain.amount);
  });

  it('does not boost grain when push/pull is negative (pulled = cleaner)', () => {
    const pulled = buildUniforms({ ...defaultAdjustments, grain: 0, pushPull: -200 }, res);
    expect(pulled.grain.amount).toBe(0);
  });

  it('caps grain amount at 1', () => {
    const u = buildUniforms({ ...defaultAdjustments, grain: 100, pushPull: 200 }, res);
    expect(u.grain.amount).toBeLessThanOrEqual(1);
  });

  it('forwards resolution to grain and lightleak uniforms', () => {
    const u = buildUniforms(defaultAdjustments, [1200, 800]);
    expect(u.grain.resolution).toEqual([1200, 800]);
    expect(u.lightleak.resolution).toEqual([1200, 800]);
  });

  it('passes through seed unchanged', () => {
    const u = buildUniforms(defaultAdjustments, res, 42);
    expect(u.grain.seed).toBe(42);
  });
});
