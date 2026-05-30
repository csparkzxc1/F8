// Skia stub. Tests don't render — they just import types and helper functions.
export const Skia = {
  RuntimeEffect: { Make: () => ({}) },
  Surface: { MakeOffscreen: () => null },
  Paint: () => ({}),
  Color: (c: string) => c,
  XYWHRect: () => ({}),
  Font: () => ({}),
  FontMgr: { System: () => ({ matchFamilyStyle: () => ({}) }) },
};

// Enum stand-ins so modules that reference them at load time (e.g. the
// watermark / frame-processor shader options) import cleanly under Node.
export enum TileMode {
  Clamp = 0,
  Repeat = 1,
  Mirror = 2,
  Decal = 3,
}
export enum FilterMode {
  Nearest = 0,
  Linear = 1,
}
export enum MipmapMode {
  None = 0,
  Nearest = 1,
  Linear = 2,
}
export enum FontWeight {
  Normal = 400,
  Medium = 500,
  Black = 900,
}
export type SkCanvas = unknown;
export type SkFont = unknown;
export type SkShader = unknown;
export type SkSurface = unknown;
export type SkPaint = unknown;
export const Canvas = 'Canvas';
export const Fill = 'Fill';
export const Shader = 'Shader';
export const ImageShader = 'ImageShader';
export const Image = 'Image';
export const useImage = () => null;
export const useCanvasRef = () => ({ current: null });
export type SkImage = { width(): number; height(): number; encodeToBase64(): string };
export type SkRuntimeEffect = unknown;
