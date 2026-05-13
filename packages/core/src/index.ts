// @f8/core public surface.
export { createF8App } from './variant/createF8App';
export { VariantProvider, useVariant } from './variant/VariantContext';
export type {
  VariantConfig,
  VariantId,
  VariantCopy,
  OnboardingSlide,
  Preset,
  PresetPack,
  PickerOption,
  ImageAsset,
  AdjustmentValues,
} from './variant/types';

export { F8Logo } from './components/brand/F8Logo';
export { Slogan } from './components/brand/Slogan';

export { FilteredImage } from './components/editor/FilteredImage';
export type { FilteredImageHandle } from './components/editor/FilteredImage';
export { IntensitySlider } from './components/editor/IntensitySlider';
export { AdjustmentsPanel } from './components/editor/AdjustmentsPanel';
export { OverlaysPanel } from './components/editor/OverlaysPanel';
export { PresetStrip } from './components/editor/PresetStrip';
export { CompareSlider } from './components/editor/CompareSlider';
export { BodyFilmPicker } from './components/editor/BodyFilmPicker';

export { ToastHost, useToast } from './components/ui/Toast';

export { ThemeProvider, useTheme, baseColors, variantAccents, typography, fontFamily } from './theme';

export { t, getLocale, setLocale } from './i18n';
export type { Locale, Dict } from './i18n';

export { useEditorStore, defaultAdjustments } from './store/editorStore';

export {
  buildUniforms,
  buildHistogram,
  suggestAdjustments,
  sampleHistogram,
  getLutEffect,
  getAdjustmentsEffect,
  getGrainEffect,
  getLightleakEffect,
  LUT_SHADER,
  ADJUSTMENTS_SHADER,
  GRAIN_SHADER,
  LIGHTLEAK_SHADER,
} from './engine';
export type {
  FilterUniforms,
  LutUniforms,
  AdjustmentUniforms,
  GrainUniforms,
  LightleakUniforms,
  Histogram,
} from './engine';

export {
  pickPhoto,
  saveSkImage,
  savePhoto,
  SavePhotoError,
  sharePhoto,
  SharePhotoError,
  initIap,
  endIap,
  listOwned,
  buyPack,
  restorePurchases,
  haptic,
  track,
  identify,
  setAnalytics,
  initPostHog,
  getPostHog,
  normalizeImage,
} from './services';
export type { SaveResult, SaveError } from './services/savePhoto';
export type { ShareError } from './services/sharePhoto';
export type { AnalyticsEvent, AnalyticsAdapter } from './services/analytics';
export { useIapStore, isPackOwned, isPackUnlocked } from './store/iapStore';

export type { RootStackParamList } from './navigation/types';
