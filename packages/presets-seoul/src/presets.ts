// F8 Seoul premium pack (Vintage Korea, 6 presets).
//
// Each `defaults` block is the source of truth for the slider state when the
// preset is selected. UI sliders, the FilteredImage shader chain, and the
// autoAdjust suggester all read from these AdjustmentValues.
//
// LUT assets are 512×512 strip PNGs (8×8 grid of 64-wide blue slices). The
// current PNGs are dummy tinted-identity LUTs; replace with real film LUTs
// before launch — see TODO comments per preset.
import type { Preset, PresetPack, AdjustmentValues, PickerOption } from '@f8/core';

// Body / film tables consumed by BodyFilmPicker and the editor's
// "Body × Film" line under PresetStrip. IDs match the bodyId/filmId on each
// Preset below.
export const seoulBodies: PickerOption[] = [
  { id: 'contax-t2', label: 'Contax T2' },
  { id: 'olympus-mju', label: 'Olympus mju II' },
  { id: 'leica-m6', label: 'Leica M6' },
  { id: 'mamiya-645', label: 'Mamiya 645' },
  { id: 'pentax-k1000', label: 'Pentax K1000' },
  { id: 'hasselblad-500cm', label: 'Hasselblad 500CM' },
  { id: 'yashica-t4', label: 'Yashica T4' },
  { id: 'arri-alexa', label: 'ARRI Alexa' },
];

export const seoulFilms: PickerOption[] = [
  { id: 'kodak-portra400', label: 'Kodak Portra 400' },
  { id: 'kodak-portra160', label: 'Kodak Portra 160' },
  { id: 'kodak-trix400', label: 'Kodak Tri-X 400' },
  { id: 'cinestill-800t', label: 'Cinestill 800T' },
  { id: 'cinestill-50d', label: 'Cinestill 50D' },
  { id: 'fuji-pro400h', label: 'Fuji Pro 400H' },
  { id: 'fuji-superia200-expired', label: 'Superia 200 Expired' },
  { id: 'kodak-gold200', label: 'Kodak Gold 200' },
  { id: 'kodak-ektar100', label: 'Kodak Ektar 100' },
  { id: 'kodak-vision3-250d', label: 'Vision3 250D' },
];

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

// TODO: replace with real LUT (Kodak Ektar 100)
const ugi: Preset = {
  id: 'ugi',
  name: '우기',
  bodyId: 'pentax-k1000',
  filmId: 'kodak-ektar100',
  isPremium: true,
  lutAsset: require('./luts/ugi.png'),
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

// TODO: replace with real LUT (Cinestill 50D indoor)
const caffein: Preset = {
  id: 'caffein',
  name: '카페인',
  bodyId: 'mamiya-645',
  filmId: 'cinestill-50d',
  isPremium: true,
  lutAsset: require('./luts/caffein.png'),
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

// TODO: replace with real LUT (Vision3 250D teal-orange)
const ibangin: Preset = {
  id: 'ibangin',
  name: '이방인',
  bodyId: 'arri-alexa',
  filmId: 'kodak-vision3-250d',
  isPremium: true,
  lutAsset: require('./luts/ibangin.png'),
  defaults: adj({
    intensity: 80,
    pushPull: 50,
    shadows: -15,
    highlights: -10,
    grain: 40,
    vignette: 40,
  }),
};

// TODO: replace with real LUT (Fuji Pro 400H pulled -2)
const bomnal: Preset = {
  id: 'bomnal',
  name: '봄날',
  bodyId: 'hasselblad-500cm',
  filmId: 'fuji-pro400h',
  isPremium: true,
  lutAsset: require('./luts/bomnal.png'),
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

// TODO: replace with real LUT (Kodak Tri-X 400 B&W — desaturated by LUT)
const goyo: Preset = {
  id: 'goyo',
  name: '고요',
  bodyId: 'leica-m6',
  filmId: 'kodak-trix400',
  isPremium: true,
  lutAsset: require('./luts/goyo.png'),
  defaults: adj({
    intensity: 100,
    shadows: 10,
    highlights: -10,
    grain: 50,
    vignette: 25,
  }),
};

// TODO: replace with real LUT (Kodak Portra 400 + red boost)
const dongbaek: Preset = {
  id: 'dongbaek',
  name: '동백',
  bodyId: 'contax-t2',
  filmId: 'kodak-portra400',
  isPremium: true,
  lutAsset: require('./luts/dongbaek.png'),
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

// F8 Seoul ships no seoul-only free presets — the free 6 come from
// @f8/presets-common. All Seoul-curated presets live behind the Vintage
// Korea pack.
export const seoulPresets: Preset[] = [];

export const seoulPremiumPacks: PresetPack[] = [
  {
    id: 'vintage_korea',
    name: 'Vintage Korea',
    description: '서울의 90년대부터 지금까지. 6종.',
    priceLabel: '₩3,900',
    presets: [ugi, caffein, ibangin, bomnal, goyo, dongbaek],
  },
];
