// F8 Seoul entry. Init analytics first, then hand off to the shared shell.
import { registerRootComponent } from 'expo';
import Constants from 'expo-constants';
import { createF8App, initPostHog } from '@f8/core';
import { f8SeoulConfig } from './src/variant.config';

const POSTHOG_KEY =
  (Constants.expoConfig?.extra as { posthogKey?: string } | undefined)?.posthogKey ?? '';

if (POSTHOG_KEY) {
  initPostHog(POSTHOG_KEY);
}

const F8SeoulApp = createF8App(f8SeoulConfig);
registerRootComponent(F8SeoulApp);
export default F8SeoulApp;
