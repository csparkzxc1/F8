// Lightweight gesture-driven slider. Uses locationX so it works regardless
// of where the slider is positioned within the screen.
import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  type LayoutChangeEvent,
  type GestureResponderEvent,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
  formatValue?: (v: number) => string;
};

export function IntensitySlider({ label, value, min, max, onChange, formatValue }: Props) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  }, []);

  const apply = useCallback(
    (localX: number) => {
      if (width <= 0) return;
      const ratio = Math.max(0, Math.min(1, localX / width));
      onChange(min + (max - min) * ratio);
    },
    [width, min, max, onChange],
  );

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt: GestureResponderEvent) => apply(evt.nativeEvent.locationX),
        onPanResponderMove: (evt: GestureResponderEvent) => apply(evt.nativeEvent.locationX),
      }),
    [apply],
  );

  const ratio = (value - min) / (max - min || 1);
  const fillW = Math.max(0, Math.min(1, ratio)) * width;

  const valueStr = formatValue ? formatValue(value) : Math.round(value).toString();

  return (
    <View style={styles.row}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
        <Text style={[styles.value, { color: theme.colors.textMuted }]}>{valueStr}</Text>
      </View>
      <View
        onLayout={onLayout}
        {...responder.panHandlers}
        style={[styles.track, { backgroundColor: theme.colors.border }]}
      >
        <View
          style={[
            styles.fill,
            { width: fillW, backgroundColor: theme.colors.accent },
          ]}
        />
        <View
          style={[
            styles.thumb,
            {
              left: Math.max(0, fillW - 8),
              backgroundColor: theme.colors.text,
              borderColor: theme.colors.accent,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingVertical: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 14, fontWeight: '600', letterSpacing: -0.2 },
  value: { fontSize: 13, fontVariant: ['tabular-nums'] },
  track: { height: 4, borderRadius: 2, position: 'relative' },
  fill: { height: 4, borderRadius: 2 },
  thumb: {
    position: 'absolute',
    top: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
});
