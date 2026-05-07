// Horizontal preset picker. Shows variant.defaultPresets; tap selects, double-tap resets.
import React from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
} from 'react-native';
import { useVariant } from '../../variant/VariantContext';
import { useEditorStore } from '../../store/editorStore';
import { useTheme } from '../../theme/ThemeProvider';
import type { Preset } from '../../variant/types';

const TILE = 64;

export function PresetStrip() {
  const theme = useTheme();
  const variant = useVariant();
  const active = useEditorStore((s) => s.activePreset);
  const setPreset = useEditorStore((s) => s.setPreset);

  const presets = variant.defaultPresets;

  const renderItem: ListRenderItem<Preset> = ({ item }) => {
    const isActive = active?.id === item.id;
    return (
      <Pressable
        onPress={() => setPreset(isActive ? null : item)}
        style={[
          styles.tile,
          {
            borderColor: isActive ? theme.colors.accent : 'transparent',
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
        {item.isPremium ? (
          <View style={[styles.badge, { borderColor: theme.colors.accent }]}>
            <Text style={[styles.badgeText, { color: theme.colors.accent }]}>+</Text>
          </View>
        ) : null}
      </Pressable>
    );
  };

  if (presets.length === 0) {
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
      data={presets}
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
    gap: 6,
  },
  thumb: { width: TILE - 12, height: TILE - 12, borderRadius: 6, overflow: 'hidden' },
  thumbImage: { width: '100%', height: '100%' },
  label: { fontSize: 11, fontWeight: '600', maxWidth: TILE - 8 },
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
