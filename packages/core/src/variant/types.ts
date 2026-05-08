// F8 variant configuration — shape every variant app must provide.
import type { ImageSourcePropType } from 'react-native';

export type VariantId = 'seoul' | 'tokyo' | 'wedding' | 'mono' | 'cinema' | (string & {});

export type OnboardingSlide = {
  title: string;
  body: string;
  imageAsset?: ImageSourcePropType;
};

export type AdjustmentValues = {
  intensity: number;
  exposure: number;
  pushPull: number;
  shadows: number;
  highlights: number;
  temperature: number;
  tint: number;
  grain: number;
  vignette: number;
  lightLeak: number;
  halation: number;
};

export type Preset = {
  id: string;
  name: string;
  bodyId: string;
  filmId: string;
  thumbnail?: ImageSourcePropType | number;
  lutAsset?: ImageSourcePropType | number;
  defaults: AdjustmentValues;
  isPremium: boolean;
};

export type PresetPack = {
  id: string;
  name: string;
  description: string;
  priceLabel: string;
  presets: Preset[];
};

export type VariantCopy = {
  home: { title: string; subtitle: string };
  onboarding: OnboardingSlide[];
  storeHero: { title: string; description: string };
  appStore: {
    subtitle: string;
    keywords: string;
    description: string;
  };
};

export type VariantIapIds = Record<string, { ios: string; android: string }>;

// One-line label pair used by BodyFilmPicker. Exposed at the variant level
// so each variant can curate its own bodies/films table.
export type PickerOption = {
  id: string;
  label: string;
  subLabel?: string;
};

export type VariantConfig = {
  id: VariantId;
  appName: string;
  bundleId: string;

  accentColor: string;
  iconAssetId: string;

  defaultPresets: Preset[];
  premiumPacks: PresetPack[];
  bodies?: PickerOption[];
  films?: PickerOption[];

  copy: VariantCopy;

  iapProductIds: VariantIapIds;
};
