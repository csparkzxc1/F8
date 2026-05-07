// Diagonal warm leak from upper-right corner. Vignette dialed in via same pass.
export const LIGHTLEAK_SHADER = `
uniform shader image;
uniform float leakAmount;
uniform float vignetteAmount;
uniform float halation;
uniform float2 resolution;

half4 main(float2 xy) {
  half4 src = image.eval(xy);
  float2 uv = xy / resolution;
  vec3 c = vec3(src.rgb);

  // Warm light leak: smooth band along (uv.x + uv.y).
  float band = smoothstep(0.85, 1.6, uv.x + uv.y);
  vec3 leakColor = vec3(1.0, 0.55, 0.25);
  c = mix(c, c + leakColor * 0.6, band * leakAmount);

  // Halation: red glow around bright areas (cheap approximation).
  float lum = dot(c, vec3(0.2126, 0.7152, 0.0722));
  float bright = smoothstep(0.75, 1.0, lum);
  c.r += bright * halation * 0.18;

  // Vignette: radial darken from center.
  float2 d = uv - 0.5;
  float r = dot(d, d);
  float vig = smoothstep(0.15, 0.55, r) * vignetteAmount;
  c *= (1.0 - vig * 0.55);

  c = clamp(c, 0.0, 1.0);
  return half4(c, src.a);
}
`;
