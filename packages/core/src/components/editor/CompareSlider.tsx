// Drag horizontally to reveal the original through a vertical seam.
// Long-press anywhere to bypass and show the source 1:1.
import React, { useRef, useState } from 'react';
import {
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { t } from '../../i18n';

type Props = {
  width: number;
  height: number;
  before: React.ReactNode;
  after: React.ReactNode;
  initialRatio?: number;
};

export function CompareSlider({ width, height, before, after, initialRatio = 0.5 }: Props) {
  const theme = useTheme();
  const copy = t();
  const [ratio, setRatio] = useState(initialRatio);
  const [holding, setHolding] = useState(false);
  const ratioRef = useRef(initialRatio);

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => {
        const next = Math.max(0, Math.min(1, (g.x0 + g.dx) / Math.max(1, width)));
        ratioRef.current = next;
        setRatio(next);
      },
    }),
  ).current;

  const onLayout = (_: LayoutChangeEvent) => undefined;
  const seamX = (holding ? 1 : ratio) * width;

  return (
    <Pressable
      onLayout={onLayout}
      onLongPress={() => setHolding(true)}
      onPressOut={() => setHolding(false)}
      delayLongPress={120}
      style={[styles.root, { width, height }]}
    >
      <View style={[styles.layer, { width, height }]}>{after}</View>
      <View style={[styles.layer, { width: seamX, height, overflow: 'hidden' }]}>
        <View style={{ width, height }}>{before}</View>
      </View>
      <View
        {...responder.panHandlers}
        style={[
          styles.seam,
          { left: seamX - 1, height, backgroundColor: theme.colors.text },
        ]}
      >
        <View style={[styles.handle, { borderColor: theme.colors.text }]} />
      </View>
      <View style={styles.labels} pointerEvents="none">
        <Text style={[styles.label, { color: theme.colors.text }]}>{copy.editor.original}</Text>
        <Text style={[styles.label, { color: theme.colors.text }]}>{copy.editor.f8}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { position: 'relative' },
  layer: { position: 'absolute', top: 0, left: 0 },
  seam: { position: 'absolute', top: 0, width: 2, alignItems: 'center', justifyContent: 'center' },
  handle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    backgroundColor: 'transparent',
    position: 'absolute',
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
