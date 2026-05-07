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
  plugins: [
    'expo-dev-client',
    [
      'expo-image-picker',
      {
        photosPermission: '필름 카메라처럼 사진을 불러오기 위해 사진 접근이 필요합니다.',
      },
    ],
    [
      'expo-media-library',
      {
        photosPermission: '결과 사진을 갤러리에 저장합니다.',
        savePhotosPermission: '결과 사진을 갤러리에 저장합니다.',
      },
    ],
    [
      'react-native-vision-camera',
      {
        cameraPermissionText: '필름 카메라처럼 그 자리를 담기 위해 카메라 접근이 필요합니다.',
      },
    ],
  ],
  experiments: {
    typedRoutes: false,
  },
  extra: {
    // Inject via EAS secret POSTHOG_KEY_SEOUL or leave empty for dev.
    posthogKey: process.env.POSTHOG_KEY_SEOUL ?? '',
  },
};

export default config;
