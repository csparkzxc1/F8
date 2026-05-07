// Editor: Skia preview + adjustments panel. Photo picking is Phase 3 — for now
// the screen accepts a photoUri via route params, falls back to an empty state.
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useImage } from '@shopify/react-native-skia';
import { useTheme } from '../theme/ThemeProvider';
import { t } from '../i18n';
import { FilteredImage } from '../components/editor/FilteredImage';
import { AdjustmentsPanel } from '../components/editor/AdjustmentsPanel';
import { useEditorStore } from '../store/editorStore';
import type { RootStackParamList } from '../navigation/types';

type Route = RouteProp<RootStackParamList, 'Editor'>;

export function EditorScreen() {
  const theme = useTheme();
  const nav = useNavigation();
  const route = useRoute<Route>();
  const copy = t();
  const { width } = useWindowDimensions();
  const previewSize = width;

  const storedPhotoUri = useEditorStore((s) => s.photoUri);
  const adjustments = useEditorStore((s) => s.adjustments);
  const photoUri = route.params?.photoUri ?? storedPhotoUri;

  const image = useImage(photoUri ?? null);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.bg }]}>
      <View style={styles.header}>
        <Pressable onPress={() => nav.goBack()} hitSlop={12}>
          <Text style={[styles.back, { color: theme.colors.textMuted }]}>{copy.common.cancel}</Text>
        </Pressable>
        <Text style={[styles.title, { color: theme.colors.text }]}>{copy.editor.f8}</Text>
        <Pressable hitSlop={12}>
          <Text style={[styles.save, { color: theme.colors.accent }]}>{copy.common.save}</Text>
        </Pressable>
      </View>

      <View style={[styles.preview, { width: previewSize, height: previewSize }]}>
        {image ? (
          <FilteredImage
            image={image}
            adjustments={adjustments}
            width={previewSize}
            height={previewSize}
          />
        ) : (
          <View style={[styles.placeholder, { borderColor: theme.colors.border }]}>
            <Text style={[styles.placeholderText, { color: theme.colors.textDimmed }]}>
              {copy.home.empty}
            </Text>
          </View>
        )}
      </View>

      <AdjustmentsPanel />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  back: { fontSize: 15, fontWeight: '500' },
  title: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  save: { fontSize: 15, fontWeight: '700' },
  preview: { alignSelf: 'center', backgroundColor: '#000' },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  placeholderText: { fontSize: 14 },
});
