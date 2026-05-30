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
  // Marketing display name of the film stock, shown in the editor caption
  // ("Contax T2 × Kodak Portra 400"). Distinct from the films-table label,
  // which is abbreviated for the compact picker chips. Falls back to the
  // films-table label when omitted.
  filmStockDisplayName?: string;
  thumbnail?: ImageAsset;
  // Signature tone of the film, used as a solid placeholder tile background in
  // the camera carousel until real filtered-preview thumbnails ship. Hex string.
  thumbnailColor?: string;
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

// A camera body the user can select in the editor's [body] tab. Unlike a film
// (a pure label), a body carries its own optical character that composites on
// top of the active preset: an additive vignette, an additive halation/flare,
// and a softness term that drives a light gaussian blur pass. Values are on the
// same 0..100 UI scale as AdjustmentValues (bodies stay in the 0..40 range).
// `isPremium` bodies unlock alongside a premium pack — see BodyPicker.
export type CameraBody = {
  id: string;
  name: string;
  description: string;
  vignette: number;
  softness: number;
  flareIntensity: number;
  isPremium: boolean;
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
  bodies?: CameraBody[];
  films?: PickerOption[];

  copy: VariantCopy;

  iapProductIds: VariantIapIds;
};
