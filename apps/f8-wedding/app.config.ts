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
    bundleIdentifier: 'com.csparkzxc1.f8.wedding',
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
    package: 'com.csparkzxc1.f8.wedding',
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
      {
        cameraPermissionText:
          'F8은 필름 카메라처럼 촬영하기 위해 카메라 권한이 필요합니다.',
        enableMicrophonePermission: false,
        enableLocation: false,
      },
    ],
  ],
  experiments: { typedRoutes: false },
  extra: {
    posthogKey: process.env.POSTHOG_KEY_WEDDING ?? '',
  },
};

export default config;
