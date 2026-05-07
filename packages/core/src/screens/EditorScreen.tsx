// Editor placeholder. Skia-based pipeline lands in Phase 2.
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import { t } from '../i18n';

export function EditorScreen() {
  const theme = useTheme();
  const nav = useNavigation();
  const copy = t();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.bg }]}>
      <View style={styles.header}>
        <Pressable onPress={() => nav.goBack()} hitSlop={12}>
          <Text style={[styles.back, { color: theme.colors.textMuted }]}>{copy.common.cancel}</Text>
        </Pressable>
      </View>
      <View style={styles.canvas}>
        <Text style={[styles.placeholder, { color: theme.colors.textDimmed }]}>
          {copy.home.empty}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { padding: 20 },
  back: { fontSize: 15, fontWeight: '500' },
  canvas: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  placeholder: { fontSize: 15 },
});
