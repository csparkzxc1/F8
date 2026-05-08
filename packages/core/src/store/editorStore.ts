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
  setPhoto: (uri: string | null) => void;
  setPreset: (preset: Preset | null) => void;
  setAdjustment: <K extends keyof AdjustmentValues>(key: K, value: AdjustmentValues[K]) => void;
  reset: () => void;
};

export const useEditorStore = create<EditorState>((set) => ({
  photoUri: null,
  activePreset: null,
  adjustments: defaultAdjustments,
  setPhoto: (uri) => set({ photoUri: uri }),
  // Selecting a preset replaces the adjustment slate with its defaults so the
  // user sees the intended look immediately. They can still fine-tune from
  // there — the next setAdjustment call simply mutates the merged state.
  setPreset: (preset) =>
    set({
      activePreset: preset,
      adjustments: preset ? { ...preset.defaults } : { ...defaultAdjustments },
    }),
  setAdjustment: (key, value) =>
    set((state) => ({ adjustments: { ...state.adjustments, [key]: value } })),
  reset: () =>
    set({ photoUri: null, activePreset: null, adjustments: defaultAdjustments }),
}));
