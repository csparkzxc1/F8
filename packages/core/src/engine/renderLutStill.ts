// Offscreen LUT grade for the live-camera WYSIWYG capture path. When the live
// frame processor is on (ENABLE_LIVE_LUT), the user frames through a LUT-graded
// feed; on shutter we re-apply the *same* LUT at full intensity to the captured
// still so the saved file matches exactly what they saw. LUT-only by design —
// the live preview exposes no adjustment sliders, so neither does the capture.
import { Skia, TileMode, FilterMode, MipmapMode, type SkImage } from '@shopify/react-native-skia';
import { getLutEffect } from './shaders';

const shaderOpts = [TileMode.Clamp, TileMode.Clamp, FilterMode.Linear, MipmapMode.None] as const;

// Returns a new SkImage of `image` with `lut` applied at `intensity` (0..1).
// With no LUT, returns a straight copy. Returns null if an offscreen surface
// can't be allocated. The input image is never mutated.
export function renderLutStill(image: SkImage, lut: SkImage | null, intensity = 1): SkImage | null {
  const width = image.width();
  const height = image.height();
  const surface = Skia.Surface.MakeOffscreen(width, height);
  if (!surface) return null;

  const canvas = surface.getCanvas();
  const imageShader = image.makeShaderOptions(...shaderOpts);
  const paint = Skia.Paint();

  if (lut) {
    // Matches FilteredImage's LUT pass: child 0 = source pixels, child 1 = the
    // 512×512 LUT strip sampled in its own pixel space.
    const lutShader = lut.makeShaderOptions(...shaderOpts);
    const shader = getLutEffect().makeShaderWithChildren([intensity], [imageShader, lutShader]);
    paint.setShader(shader);
  } else {
    paint.setShader(imageShader);
  }

  canvas.drawRect(Skia.XYWHRect(0, 0, width, height), paint);
  surface.flush();
  return surface.makeImageSnapshot();
}
