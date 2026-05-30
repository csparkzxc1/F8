// Babel config for the Expo app. `babel-preset-expo` already appends the
// react-native-reanimated plugin automatically.
//
// We add `react-native-worklets-core/plugin` for vision-camera frame
// processors (live LUT preview — see packages/core/src/services/
// cameraFrameProcessor.ts). It must run so `'worklet'` functions compile.
// This plugin is only needed while ENABLE_LIVE_LUT is on, but it's harmless
// when the flag is off, and keeping it here means flipping the flag doesn't
// require a config change.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-worklets-core/plugin'],
  };
};
