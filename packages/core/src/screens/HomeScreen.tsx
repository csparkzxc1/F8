// Home: F8 wordmark + variant.copy.home. Shoot / Pick photo CTAs.
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useVariant } from '../variant/VariantContext';
import { useTheme } from '../theme/ThemeProvider';
import { F8Logo } from '../components/brand/F8Logo';
import { t } from '../i18n';
import { pickPhoto } from '../services/imagePicker';
import { haptic } from '../services/haptics';
import { track } from '../services/analytics';
import { useEditorStore } from '../store/editorStore';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export function HomeScreen() {
  const variant = useVariant();
  const theme = useTheme();
  const nav = useNavigation<Nav>();
  const copy = t();
  const setPhoto = useEditorStore((s) => s.setPhoto);

  async function onPick() {
    haptic.tap();
    const uri = await pickPhoto();
    if (!uri) return;
    setPhoto(uri);
    track('photo_picked');
    nav.navigate('Editor', { photoUri: uri });
  }

  function onShoot() {
    haptic.tap();
    nav.navigate('Camera');
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.bg }]}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.brand}>
            <F8Logo size={28} color={theme.colors.text} />
            <Text style={[styles.variantName, { color: theme.colors.textMuted }]}>
              {variant.cityName}
            </Text>
          </View>
          <View style={styles.topRight}>
            <Pressable onPress={() => nav.navigate('PresetStore')} hitSlop={12}>
              <Text style={[styles.settings, { color: theme.colors.accent }]}>
                ✨
              </Text>
            </Pressable>
            <Pressable onPress={() => nav.navigate('Settings')} hitSlop={12}>
              <Text style={[styles.settings, { color: theme.colors.textMuted }]}>
                {copy.common.settings}
              </Text>
            </Pressable>
          </View>
        </View>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
          {variant.copy.home.subtitle}
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={onShoot}
          style={[styles.primary, { backgroundColor: theme.colors.accent }]}
        >
          <Text style={[styles.primaryLabel, { color: theme.colors.bg }]}>{copy.home.shoot}</Text>
        </Pressable>
        <Pressable
          onPress={onPick}
          style={[styles.secondary, { borderColor: theme.colors.border }]}
        >
          <Text style={[styles.secondaryLabel, { color: theme.colors.text }]}>
            {copy.home.pickPhoto}
          </Text>
        </Pressable>
      </View>

      <View style={styles.recent}>
        <Text style={[styles.recentTitle, { color: theme.colors.textMuted }]}>
          {copy.home.recent}
        </Text>
        <Text style={[styles.empty, { color: theme.colors.textDimmed }]}>{copy.home.empty}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 24 },
  header: { paddingTop: 24, paddingBottom: 32, gap: 8 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settings: { fontSize: 14, fontWeight: '500' },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  brand: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  variantName: { fontSize: 18, fontWeight: '500', letterSpacing: -0.3 },
  subtitle: { fontSize: 14 },
  actions: { gap: 12 },
  primary: { paddingVertical: 18, borderRadius: 12, alignItems: 'center' },
  primaryLabel: { fontSize: 17, fontWeight: '700', letterSpacing: -0.3 },
  secondary: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryLabel: { fontSize: 17, fontWeight: '600', letterSpacing: -0.3 },
  recent: { flex: 1, marginTop: 40, gap: 12 },
  recentTitle: { fontSize: 13, fontWeight: '600', letterSpacing: 0.3, textTransform: 'uppercase' },
  empty: { fontSize: 15 },
});
