// Exposure / push-pull / shadows / highlights / temperature / tint.
// All inputs are normalized to [-1, 1] by the JS uniforms helper.
export const ADJUSTMENTS_SHADER = `
uniform shader image;
uniform float exposure;
uniform float pushPull;
uniform float shadows;
uniform float highlights;
uniform float temperature;
uniform float tint;

half4 main(float2 xy) {
  half4 src = image.eval(xy);
  vec3 c = vec3(src.rgb);

  // Stops: exposure ±1 stop, pushPull ±2 stop.
  float stops = exposure + pushPull * 2.0;
  c *= pow(2.0, stops);

  // Temperature: warm shifts R up / B down. Tint: green vs magenta.
  c.r += temperature * 0.10;
  c.b -= temperature * 0.10;
  c.g += tint * 0.06;
  c.r -= tint * 0.03;
  c.b -= tint * 0.03;

  // Luminance-aware shadow & highlight lift.
  float lum = dot(c, vec3(0.2126, 0.7152, 0.0722));
  float shadowMask = smoothstep(0.55, 0.0, lum);
  float highlightMask = smoothstep(0.45, 1.0, lum);
  c += shadowMask * shadows * 0.35;
  c += highlightMask * highlights * 0.35;

  // Push/pull adds extra contrast around mid-grey.
  c = ((c - 0.5) * (1.0 + pushPull * 0.25)) + 0.5;

  c = clamp(c, 0.0, 1.0);
  return half4(c, src.a);
}
`;
