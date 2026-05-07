// Pure-logic Jest config for @f8/core. Native modules (Skia, RN, vision-camera,
// expo-*) are mocked in __mocks__ so the engine helpers can run on plain Node.
/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^react-native$': '<rootDir>/__tests__/__mocks__/react-native.ts',
    '^@shopify/react-native-skia$': '<rootDir>/__tests__/__mocks__/skia.ts',
    '^expo-(.*)$': '<rootDir>/__tests__/__mocks__/expo.ts',
    '^posthog-react-native$': '<rootDir>/__tests__/__mocks__/posthog.ts',
    '^react-native-iap$': '<rootDir>/__tests__/__mocks__/iap.ts',
    '^@react-native-async-storage/async-storage$':
      '<rootDir>/__tests__/__mocks__/async-storage.ts',
    '^@react-navigation/(.*)$': '<rootDir>/__tests__/__mocks__/navigation.ts',
    '^react-native-gesture-handler$': '<rootDir>/__tests__/__mocks__/react-native.ts',
    '^react-native-vision-camera$': '<rootDir>/__tests__/__mocks__/react-native.ts',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true, tsconfig: { jsx: 'react' } }],
  },
};
