// Procedural film grain. Frequency follows pushPull — pushed film is grainier.
export const GRAIN_SHADER = `
uniform shader image;
uniform float amount;
uniform float seed;
uniform float2 resolution;

float hash21(float2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

half4 main(float2 xy) {
  half4 src = image.eval(xy);
  float2 cell = floor(xy * 1.5) + seed;
  float n = hash21(cell) - 0.5;

  // Grain riding luminance — more visible in mids, less in highlights/shadows.
  float lum = dot(vec3(src.rgb), vec3(0.2126, 0.7152, 0.0722));
  float weight = 4.0 * lum * (1.0 - lum);

  vec3 grained = vec3(src.rgb) + n * amount * 0.18 * weight;
  return half4(clamp(grained, 0.0, 1.0), src.a);
}
`;
