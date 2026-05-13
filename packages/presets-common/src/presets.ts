// Free 6 presets bundled with every F8 variant.
//
// Each `defaults` block is the source of truth for the slider state when the
// preset is selected. UI sliders, the FilteredImage shader chain, and the
// autoAdjust suggester all read from these AdjustmentValues.
//
// LUT assets are 512×512 strip PNGs (8×8 grid of 64-wide blue slices). The
// current PNGs are dummy tinted-identity LUTs; replace with real film LUTs
// before launch — see TODO comments per preset.
import type { Preset, AdjustmentValues } from '@f8/core';

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

// TODO: replace with real LUT (Cinestill 800T)
const noeul: Preset = {
  id: 'noeul',
  name: '노을',
  bodyId: 'contax-t2',
  filmId: 'cinestill-800t',
  isPremium: false,
  lutAsset: require('./luts/noeul.png'),
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

// TODO: replace with real LUT (Fuji Pro 400H pulled)
const saebyeok: Preset = {
  id: 'saebyeok',
  name: '새벽',
  bodyId: 'olympus-mju',
  filmId: 'fuji-pro400h',
  isPremium: false,
  lutAsset: require('./luts/saebyeok.png'),
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

// TODO: replace with real LUT (Kodak Portra 160)
const cheotnun: Preset = {
  id: 'cheotnun',
  name: '첫눈',
  bodyId: 'leica-m6',
  filmId: 'kodak-portra160',
  isPremium: false,
  lutAsset: require('./luts/cheotnun.png'),
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

// TODO: replace with real LUT (Fuji Superia expired)
const yunyeon: Preset = {
  id: 'yunyeon',
  name: '유년',
  bodyId: 'olympus-mju',
  filmId: 'fuji-superia200-expired',
  isPremium: false,
  lutAsset: require('./luts/yunyeon.png'),
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

// TODO: replace with real LUT (Kodak Gold 200 push +1)
const yeoreumbam: Preset = {
  id: 'yeoreumbam',
  name: '여름밤',
  bodyId: 'yashica-t4',
  filmId: 'kodak-gold200',
  isPremium: false,
  lutAsset: require('./luts/yeoreumbam.png'),
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

// TODO: replace with real LUT (Kodak Portra 400 — daily driver)
const hyuil: Preset = {
  id: 'hyuil',
  name: '휴일',
  bodyId: 'contax-t2',
  filmId: 'kodak-portra400',
  isPremium: false,
  lutAsset: require('./luts/hyuil.png'),
  defaults: adj({
    intensity: 75,
    shadows: 5,
    highlights: -5,
    temperature: 10,
    grain: 35,
    vignette: 20,
  }),
};

export const commonPresets: Preset[] = [
  noeul,
  saebyeok,
  cheotnun,
  yunyeon,
  yeoreumbam,
  hyuil,
];
