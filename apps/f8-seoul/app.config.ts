// Expo runtime config for F8 Seoul. Bundle id and identity stay aligned with variant.config.ts.
import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'F8 Seoul',
  slug: 'f8-seoul',
  scheme: 'f8seoul',
  version: '0.1.0',
  orientation: 'portrait',
  userInterfaceStyle: 'dark',
  icon: './assets/icon.png',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#0A0A0A',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    bundleIdentifier: 'com.yourco.f8.seoul',
    supportsTablet: false,
  },
  android: {
    package: 'com.yourco.f8.seoul',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0A0A0A',
    },
  },
  plugins: ['expo-dev-client'],
  experiments: {
    typedRoutes: false,
  },
};

export default config;
