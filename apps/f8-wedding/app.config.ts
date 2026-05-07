// Expo runtime config for F8 Wedding. Ivory accent, soft tone.
import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'F8 Wedding',
  slug: 'f8-wedding',
  scheme: 'f8wedding',
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
    bundleIdentifier: 'com.yourco.f8.wedding',
    supportsTablet: false,
  },
  android: {
    package: 'com.yourco.f8.wedding',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0A0A0A',
    },
  },
  plugins: [
    'expo-dev-client',
    [
      'expo-image-picker',
      { photosPermission: '하루의 결을 담기 위해 사진 접근이 필요합니다.' },
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
      { cameraPermissionText: '그 자리의 빛을 담기 위해 카메라 접근이 필요합니다.' },
    ],
  ],
  experiments: { typedRoutes: false },
};

export default config;
