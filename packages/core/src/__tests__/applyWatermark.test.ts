import {
  luminance,
  averageLuminance,
  pickWatermarkInk,
  watermarkMetrics,
  cityWordmark,
  hexLuminance,
  inkOn,
} from '../utils/applyWatermark';

describe('luminance', () => {
  it('weights green most, blue least (Rec. 601)', () => {
    expect(luminance(0, 255, 0)).toBeGreaterThan(luminance(255, 0, 0));
    expect(luminance(255, 0, 0)).toBeGreaterThan(luminance(0, 0, 255));
  });

  it('maps pure black to 0 and pure white to 255', () => {
    expect(luminance(0, 0, 0)).toBe(0);
    expect(luminance(255, 255, 255)).toBeCloseTo(255);
  });
});

describe('averageLuminance', () => {
  it('averages an interleaved RGBA buffer ignoring alpha', () => {
    // two white pixels, alpha varying — luma should be ~255
    const px = [255, 255, 255, 0, 255, 255, 255, 255];
    expect(averageLuminance(px)).toBeCloseTo(255);
  });

  it('handles a mixed bright/dark buffer', () => {
    const px = [255, 255, 255, 255, 0, 0, 0, 255];
    expect(averageLuminance(px)).toBeCloseTo(127.5);
  });

  it('supports 3-channel RGB buffers', () => {
    const px = [0, 0, 0, 255, 255, 255];
    expect(averageLuminance(px, 3)).toBeCloseTo(127.5);
  });

  it('returns 0 for an empty buffer', () => {
    expect(averageLuminance([])).toBe(0);
  });
});

describe('pickWatermarkInk', () => {
  it('uses dark ink on a bright corner', () => {
    expect(pickWatermarkInk(200)).toEqual({ color: '#000000', opacity: 0.7 });
  });

  it('uses light ink on a dark corner', () => {
    expect(pickWatermarkInk(50)).toEqual({ color: '#FFFFFF', opacity: 0.75 });
  });

  it('treats the 128 threshold as dark (light ink)', () => {
    expect(pickWatermarkInk(128).color).toBe('#FFFFFF');
    expect(pickWatermarkInk(129).color).toBe('#000000');
  });
});

describe('watermarkMetrics', () => {
  it('scales padding and type off the photo width', () => {
    const m = watermarkMetrics(1000);
    expect(m.pad).toBeCloseTo(35);
    expect(m.f8Size).toBeCloseTo(45);
    expect(m.citySize).toBeCloseTo(22.5);
    expect(m.cityLetterSpacing).toBe(2);
  });

  it('keeps the city wordmark half the size of "F8"', () => {
    const m = watermarkMetrics(2048);
    expect(m.citySize).toBeCloseTo(m.f8Size * 0.5);
  });

  it('samples a non-degenerate corner region', () => {
    expect(watermarkMetrics(1000).sampleSize).toBeGreaterThan(1);
    expect(watermarkMetrics(4).sampleSize).toBeGreaterThanOrEqual(1);
  });
});

describe('hexLuminance', () => {
  it('parses #RRGGBB', () => {
    expect(hexLuminance('#000000')).toBe(0);
    expect(hexLuminance('#FFFFFF')).toBeCloseTo(255);
  });

  it('parses shorthand #RGB', () => {
    expect(hexLuminance('#fff')).toBeCloseTo(255);
    expect(hexLuminance('#000')).toBe(0);
  });

  it('tolerates a missing leading hash', () => {
    expect(hexLuminance('FFFFFF')).toBeCloseTo(255);
  });

  it('returns 0 for unparseable input', () => {
    expect(hexLuminance('nope')).toBe(0);
    expect(hexLuminance('#12')).toBe(0);
  });
});

describe('inkOn', () => {
  it('returns black on bright backgrounds', () => {
    expect(inkOn('#E8C39E')).toBe('#000000'); // 휴일
    expect(inkOn('#E8E8EC')).toBe('#000000'); // 첫눈
  });

  it('returns white on dark backgrounds', () => {
    expect(inkOn('#4A3F5C')).toBe('#FFFFFF'); // 여름밤
    expect(inkOn('#6B6B6B')).toBe('#FFFFFF'); // 고요
  });
});

describe('cityWordmark', () => {
  it('uppercases the variant city', () => {
    expect(cityWordmark('Seoul')).toBe('SEOUL');
    expect(cityWordmark('Tokyo')).toBe('TOKYO');
  });

  it('trims stray whitespace', () => {
    expect(cityWordmark('  seoul  ')).toBe('SEOUL');
  });

  it('collapses an all-whitespace city to empty', () => {
    expect(cityWordmark('   ')).toBe('');
  });
});
