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
  AdjustmentValues,
} from './variant/types';

export { F8Logo } from './components/brand/F8Logo';
export { Slogan } from './components/brand/Slogan';

export { FilteredImage } from './components/editor/FilteredImage';
export { IntensitySlider } from './components/editor/IntensitySlider';
export { AdjustmentsPanel } from './components/editor/AdjustmentsPanel';
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
  initIap,
  endIap,
  listOwned,
  buyPack,
  restorePurchases,
  haptic,
  track,
  identify,
  setAnalytics,
} from './services';
export type { AnalyticsEvent, AnalyticsAdapter } from './services/analytics';
export { useIapStore, isPackOwned } from './store/iapStore';

export type { RootStackParamList } from './navigation/types';
