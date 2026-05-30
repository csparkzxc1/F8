// Camera-body optical softness: a light gaussian blur that simulates a lens's
// rendering character. Driven by the body's `softness` field via a sigma in
// pixels (see softnessToSigma in applyFilter). Kept deliberately subtle —
// sigma tops out around 1px — so it reads as "creamy", not out of focus.
//
// Single-pass 3×3 gaussian. Because the sample offsets scale with sigma, the
// gaussian weights at those offsets are constant (independent of sigma):
//   center  d=0          → exp(0)    = 1.0
//   edge    d=sigma      → exp(-0.5) ≈ 0.6065
//   corner  d=sigma·√2   → exp(-1.0) ≈ 0.3679
// so we hardcode them and only feed the offset in.
export const BODY_SHADER = `
uniform shader image;
uniform float sigma;
uniform float2 resolution;

half4 main(float2 xy) {
  float s = sigma;
  if (s < 0.01) {
    return image.eval(xy);
  }

  const float wc = 1.0;
  const float we = 0.6065;
  const float wd = 0.3679;

  half4 c = image.eval(xy) * wc;
  c += (image.eval(xy + float2(s, 0.0)) + image.eval(xy - float2(s, 0.0))
      + image.eval(xy + float2(0.0, s)) + image.eval(xy - float2(0.0, s))) * we;
  c += (image.eval(xy + float2(s, s)) + image.eval(xy - float2(s, s))
      + image.eval(xy + float2(s, -s)) + image.eval(xy - float2(s, -s))) * wd;

  float total = wc + 4.0 * we + 4.0 * wd;
  return c / total;
}
`;
