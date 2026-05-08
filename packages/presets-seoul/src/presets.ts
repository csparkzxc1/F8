// F8 Seoul preset catalog v1 (12 presets).
// Each Preset's defaults match the Filter Catalog spec — UI sliders,
// the FilteredImage shader chain, and the autoAdjust suggester all read
// from these AdjustmentValues.
//
// LUT and thumbnail assets are intentionally left undefined: the .cube →
// 512×512 PNG conversion (tools/cube-to-png.py) lands per preset and
// gets wired in here as `lutAsset: require('./luts/<id>.png')`. Until
// then the FilteredImage skip-pass logic gracefully drops the LUT pass
// and only the AdjustmentValues take effect.
import type { Preset, PresetPack, AdjustmentValues } from '@f8/core';

const adj = (overrides: Partial<AdjustmentValues> = {}): AdjustmentValues => ({
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
  ...overrides,
});

// ────────────────────────────────────────────────────────────────────────
// Free 6 — bundled with every F8 Seoul install.
// ────────────────────────────────────────────────────────────────────────

const noeul: Preset = {
  id: 'noeul',
  name: '노을',
  bodyId: 'contax-t2',
  filmId: 'cinestill-800t',
  isPremium: false,
  defaults: adj({
    intensity: 85,
    shadows: 10,
    highlights: -15,
    temperature: 25,
    tint: 5,
    grain: 45,
    vignette: 35,
    lightLeak: 20,
    halation: 70,
  }),
};

const daybreak: Preset = {
  id: 'daybreak',
  name: '새벽',
  bodyId: 'olympus-mju',
  filmId: 'fuji-pro400h',
  isPremium: false,
  defaults: adj({
    intensity: 80,
    exposure: 5,
    pushPull: -50,
    shadows: 15,
    highlights: -10,
    temperature: -25,
    tint: -5,
    grain: 30,
    vignette: 20,
  }),
};

const firstSnow: Preset = {
  id: 'first_snow',
  name: '첫눈',
  bodyId: 'leica-m6',
  filmId: 'kodak-portra160',
  isPremium: false,
  defaults: adj({
    intensity: 75,
    exposure: 10,
    shadows: 5,
    highlights: 5,
    temperature: -15,
    grain: 20,
    vignette: 15,
  }),
};

const childhood: Preset = {
  id: 'childhood',
  name: '유년',
  bodyId: 'olympus-mju',
  filmId: 'fuji-superia200-expired',
  isPremium: false,
  defaults: adj({
    intensity: 90,
    exposure: -5,
    pushPull: -50,
    shadows: -10,
    highlights: -20,
    temperature: 15,
    tint: 15,
    grain: 60,
    vignette: 50,
    lightLeak: 30,
  }),
};

const summerNight: Preset = {
  id: 'summer_night',
  name: '여름밤',
  bodyId: 'yashica-t4',
  filmId: 'kodak-gold200',
  isPremium: false,
  defaults: adj({
    intensity: 88,
    pushPull: 100,
    shadows: -5,
    highlights: -10,
    temperature: 15,
    grain: 60,
    vignette: 25,
    lightLeak: 25,
    halation: 30,
  }),
};

const holiday: Preset = {
  id: 'holiday',
  name: '휴일',
  bodyId: 'contax-t2',
  filmId: 'kodak-portra400',
  isPremium: false,
  defaults: adj({
    intensity: 75,
    shadows: 5,
    highlights: -5,
    temperature: 10,
    grain: 35,
    vignette: 20,
  }),
};

// ────────────────────────────────────────────────────────────────────────
// Vintage Korea pack (₩3,900) — 6 premium presets.
// ────────────────────────────────────────────────────────────────────────

const rainyDays: Preset = {
  id: 'rainy_days',
  name: '우기',
  bodyId: 'pentax-k1000',
  filmId: 'kodak-ektar100',
  isPremium: true,
  defaults: adj({
    intensity: 85,
    exposure: -5,
    shadows: -10,
    highlights: -5,
    temperature: -20,
    tint: -10,
    grain: 15,
    vignette: 25,
  }),
};

const caffeine: Preset = {
  id: 'caffeine',
  name: '카페인',
  bodyId: 'mamiya-645',
  filmId: 'cinestill-50d',
  isPremium: true,
  defaults: adj({
    intensity: 80,
    exposure: 5,
    shadows: 15,
    highlights: -10,
    temperature: 20,
    tint: 5,
    grain: 25,
    vignette: 30,
    lightLeak: 10,
    halation: 35,
  }),
};

const stranger: Preset = {
  id: 'stranger',
  name: '이방인',
  bodyId: 'arri-alexa',
  filmId: 'kodak-vision3-250d',
  isPremium: true,
  defaults: adj({
    intensity: 80,
    pushPull: 50,
    shadows: -15,
    highlights: -10,
    grain: 40,
    vignette: 40,
  }),
};

const softSpring: Preset = {
  id: 'soft_spring',
  name: '봄날',
  bodyId: 'hasselblad-500cm',
  filmId: 'fuji-pro400h',
  isPremium: true,
  defaults: adj({
    intensity: 80,
    exposure: 10,
    pushPull: -120,
    shadows: 25,
    highlights: -25,
    temperature: 5,
    tint: 8,
    grain: 25,
    vignette: 15,
    lightLeak: 15,
    halation: 20,
  }),
};

const stillness: Preset = {
  id: 'stillness',
  name: '고요',
  bodyId: 'leica-m6',
  filmId: 'kodak-trix400',
  isPremium: true,
  defaults: adj({
    intensity: 100,
    shadows: 10,
    highlights: -10,
    grain: 50,
    vignette: 25,
  }),
};

const camellia: Preset = {
  id: 'camellia',
  name: '동백',
  bodyId: 'contax-t2',
  filmId: 'kodak-portra400',
  isPremium: true,
  defaults: adj({
    intensity: 85,
    pushPull: 50,
    shadows: -15,
    highlights: -10,
    temperature: 10,
    grain: 35,
    vignette: 35,
  }),
};

export const seoulPresets: Preset[] = [
  noeul,
  daybreak,
  firstSnow,
  childhood,
  summerNight,
  holiday,
];

export const seoulPremiumPacks: PresetPack[] = [
  {
    id: 'vintage_korea',
    name: 'Vintage Korea',
    description: '서울의 90년대부터 지금까지. 6종.',
    priceLabel: '₩3,900',
    presets: [rainyDays, caffeine, stranger, softSpring, stillness, camellia],
  },
];
