// Editor: Skia preview, preset strip, compare slider, adjustments, save flow.
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import {
  Canvas,
  Image as SkiaImage,
  useImage,
} from '@shopify/react-native-skia';
import { useTheme } from '../theme/ThemeProvider';
import { t } from '../i18n';
import { FilteredImage, type FilteredImageHandle } from '../components/editor/FilteredImage';
import { AdjustmentsPanel } from '../components/editor/AdjustmentsPanel';
import { PresetStrip } from '../components/editor/PresetStrip';
import { CompareSlider } from '../components/editor/CompareSlider';
import { IntensitySlider } from '../components/editor/IntensitySlider';
import { useEditorStore } from '../store/editorStore';
import { useToast } from '../components/ui/Toast';
import { useVariant } from '../variant/VariantContext';
import { saveSkImage } from '../services/saveImage';
import { haptic } from '../services/haptics';
import { track } from '../services/analytics';
import { sampleHistogram } from '../engine/sampleHistogram';
import { suggestAdjustments } from '../engine/autoAdjust';
import type { RootStackParamList } from '../navigation/types';

type Route = RouteProp<RootStackParamList, 'Editor'>;

type EditorTab = 'film' | 'adjust' | 'overlay' | 'body';

const TAB_LABELS: Array<{ id: EditorTab; label: string }> = [
  { id: 'film', label: '필름' },
  { id: 'adjust', label: '조정' },
  { id: 'overlay', label: '오버레이' },
  { id: 'body', label: '바디' },
];

export function EditorScreen() {
  const theme = useTheme();
  const nav = useNavigation();
  const route = useRoute<Route>();
  const copy = t();
  const { width } = useWindowDimensions();
  const previewSize = width;

  const variant = useVariant();
  const storedPhotoUri = useEditorStore((s) => s.photoUri);
  const adjustments = useEditorStore((s) => s.adjustments);
  const activePreset = useEditorStore((s) => s.activePreset);
  const mergeAdjustments = useEditorStore((s) => s.mergeAdjustments);
  const setAdjustment = useEditorStore((s) => s.setAdjustment);
  const reset = useEditorStore((s) => s.reset);
  const photoUri = route.params?.photoUri ?? storedPhotoUri;
  const showToast = useToast((s) => s.show);
  const [tab, setTab] = useState<EditorTab>('film');

  const bodyLabel = activePreset
    ? variant.bodies?.find((b) => b.id === activePreset.bodyId)?.label
    : undefined;
  const filmLabel = activePreset
    ? variant.films?.find((f) => f.id === activePreset.filmId)?.label
    : undefined;

  const image = useImage(photoUri ?? null);
  // useImage gracefully tolerates undefined (returns null) so the LUT pass
  // is dropped by FilteredImage's skip-pass logic when no preset is active.
  const lut = useImage(activePreset?.lutAsset ?? null);
  const filteredRef = useRef<FilteredImageHandle>(null);
  const [comparing, setComparing] = useState(false);
  const [saving, setSaving] = useState(false);

  const onSave = useCallback(async () => {
    if (!image || saving) return;
    setSaving(true);
    try {
      const snapshot = filteredRef.current?.snapshot();
      if (!snapshot) throw new Error('snapshot-failed');
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
  }, [image, saving, copy, showToast]);

  const onAuto = useCallback(() => {
    if (!image) return;
    haptic.tap();
    const histogram = sampleHistogram(image);
    if (!histogram) {
      showToast(copy.errors.loadPhoto, 'error');
      return;
    }
    const suggested = suggestAdjustments(histogram);
    // Only push the three fields autoAdjust actually computes — leave the
    // active preset's other defaults untouched.
    mergeAdjustments({
      exposure: suggested.exposure,
      shadows: suggested.shadows,
      highlights: suggested.highlights,
    });
    track('auto_applied', {
      exposure: suggested.exposure,
      shadows: suggested.shadows,
      highlights: suggested.highlights,
    });
  }, [image, mergeAdjustments, showToast, copy]);

  const onClose = useCallback(() => {
    reset();
    nav.goBack();
  }, [nav, reset]);

  const filtered = useMemo(
    () =>
      image ? (
        <FilteredImage
          ref={filteredRef}
          image={image}
          lut={lut ?? undefined}
          adjustments={adjustments}
          width={previewSize}
          height={previewSize}
        />
      ) : null,
    [image, lut, adjustments, previewSize],
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
        <View style={styles.headerCenter}>
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
          <Pressable onPress={onAuto} hitSlop={12} disabled={!image}>
            <Text
              style={[
                styles.auto,
                { color: !image ? theme.colors.textDimmed : theme.colors.textMuted },
              ]}
            >
              자동
            </Text>
          </Pressable>
        </View>
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

      <View style={[styles.preview, { width: previewSize, height: previewSize }]}>
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

      {activePreset ? (
        <View style={styles.intensity}>
          <IntensitySlider
            label="강도"
            value={adjustments.intensity}
            min={0}
            max={100}
            onChange={(v) => setAdjustment('intensity', v)}
          />
        </View>
      ) : null}

      <View style={[styles.tabs, { borderTopColor: theme.colors.border }]}>
        {TAB_LABELS.map((t) => {
          const isActive = tab === t.id;
          return (
            <Pressable
              key={t.id}
              onPress={() => setTab(t.id)}
              style={[styles.tab, isActive && { borderTopColor: theme.colors.accent }]}
            >
              <Text
                style={[
                  styles.tabLabel,
                  { color: isActive ? theme.colors.text : theme.colors.textMuted },
                ]}
              >
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView style={styles.controls}>
        {tab === 'film' ? (
          <>
            <PresetStrip />
            {bodyLabel && filmLabel ? (
              <Text style={[styles.bodyFilm, { color: theme.colors.textMuted }]}>
                {bodyLabel} × {filmLabel}
              </Text>
            ) : null}
          </>
        ) : null}
        {tab === 'adjust' ? <AdjustmentsPanel /> : null}
        {tab === 'overlay' || tab === 'body' ? (
          <View style={styles.placeholderPanel}>
            <Text style={[styles.placeholderText, { color: theme.colors.textDimmed }]}>
              준비 중
            </Text>
          </View>
        ) : null}
      </ScrollView>
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
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  title: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  auto: { fontSize: 13, fontWeight: '600', letterSpacing: -0.1 },
  save: { fontSize: 15, fontWeight: '700' },
  bodyFilm: {
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 8,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
    fontVariant: ['tabular-nums'],
  },
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
  intensity: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 4 },
  tabs: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: 'transparent',
  },
  tabLabel: { fontSize: 13, fontWeight: '600', letterSpacing: -0.2 },
  placeholderPanel: {
    paddingVertical: 40,
    alignItems: 'center',
  },
});
