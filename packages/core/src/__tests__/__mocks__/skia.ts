// Skia stub. Tests don't render — they just import types and helper functions.
export const Skia = {
  RuntimeEffect: { Make: () => ({}) },
  Surface: { MakeOffscreen: () => null },
  Paint: () => ({}),
};
export const Canvas = 'Canvas';
export const Fill = 'Fill';
export const Shader = 'Shader';
export const ImageShader = 'ImageShader';
export const Image = 'Image';
export const useImage = () => null;
export const useCanvasRef = () => ({ current: null });
export type SkImage = { width(): number; height(): number; encodeToBase64(): string };
export type SkRuntimeEffect = unknown;
