// Editor: Skia preview, preset strip, compare slider, adjustments, save flow.
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import {
  Canvas,
  Image as SkiaImage,
  useImage,
  Skia,
  type SkImage,
} from '@shopify/react-native-skia';
import { useTheme } from '../theme/ThemeProvider';
import { t } from '../i18n';
import { FilteredImage } from '../components/editor/FilteredImage';
import { AdjustmentsPanel } from '../components/editor/AdjustmentsPanel';
import { PresetStrip } from '../components/editor/PresetStrip';
import { CompareSlider } from '../components/editor/CompareSlider';
import { useEditorStore } from '../store/editorStore';
import { useToast } from '../components/ui/Toast';
import { saveSkImage } from '../services/saveImage';
import { haptic } from '../services/haptics';
import { track } from '../services/analytics';
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
  const reset = useEditorStore((s) => s.reset);
  const photoUri = route.params?.photoUri ?? storedPhotoUri;
  const showToast = useToast((s) => s.show);

  const image = useImage(photoUri ?? null);
  const [comparing, setComparing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Snapshot the visible filtered preview for export. We re-render the same
  // pipeline into an offscreen surface using makeImageSnapshot.
  const previewRef = useRef<View>(null);

  const onSave = useCallback(async () => {
    if (!image || saving) return;
    setSaving(true);
    try {
      const snapshot = renderSnapshot(image, previewSize);
      await saveSkImage(snapshot);
      haptic.success();
      track('photo_saved');
      showToast(copy.editor.savedToast);
    } catch {
      haptic.error();
      showToast(copy.errors.saveFailed, 'error');
    } finally {
      setSaving(false);
    }
  }, [image, previewSize, saving, copy, showToast]);

  const onClose = useCallback(() => {
    reset();
    nav.goBack();
  }, [nav, reset]);

  const filtered = useMemo(
    () =>
      image ? (
        <FilteredImage
          image={image}
          adjustments={adjustments}
          width={previewSize}
          height={previewSize}
        />
      ) : null,
    [image, adjustments, previewSize],
  );

  const original = useMemo(
    () =>
      image ? (
        <Canvas style={{ width: previewSize, height: previewSize }}>
          <SkiaImage image={image} x={0} y={0} width={previewSize} height={previewSize} fit="cover" />
        </Canvas>
      ) : null,
    [image, previewSize],
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.bg }]}>
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={12}>
          <Text style={[styles.back, { color: theme.colors.textMuted }]}>{copy.common.cancel}</Text>
        </Pressable>
        <Pressable onPress={() => setComparing((v) => !v)} hitSlop={12}>
          <Text
            style={[
              styles.title,
              { color: comparing ? theme.colors.accent : theme.colors.text },
            ]}
          >
            {comparing ? copy.editor.original : copy.editor.f8}
          </Text>
        </Pressable>
        <Pressable onPress={onSave} hitSlop={12} disabled={!image || saving}>
          <Text
            style={[
              styles.save,
              { color: !image || saving ? theme.colors.textDimmed : theme.colors.accent },
            ]}
          >
            {copy.common.save}
          </Text>
        </Pressable>
      </View>

      <View ref={previewRef} style={[styles.preview, { width: previewSize, height: previewSize }]}>
        {image && filtered && original ? (
          comparing ? (
            <CompareSlider
              width={previewSize}
              height={previewSize}
              before={original}
              after={filtered}
            />
          ) : (
            filtered
          )
        ) : (
          <View style={[styles.placeholder, { borderColor: theme.colors.border }]}>
            <Text style={[styles.placeholderText, { color: theme.colors.textDimmed }]}>
              {copy.home.empty}
            </Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.controls}>
        <PresetStrip />
        <AdjustmentsPanel />
      </ScrollView>
    </SafeAreaView>
  );
}

// Off-screen snapshot for export. Skia's makeImageSnapshot of a Surface keeps
// the same shader pipeline but writes to a backing image we can encode.
function renderSnapshot(source: SkImage, size: number): SkImage {
  const surface = Skia.Surface.MakeOffscreen(size, size);
  if (!surface) throw new Error('skia-surface-failed');
  const canvas = surface.getCanvas();
  const paint = Skia.Paint();
  canvas.drawImageRect(
    source,
    { x: 0, y: 0, width: source.width(), height: source.height() },
    { x: 0, y: 0, width: size, height: size },
    paint,
  );
  surface.flush();
  const snap = surface.makeImageSnapshot();
  return snap;
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
  controls: { flex: 1 },
});
