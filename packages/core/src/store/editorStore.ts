// Editor state. zustand store skeleton; mutations land in Phase 2/3.
import { create } from 'zustand';
import type { AdjustmentValues, Preset } from '../variant/types';

export const defaultAdjustments: AdjustmentValues = {
  intensity: 100,
  exposure: 0,
  pushPull: 0,
  shadows: 0,
  highlights: 0,
  temperature: 0,
  tint: 0,
  grain: 0,
  vignette: 0,
  lightLeak: 0,
  halation: 0,
};

export type EditorState = {
  photoUri: string | null;
  activePreset: Preset | null;
  adjustments: AdjustmentValues;
  // Currently selected camera body id. null means "fall back to the variant's
  // first free body". Selecting a preset resets this to the preset's
  // recommended bodyId; the user can then override it from the [body] tab.
  // Resolving the id (and its effects) against variant.bodies happens in the
  // editor — the store stays variant-agnostic.
  currentBodyId: string | null;
  setPhoto: (uri: string | null) => void;
  setPreset: (preset: Preset | null) => void;
  setCurrentBodyId: (id: string) => void;
  setAdjustment: <K extends keyof AdjustmentValues>(key: K, value: AdjustmentValues[K]) => void;
  // Apply many adjustment fields in one shot — single store update, single
  // canvas re-render. Fields not in `partial` keep their current values.
  mergeAdjustments: (partial: Partial<AdjustmentValues>) => void;
  reset: () => void;
};

export const useEditorStore = create<EditorState>((set) => ({
  photoUri: null,
  activePreset: null,
  adjustments: defaultAdjustments,
  currentBodyId: null,
  setPhoto: (uri) => set({ photoUri: uri }),
  // Selecting a preset replaces the adjustment slate with its defaults so the
  // user sees the intended look immediately. They can still fine-tune from
  // there — the next setAdjustment call simply mutates the merged state.
  // The body follows suit: it snaps to the preset's recommended bodyId (or
  // back to the default when the preset is cleared), discarding any prior
  // manual override.
  setPreset: (preset) =>
    set({
      activePreset: preset,
      adjustments: preset ? { ...preset.defaults } : { ...defaultAdjustments },
      currentBodyId: preset ? preset.bodyId : null,
    }),
  setCurrentBodyId: (id) => set({ currentBodyId: id }),
  setAdjustment: (key, value) =>
    set((state) => ({ adjustments: { ...state.adjustments, [key]: value } })),
  mergeAdjustments: (partial) =>
    set((state) => ({ adjustments: { ...state.adjustments, ...partial } })),
  reset: () =>
    set({
      photoUri: null,
      activePreset: null,
      adjustments: defaultAdjustments,
      currentBodyId: null,
    }),
}));
