// F8 Wedding entry. Init analytics first, then hand off to the shared shell.
import Constants from 'expo-constants';
import { createF8App, initPostHog } from '@f8/core';
import { f8WeddingConfig } from './src/variant.config';

const POSTHOG_KEY =
  (Constants.expoConfig?.extra as { posthogKey?: string } | undefined)?.posthogKey ?? '';

if (POSTHOG_KEY) {
  initPostHog(POSTHOG_KEY);
}

export default createF8App(f8WeddingConfig);
