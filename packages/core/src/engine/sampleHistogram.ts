// Compute a 256-bin luminance histogram from an SkImage by drawing it
// scaled-down into a 64×64 offscreen surface, reading those 4096 RGBA
// pixels, and converting to luma. Cheap enough to run on every shutter.
import { Skia, type SkImage } from '@shopify/react-native-skia';
import { buildHistogram, type Histogram } from './autoAdjust';

const SAMPLE = 64;

export function sampleHistogram(source: SkImage): Histogram | null {
  const surface = Skia.Surface.MakeOffscreen(SAMPLE, SAMPLE);
  if (!surface) return null;

  const canvas = surface.getCanvas();
  const paint = Skia.Paint();
  canvas.drawImageRect(
    source,
    { x: 0, y: 0, width: source.width(), height: source.height() },
    { x: 0, y: 0, width: SAMPLE, height: SAMPLE },
    paint,
  );
  surface.flush();

  const snapshot = surface.makeImageSnapshot();
  const pixels = snapshot.readPixels();
  if (!pixels) return null;

  const luma = new Uint8Array(SAMPLE * SAMPLE);
  for (let i = 0; i < luma.length; i++) {
    const r = pixels[i * 4] ?? 0;
    const g = pixels[i * 4 + 1] ?? 0;
    const b = pixels[i * 4 + 2] ?? 0;
    luma[i] = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
  }

  return buildHistogram(luma);
}
