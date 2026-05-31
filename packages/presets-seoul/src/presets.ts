// F8 Seoul premium pack (Vintage Korea, 6 presets).
//
// Each `defaults` block is the source of truth for the slider state when the
// preset is selected. UI sliders, the FilteredImage shader chain, and the
// autoAdjust suggester all read from these AdjustmentValues.
//
// LUT assets are 512×512 strip PNGs (8×8 grid of 64-wide blue slices). The
// current PNGs are dummy tinted-identity LUTs; replace with real film LUTs
// before launch — see TODO comments per preset.
import type { Preset, PresetPack, AdjustmentValues, CameraBody, PickerOption } from '@f8/core';

// Camera bodies selectable in the editor's [body] tab. Each carries its own
// optical character (vignette / softness / flareIntensity, all 0..40) that the
// shader chain composites on top of the active preset. IDs match the bodyId on
// each Preset below, so a preset can recommend its intended body.
//
// The three premium bodies (Leica M6, Hasselblad 500CM, ARRI Alexa) unlock
// alongside the Vintage Korea pack. A preset may still recommend a premium body
// as its look; the lock only blocks selecting that body manually on other shots.
export const seoulBodies: CameraBody[] = [
  { id: 'contax-t2', name: 'Contax T2', description: '프리미엄 컴팩트', vignette: 30, softness: 20, flareIntensity: 25, isPremium: false },
  { id: 'olympus-mju', name: 'Olympus mju II', description: '포켓 스트리트', vignette: 40, softness: 30, flareIntensity: 20, isPremium: false },
  { id: 'leica-m6', name: 'Leica M6', description: '정밀 레인지파인더', vignette: 12, softness: 8, flareIntensity: 8, isPremium: true },
  { id: 'mamiya-645', name: 'Mamiya 645', description: '중형 6×4.5', vignette: 10, softness: 15, flareIntensity: 8, isPremium: false },
  { id: 'pentax-k1000', name: 'Pentax K1000', description: '날카로운 SLR', vignette: 15, softness: 5, flareIntensity: 5, isPremium: false },
  { id: 'hasselblad-500cm', name: 'Hasselblad 500CM', description: '중형 6×6', vignette: 10, softness: 18, flareIntensity: 10, isPremium: true },
  { id: 'yashica-t4', name: 'Yashica T4', description: '자이스 포인트앤슛', vignette: 35, softness: 25, flareIntensity: 15, isPremium: false },
  { id: 'arri-alexa', name: 'ARRI Alexa', description: '시네마 디지털', vignette: 8, softness: 12, flareIntensity: 22, isPremium: true },
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
  filmStockDisplayName: 'Kodak Ektar 100',
  isPremium: true,
  category: 'season',
  thumbnailColor: '#6A7F8C',
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
  filmStockDisplayName: 'Cinestill 50D',
  isPremium: true,
  category: 'daily',
  thumbnailColor: '#8B6F47',
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
  filmStockDisplayName: 'Kodak Vision3 250D',
  isPremium: true,
  category: 'mood',
  thumbnailColor: '#5C6470',
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
  filmStockDisplayName: 'Fuji Pro 400H',
  isPremium: true,
  category: 'season',
  thumbnailColor: '#D6B4A8',
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
  filmStockDisplayName: 'Kodak Tri-X 400',
  isPremium: true,
  category: 'mood',
  thumbnailColor: '#6B6B6B',
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
  filmStockDisplayName: 'Kodak Portra 400',
  isPremium: true,
  category: 'mood',
  thumbnailColor: '#C44545',
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
