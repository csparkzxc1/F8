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

export { ThemeProvider, useTheme, baseColors, variantAccents, typography, fontFamily } from './theme';

export { t, getLocale, setLocale } from './i18n';
export type { Locale, Dict } from './i18n';

export { useEditorStore, defaultAdjustments } from './store/editorStore';

export type { RootStackParamList } from './navigation/types';
