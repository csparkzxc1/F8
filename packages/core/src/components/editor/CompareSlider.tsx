// Reanimated split-view comparator. Drag the seam left/right to reveal the
// filtered ("after") vs. original ("before") halves. The shared seam value
// lives on the UI thread so the seam, the clip layer, and the handle all
// stay locked at 60fps.
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeProvider';
import { t } from '../../i18n';

type Props = {
  width: number;
  height: number;
  before: React.ReactNode;
  after: React.ReactNode;
  initialRatio?: number;
};

const HANDLE = 28;
const ARROW = 10;

export function CompareSlider({ width, height, before, after, initialRatio = 0.5 }: Props) {
  const theme = useTheme();
  const copy = t();
  const seam = useSharedValue(initialRatio * width);

  const pan = Gesture.Pan()
    .minDistance(0)
    .onBegin((e) => {
      'worklet';
      seam.value = Math.max(0, Math.min(width, e.x));
    })
    .onUpdate((e) => {
      'worklet';
      seam.value = Math.max(0, Math.min(width, e.x));
    });

  const clipStyle = useAnimatedStyle(() => ({ width: seam.value }));
  const seamStyle = useAnimatedStyle(() => ({ transform: [{ translateX: seam.value - 0.5 }] }));

  return (
    <GestureDetector gesture={pan}>
      <View style={[styles.root, { width, height }]}>
        {/* Right side: filtered after */}
        <View style={[styles.layer, { width, height }]}>{after}</View>
        {/* Left side: original before, clipped by the seam */}
        <Animated.View style={[styles.layer, { height, overflow: 'hidden' }, clipStyle]}>
          <View style={{ width, height }}>{before}</View>
        </Animated.View>

        <Animated.View
          pointerEvents="none"
          style={[styles.seam, { height, backgroundColor: '#FFFFFF' }, seamStyle]}
        >
          <View style={[styles.handle, { borderColor: '#FFFFFF' }]}>
            <Text style={styles.arrow}>‹</Text>
            <Text style={styles.arrow}>›</Text>
          </View>
        </Animated.View>

        <View style={styles.labels} pointerEvents="none">
          <Text style={[styles.label, { color: theme.colors.text }]}>{copy.editor.original}</Text>
          <Text style={[styles.label, { color: theme.colors.text }]}>{copy.editor.f8}</Text>
        </View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  root: { position: 'relative' },
  layer: { position: 'absolute', top: 0, left: 0 },
  seam: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: HANDLE,
    height: HANDLE,
    borderRadius: HANDLE / 2,
    borderWidth: 1.5,
    backgroundColor: 'rgba(0,0,0,0.25)',
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  arrow: {
    color: '#FFFFFF',
    fontSize: ARROW + 4,
    lineHeight: ARROW + 4,
    fontWeight: '700',
  },
  labels: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' },
});
