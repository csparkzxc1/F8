// F8 variant configuration — shape every variant app must provide.

// `string & Record<never, never>` keeps autocomplete on the literal union
// while still permitting any string at the call site.
// eslint-disable-next-line @typescript-eslint/ban-types
export type VariantId = 'seoul' | 'tokyo' | 'wedding' | 'mono' | 'cinema' | (string & {});

// Either a require()'d module id (number) or a remote/file URI (string).
// Matches what Skia's useImage and RN's <Image> source both accept.
export type ImageAsset = number | string;

export type OnboardingSlide = {
  title: string;
  body: string;
  imageAsset?: ImageAsset;
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
  thumbnail?: ImageAsset;
  lutAsset?: ImageAsset;
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
  // Short city / theme label shown next to the F8 wordmark on Home.
  // Decoupled from appName so the home header doesn't have to regex-strip "F8".
  cityName: string;
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
