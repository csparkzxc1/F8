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
    bundleIdentifier: 'com.csparkzxc1.f8.seoul',
    supportsTablet: false,
    infoPlist: {
      NSCameraUsageDescription:
        'F8은 필름 카메라처럼 촬영하기 위해 카메라 권한이 필요합니다.',
      NSPhotoLibraryUsageDescription:
        'F8은 사진을 불러오고 저장하기 위해 사진 권한이 필요합니다.',
      NSPhotoLibraryAddUsageDescription:
        'F8은 보정된 사진을 갤러리에 저장하기 위해 권한이 필요합니다.',
    },
  },
  android: {
    package: 'com.csparkzxc1.f8.seoul',
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
        cameraPermissionText:
          'F8은 필름 카메라처럼 촬영하기 위해 카메라 권한이 필요합니다.',
        enableMicrophonePermission: false,
        enableLocation: false,
      },
    ],
  ],
  experiments: {
    typedRoutes: false,
  },
  extra: {
    eas: {
      projectId: '2b4694dd-6217-4c1f-bdc8-cdb3577e5148',
    },
    // Inject via EAS secret POSTHOG_KEY_SEOUL or leave empty for dev.
    posthogKey: process.env.POSTHOG_KEY_SEOUL ?? '',
  },
};

export default config;
