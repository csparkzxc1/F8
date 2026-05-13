// Horizontal preset picker. Always shows every preset (defaults + every
// premium pack). Locked premium tiles get a lock badge and route to the
// store on tap; unlocked tiles toggle the active preset.
import React, { useMemo } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useVariant } from '../../variant/VariantContext';
import { useEditorStore } from '../../store/editorStore';
import { useIapStore, isPackUnlocked } from '../../store/iapStore';
import { useTheme } from '../../theme/ThemeProvider';
import { t } from '../../i18n';
import { haptic } from '../../services/haptics';
import { track } from '../../services/analytics';
import type { Preset } from '../../variant/types';
import type { RootStackParamList } from '../../navigation/types';

const TILE = 72;

type Nav = NativeStackNavigationProp<RootStackParamList>;

type StripItem = Preset & { locked: boolean };

export function PresetStrip() {
  const theme = useTheme();
  const variant = useVariant();
  const nav = useNavigation<Nav>();
  const active = useEditorStore((s) => s.activePreset);
  const setPreset = useEditorStore((s) => s.setPreset);
  const ownedIds = useIapStore((s) => s.ownedPackIds);
  const copy = t();

  const items: StripItem[] = useMemo(() => {
    const defaults: StripItem[] = variant.defaultPresets.map((p) => ({ ...p, locked: false }));
    const fromPacks: StripItem[] = variant.premiumPacks.flatMap((pack) => {
      const unlocked = isPackUnlocked(pack.id, variant.iapProductIds, ownedIds);
      return pack.presets.map((p) => ({ ...p, locked: !unlocked }));
    });
    return [...defaults, ...fromPacks];
  }, [variant.defaultPresets, variant.premiumPacks, variant.iapProductIds, ownedIds]);

  const onTap = (item: StripItem, isActive: boolean) => {
    haptic.tap();
    if (item.locked) {
      nav.navigate('PresetStore');
      return;
    }
    if (isActive) {
      setPreset(null);
      return;
    }
    setPreset(item);
    track('preset_applied', { id: item.id, premium: item.isPremium });
  };

  const renderItem: ListRenderItem<StripItem> = ({ item }) => {
    const isActive = active?.id === item.id;
    const presetCopy = (copy.presets as Record<string, string>)[item.id];
    return (
      <Pressable
        onPress={() => onTap(item, isActive)}
        style={[
          styles.tile,
          {
            borderColor: isActive ? theme.colors.accent : 'transparent',
            opacity: item.locked ? 0.55 : 1,
          },
        ]}
      >
        <View style={[styles.thumb, { backgroundColor: theme.colors.surface }]}>
          {typeof item.thumbnail === 'number' ? (
            <Image source={item.thumbnail} style={styles.thumbImage} />
          ) : null}
        </View>
        <Text
          numberOfLines={1}
          style={[styles.label, { color: isActive ? theme.colors.text : theme.colors.textMuted }]}
        >
          {item.name}
        </Text>
        {presetCopy ? (
          <Text
            numberOfLines={1}
            style={[styles.subLabel, { color: theme.colors.textDimmed }]}
          >
            {presetCopy}
          </Text>
        ) : null}
        {item.locked ? (
          <View style={[styles.badge, { borderColor: theme.colors.accent, backgroundColor: theme.colors.bg }]}>
            <Text style={[styles.badgeText, { color: theme.colors.accent }]}>🔒</Text>
          </View>
        ) : item.isPremium ? (
          <View style={[styles.badge, { borderColor: theme.colors.accent }]}>
            <Text style={[styles.badgeText, { color: theme.colors.accent }]}>+</Text>
          </View>
        ) : null}
      </Pressable>
    );
  };

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, { color: theme.colors.textDimmed }]}>
          프리셋이 곧 도착합니다.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(p) => p.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
      renderItem={renderItem}
    />
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 20, gap: 10 },
  tile: {
    width: TILE,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 2,
    padding: 4,
    gap: 4,
  },
  thumb: { width: TILE - 12, height: TILE - 12, borderRadius: 6, overflow: 'hidden' },
  thumbImage: { width: '100%', height: '100%' },
  label: { fontSize: 12, fontWeight: '700', maxWidth: TILE - 8, letterSpacing: -0.2 },
  subLabel: { fontSize: 9.5, maxWidth: TILE - 8, fontStyle: 'italic' },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 10, fontWeight: '700' },
  empty: { paddingHorizontal: 20, paddingVertical: 16 },
  emptyText: { fontSize: 13 },
});
