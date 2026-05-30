// Composite an "F8 · CITY" wordmark into the bottom-right of a rendered photo,
// just before save/share. The ink colour is chosen automatically from the
// brightness of the corner it lands on so it stays legible on both bright and
// dark frames. City text is driven by the variant (`variant.cityName`) so the
// Tokyo build reads "F8 · TOKYO" with no extra wiring.
//
// The Skia compositing (`applyWatermark`) needs a native Skia context and is
// exercised on-device. The layout / colour / luminance maths is split into
// pure helpers below so it can be unit-tested on plain Node.
import {
  Skia,
  FontWeight,
  PaintStyle,
  type SkImage,
  type SkCanvas,
  type SkFont,
  type SkFontMgr,
  type SkTypeface,
} from '@shopify/react-native-skia';

// TEMP debug switch. When on, applyWatermark logs each stage to the Metro
// console and stamps a red 50×50 probe square at the top-left of the export so
// we can tell "surface/snapshot works but text doesn't" from "nothing renders".
// Flip to false once the watermark is confirmed on-device.
export const WATERMARK_DEBUG = true;

export type WatermarkOptions = {
  // The city/theme word shown after "F8 ·". Comes from variant.cityName.
  cityName: string;
  // Optional override of the family Skia looks up for the wordmark. Falls back
  // to a system face (Helvetica/Arial) and finally the platform default.
  fontFamily?: string;
};

// --- pure helpers (unit-tested) -------------------------------------------

// Rec. 601 luma. Inputs and output are 0..255.
export function luminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

// Average luminance of an interleaved RGBA byte buffer (channels default 4).
// Tolerates RGB (channels = 3) buffers too. Returns 0 for an empty buffer.
export function averageLuminance(pixels: ArrayLike<number>, channels = 4): number {
  if (pixels.length < channels) return 0;
  let sum = 0;
  let count = 0;
  for (let i = 0; i + channels - 1 < pixels.length; i += channels) {
    sum += luminance(pixels[i] ?? 0, pixels[i + 1] ?? 0, pixels[i + 2] ?? 0);
    count += 1;
  }
  return count === 0 ? 0 : sum / count;
}

export type WatermarkInk = { color: string; opacity: number };

// Bright corner (luma > 128) → dark ink; dark corner → light ink.
export function pickWatermarkInk(avgLuminance: number): WatermarkInk {
  return avgLuminance > 128
    ? { color: '#000000', opacity: 0.7 }
    : { color: '#FFFFFF', opacity: 0.75 };
}

export type WatermarkMetrics = {
  pad: number;
  f8Size: number;
  citySize: number;
  cityLetterSpacing: number;
  // Side of the square sampled in the bottom-right corner to measure brightness.
  sampleSize: number;
};

// All dimensions scale off the photo width so the mark reads the same on a
// 1080px export and a 4096px one.
export function watermarkMetrics(width: number): WatermarkMetrics {
  const f8Size = width * 0.045;
  return {
    pad: width * 0.035,
    f8Size,
    citySize: f8Size * 0.5,
    cityLetterSpacing: 2,
    sampleSize: Math.max(1, Math.round(width * 0.22)),
  };
}

// "Seoul" → "SEOUL", trimming stray whitespace. Empty/whitespace city yields "".
export function cityWordmark(cityName: string): string {
  return cityName.trim().toUpperCase();
}

// Luminance (0..255) of a #RGB or #RRGGBB colour string. Returns 0 for anything
// unparseable, so callers safely treat junk as "dark".
export function hexLuminance(hex: string): number {
  let h = hex.trim().replace(/^#/, '');
  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (h.length !== 6 || /[^0-9a-fA-F]/.test(h)) return 0;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return luminance(r, g, b);
}

// Black ink on a bright background, white on a dark one — same 128 split the
// watermark uses. Used by the camera carousel's F8 placeholder tiles.
export function inkOn(hexBackground: string): '#000000' | '#FFFFFF' {
  return hexLuminance(hexBackground) > 128 ? '#000000' : '#FFFFFF';
}

// --- Skia compositing (device path) ---------------------------------------

const log = (...args: unknown[]) => {
  if (WATERMARK_DEBUG) console.log('[F8][watermark]', ...args);
};

// iOS/Android both lack "Inter", so the requested family usually misses and
// matchFamilyStyle hands back a face with no glyphs — drawText then silently
// renders nothing. We walk a fallback chain and *verify glyph coverage* (a
// missing glyph resolves to id 0) before trusting a face; null → use Skia's
// built-in default, which always renders.
function resolveFace(
  fontMgr: SkFontMgr,
  families: string[],
  weight: FontWeight,
): SkTypeface | null {
  for (const family of families) {
    const face = fontMgr.matchFamilyStyle(family, { weight });
    if (!face) continue;
    const probe = Skia.Font(face, 12);
    const ids = probe.getGlyphIDs('F8');
    if (ids && ids.length > 0 && ids.some((id) => id !== 0)) {
      log('font: using', family, 'weight', weight);
      return face;
    }
  }
  log('font: no family in chain had glyph coverage — falling back to default');
  return null;
}

// Draw `text` left-aligned at baseline (x, y), advancing per glyph so we can
// inject the letter-spacing SkFont doesn't apply itself.
function drawSpacedText(
  canvas: SkCanvas,
  text: string,
  x: number,
  y: number,
  font: SkFont,
  paints: ReturnType<typeof Skia.Paint>[],
  letterSpacing: number,
): void {
  let cursor = x;
  for (const ch of text) {
    for (const paint of paints) canvas.drawText(ch, cursor, y, paint, font);
    cursor += font.getTextWidth(ch) + letterSpacing;
  }
}

// Render `image` with the "F8 · CITY" wordmark burned into the bottom-right
// corner. Returns a fresh SkImage; the input is left untouched. Returns the
// input unchanged only if an offscreen surface can't be created.
//
// EMERGENCY STYLE: the ink is forced to opaque white with a black outline for
// guaranteed legibility on any background. The auto light/dark decision is
// still computed and logged, but deferred to a later pass (see pickWatermarkInk).
export function applyWatermark(image: SkImage, options: WatermarkOptions): SkImage {
  const width = image.width();
  const height = image.height();
  log('input image', width, 'x', height, 'city=', JSON.stringify(options.cityName));

  const surface = Skia.Surface.MakeOffscreen(width, height);
  if (!surface) {
    log('Surface.MakeOffscreen returned NULL — returning original (no watermark)');
    return image;
  }
  log('surface created OK');
  const canvas = surface.getCanvas();

  // 1. Base photo. drawImage is the most direct path (no shader coordinate
  //    surprises).
  canvas.drawImage(image, 0, 0);

  // 1b. DEBUG probe: a red square top-left. If this shows up in the saved PNG,
  //     the surface + snapshot + save pipeline all work and any missing mark is
  //     a text/font problem. If it doesn't, the problem is upstream.
  if (WATERMARK_DEBUG) {
    const probe = Skia.Paint();
    probe.setColor(Skia.Color('#FF0000'));
    canvas.drawRect(Skia.XYWHRect(20, 20, 50, 50), probe);
    log('debug probe square drawn at (20,20,50,50)');
  }

  // City word; if the variant didn't supply one, we still stamp "F8" alone.
  const city = cityWordmark(options.cityName);
  if (city.length === 0) log('cityName empty/blank — stamping "F8" alone');
  const m = watermarkMetrics(width);

  // 2. Measure corner brightness — logged for the deferred auto-colour pass.
  const sx = Math.max(0, width - m.sampleSize);
  const sy = Math.max(0, height - m.sampleSize);
  const corner = image.readPixels(sx, sy);
  const avg = corner ? averageLuminance(corner) : 0;
  log(
    'corner readPixels',
    corner ? `${corner.length} bytes` : 'NULL',
    'avgLuma=',
    avg.toFixed(1),
    'auto-would-pick=',
    pickWatermarkInk(avg).color,
  );

  // 3. Fonts with a verified fallback chain.
  const fontMgr = Skia.FontMgr.System();
  const chain = [options.fontFamily ?? 'Inter', 'Helvetica Neue', 'Helvetica', 'Arial'];
  const heavyFace = resolveFace(fontMgr, chain, FontWeight.Black);
  const regularFace = resolveFace(fontMgr, chain, FontWeight.Medium);
  // Skia.Font(undefined, size) → platform default face, which always renders.
  const f8Font = Skia.Font(heavyFace ?? undefined, m.f8Size);
  const cityFont = Skia.Font(regularFace ?? undefined, m.citySize);

  // 4. Measure the run so we can right-align it.
  const f8W = f8Font.getTextWidth('F8');
  const gap = m.f8Size * 0.32;
  const dotW = f8Font.getTextWidth('·');
  const cityW =
    city.length > 0
      ? [...city].reduce((w, ch) => w + cityFont.getTextWidth(ch) + m.cityLetterSpacing, 0) -
        m.cityLetterSpacing
      : 0;
  const cityBlock = city.length > 0 ? gap + dotW + gap + cityW : 0;
  const totalW = f8W + cityBlock;
  log('measured f8W=', f8W.toFixed(1), 'cityW=', cityW.toFixed(1), 'totalW=', totalW.toFixed(1));

  const startX = width - m.pad - totalW;
  const baseline = height - m.pad;
  log('startX=', startX.toFixed(1), 'baseline=', baseline.toFixed(1));

  // 5. Forced-visible ink: opaque white fill + black outline (drawn outline
  //    first so the fill sits on top).
  const fill = Skia.Paint();
  fill.setAntiAlias(true);
  fill.setStyle(PaintStyle.Fill);
  fill.setColor(Skia.Color('#FFFFFF'));

  const outline = Skia.Paint();
  outline.setAntiAlias(true);
  outline.setStyle(PaintStyle.Stroke);
  outline.setStrokeWidth(Math.max(1.5, m.f8Size * 0.07));
  outline.setColor(Skia.Color('#000000'));
  outline.setAlphaf(0.85);

  // Order matters: outline underneath, fill on top.
  const layered = [outline, fill];

  let cursor = startX;
  for (const paint of layered) canvas.drawText('F8', cursor, baseline, paint, f8Font);
  cursor += f8W;
  if (city.length > 0) {
    cursor += gap;
    for (const paint of layered) {
      canvas.drawText('·', cursor, baseline - m.f8Size * 0.05, paint, f8Font);
    }
    cursor += dotW + gap;
    drawSpacedText(canvas, city, cursor, baseline, cityFont, layered, m.cityLetterSpacing);
  }

  surface.flush();
  const out = surface.makeImageSnapshot();
  log('makeImageSnapshot →', out ? `${out.width()}x${out.height()} OK` : 'NULL');
  return out;
}
