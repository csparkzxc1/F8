// Minimal toast — no library, single instance via zustand.
// Voice rule: short, no emoji, no "!".
import React, { useEffect } from 'react';
import { Animated, StyleSheet, View, Text } from 'react-native';
import { create } from 'zustand';
import { useTheme } from '../../theme/ThemeProvider';

type ToastKind = 'info' | 'error';
type ToastEntry = { id: number; message: string; kind: ToastKind };

type ToastState = {
  entry: ToastEntry | null;
  show: (message: string, kind?: ToastKind) => void;
  hide: () => void;
};

let counter = 0;

export const useToast = create<ToastState>((set) => ({
  entry: null,
  show: (message, kind = 'info') => set({ entry: { id: ++counter, message, kind } }),
  hide: () => set({ entry: null }),
}));

export function ToastHost() {
  const theme = useTheme();
  const entry = useToast((s) => s.entry);
  const hide = useToast((s) => s.hide);
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!entry) return;
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.delay(1400),
      Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => hide());
  }, [entry, opacity, hide]);

  if (!entry) return null;

  const bg = entry.kind === 'error' ? theme.colors.danger : theme.colors.surfaceElevated;

  return (
    <View pointerEvents="none" style={styles.host}>
      <Animated.View style={[styles.toast, { opacity, backgroundColor: bg }]}>
        <Text style={[styles.text, { color: theme.colors.text }]}>{entry.message}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  toast: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
  },
  text: { fontSize: 14, fontWeight: '600', letterSpacing: -0.2 },
});
