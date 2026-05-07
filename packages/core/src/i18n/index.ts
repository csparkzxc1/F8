// Locale resolver. Defaults to ko; falls back to en.
import { NativeModules, Platform } from 'react-native';
import { ko } from './ko';
import { en } from './en';
import type { Dict } from './types';

export type Locale = 'ko' | 'en';

function detectLocale(): Locale {
  const raw =
    Platform.OS === 'ios'
      ? NativeModules.SettingsManager?.settings?.AppleLocale ??
        NativeModules.SettingsManager?.settings?.AppleLanguages?.[0]
      : NativeModules.I18nManager?.localeIdentifier;
  if (typeof raw === 'string' && raw.toLowerCase().startsWith('ko')) return 'ko';
  return 'en';
}

const dictionaries: Record<Locale, Dict> = { ko, en };

let current: Locale = detectLocale();

export function getLocale(): Locale {
  return current;
}

export function setLocale(next: Locale): void {
  current = next;
}

export function t(): Dict {
  return dictionaries[current];
}

export { ko, en };
export type { Dict };
