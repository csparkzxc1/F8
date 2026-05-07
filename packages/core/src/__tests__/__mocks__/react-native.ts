// Stub react-native exports needed by code under test.
export const Platform = { OS: 'ios', select: <T,>(o: { ios?: T; android?: T; default?: T }) => o.ios ?? o.default };
export const NativeModules: Record<string, unknown> = {};
export const StyleSheet = { create: <T,>(styles: T): T => styles, absoluteFillObject: {} };
export const View = 'View';
export const Text = 'Text';
export const Pressable = 'Pressable';
export const ScrollView = 'ScrollView';
export const FlatList = 'FlatList';
export const SafeAreaView = 'SafeAreaView';
export const Image = 'Image';
export const Animated = {
  Value: class { constructor(public _v: number) {} setValue() {} },
  View: 'Animated.View',
  timing: () => ({ start: (cb?: () => void) => cb?.() }),
  sequence: () => ({ start: (cb?: () => void) => cb?.() }),
  delay: () => ({ start: (cb?: () => void) => cb?.() }),
};
export const PanResponder = {
  create: () => ({ panHandlers: {} }),
};
export const Linking = { openURL: () => Promise.resolve() };
export const useWindowDimensions = () => ({ width: 390, height: 844 });
export type ImageSourcePropType = unknown;
export type LayoutChangeEvent = unknown;
export type GestureResponderEvent = { nativeEvent: { locationX: number; locationY: number } };
