// Expo runtime config for F8 Tokyo. Bundle id and identity stay aligned with variant.config.ts.
import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'F8 Tokyo',
  slug: 'f8-tokyo',
  scheme: 'f8tokyo',
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
    bundleIdentifier: 'com.csparkzxc1.f8.tokyo',
    supportsTablet: false,
    infoPlist: {
      NSCameraUsageDescription:
        'F8はフィルムカメラのように撮影するためにカメラへのアクセスが必要です。',
      NSPhotoLibraryUsageDescription:
        'F8は写真を読み込み・保存するために写真へのアクセスが必要です。',
      NSPhotoLibraryAddUsageDescription:
        'F8は補正した写真をギャラリーに保存するために権限が必要です。',
    },
  },
  android: {
    package: 'com.csparkzxc1.f8.tokyo',
    permissions: ['CAMERA', 'READ_MEDIA_IMAGES', 'WRITE_EXTERNAL_STORAGE'],
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0A0A0A',
    },
  },
  plugins: [
    'expo-dev-client',
    'react-native-iap',
    [
      'expo-image-picker',
      { photosPermission: 'シブヤの夜を残すために、写真へのアクセスが必要です。' },
    ],
    [
      'expo-media-library',
      {
        photosPermission: '結果の写真をギャラリーに保存します。',
        savePhotosPermission: '結果の写真をギャラリーに保存します。',
      },
    ],
    [
      'react-native-vision-camera',
      {
        cameraPermissionText:
          'F8はフィルムカメラのように撮影するためにカメラへのアクセスが必要です。',
        enableMicrophonePermission: false,
        enableLocation: false,
      },
    ],
  ],
  experiments: { typedRoutes: false },
  extra: {
    posthogKey: process.env.POSTHOG_KEY_TOKYO ?? '',
  },
};

export default config;
