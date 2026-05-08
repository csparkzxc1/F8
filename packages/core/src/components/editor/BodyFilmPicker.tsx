// Two-row picker: camera body × film stock. Selection drives an internal preset id.
import React from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import type { PickerOption } from '../../variant/types';

export type { PickerOption };

type Props = {
  bodies: PickerOption[];
  films: PickerOption[];
  bodyId: string | null;
  filmId: string | null;
  onBody: (id: string) => void;
  onFilm: (id: string) => void;
};

export function BodyFilmPicker({ bodies, films, bodyId, filmId, onBody, onFilm }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.root}>
      <Row title="Body" options={bodies} selected={bodyId} onSelect={onBody} />
      <Row title="Film" options={films} selected={filmId} onSelect={onFilm} />
      {bodyId && filmId ? (
        <Text style={[styles.combo, { color: theme.colors.textMuted }]}>
          {bodies.find((b) => b.id === bodyId)?.label} × {films.find((f) => f.id === filmId)?.label}
        </Text>
      ) : null}
    </View>
  );
}

function Row({
  title,
  options,
  selected,
  onSelect,
}: {
  title: string;
  options: PickerOption[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.title, { color: theme.colors.textMuted }]}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {options.map((opt) => {
          const active = selected === opt.id;
          return (
            <Pressable
              key={opt.id}
              onPress={() => onSelect(opt.id)}
              style={[
                styles.chip,
                {
                  borderColor: active ? theme.colors.accent : theme.colors.border,
                  backgroundColor: active ? theme.colors.surface : 'transparent',
                },
              ]}
            >
              <Text style={[styles.chipLabel, { color: theme.colors.text }]}>{opt.label}</Text>
              {opt.subLabel ? (
                <Text style={[styles.chipSub, { color: theme.colors.textMuted }]}>{opt.subLabel}</Text>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 12, paddingVertical: 8 },
  section: { gap: 6 },
  title: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    paddingHorizontal: 20,
  },
  row: { paddingHorizontal: 20, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipLabel: { fontSize: 13, fontWeight: '600' },
  chipSub: { fontSize: 11 },
  combo: { paddingHorizontal: 20, fontSize: 12, fontVariant: ['tabular-nums'] },
});
