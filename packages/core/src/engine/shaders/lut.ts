// LUT shader. 512x512 strip = 8x8 grid of 64-wide slices over the blue axis.
// Trilinear: bilinear inside the slice (free via sampler) + manual lerp across blue.
export const LUT_SHADER = `
uniform shader image;
uniform shader lut;
uniform float intensity;

const float TILE = 64.0;
const float GRID = 8.0;
const float LUT_SIZE = 512.0;

half4 main(float2 xy) {
  half4 src = image.eval(xy);
  vec3 c = clamp(vec3(src.rgb), 0.0, 1.0);

  float blue = c.b * (TILE - 1.0);
  float bLow = floor(blue);
  float bHigh = min(bLow + 1.0, TILE - 1.0);
  float t = blue - bLow;

  float2 lowCell = float2(mod(bLow, GRID), floor(bLow / GRID));
  float2 highCell = float2(mod(bHigh, GRID), floor(bHigh / GRID));

  float2 inner = vec2(c.r, c.g) * (TILE - 1.0) + 0.5;

  float2 lowUV = (lowCell * TILE + inner);
  float2 highUV = (highCell * TILE + inner);

  half4 lowColor = lut.eval(lowUV);
  half4 highColor = lut.eval(highUV);
  half4 graded = mix(lowColor, highColor, t);

  vec3 outRgb = mix(c, vec3(graded.rgb), intensity);
  return half4(outRgb, src.a);
}
`;
