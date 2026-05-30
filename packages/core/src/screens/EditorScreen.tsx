// Editor: Skia preview, preset strip, compare/share/save header, four bottom
// tabs (film / adjust / overlay / body) feeding adjustments into the shader
// chain. The "F8 Seoul"-style album name on save comes from variant.appName.
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
import { OverlaysPanel } from '../components/editor/OverlaysPanel';
import { PresetStrip } from '../components/editor/PresetStrip';
import { BodyPicker } from '../components/editor/BodyPicker';
import { CompareSlider } from '../components/editor/CompareSlider';
import { IntensitySlider } from '../components/editor/IntensitySlider';
import { useEditorStore } from '../store/editorStore';
import { useToast } from '../components/ui/Toast';
import { useVariant } from '../variant/VariantContext';
import { savePhoto, SavePhotoError } from '../services/savePhoto';
import { sharePhoto, SharePhotoError } from '../services/sharePhoto';
import { haptic } from '../services/haptics';
import { track } from '../services/analytics';
import { sampleHistogram } from '../engine/sampleHistogram';
import { suggestAdjustments } from '../engine/autoAdjust';
import type { RootStackParamList } from '../navigation/types';

type Route = RouteProp<RootStackParamList, 'Editor'>;

type EditorTab = 'film' | 'adjust' | 'overlay' | 'body';

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
  const currentBodyId = useEditorStore((s) => s.currentBodyId);
  const mergeAdjustments = useEditorStore((s) => s.mergeAdjustments);
  const setAdjustment = useEditorStore((s) => s.setAdjustment);
  const reset = useEditorStore((s) => s.reset);
  const photoUri = route.params?.photoUri ?? storedPhotoUri;
  const showToast = useToast((s) => s.show);
  const [tab, setTab] = useState<EditorTab>('film');

  // Resolve the active body: the store id, falling back to the first free body
  // so the render and the caption always have a concrete body to work with.
  const bodies = useMemo(() => variant.bodies ?? [], [variant.bodies]);
  const selectedBody = useMemo(() => {
    const firstFree = bodies.find((b) => !b.isPremium) ?? bodies[0];
    return bodies.find((b) => b.id === currentBodyId) ?? firstFree;
  }, [bodies, currentBodyId]);
  const bodyEffect = useMemo(
    () =>
      selectedBody
        ? {
            vignette: selectedBody.vignette,
            softness: selectedBody.softness,
            flareIntensity: selectedBody.flareIntensity,
          }
        : null,
    [selectedBody],
  );

  // Film stock shown in the caption: the preset's marketing display name,
  // falling back to the films-table label, then the raw filmId.
  const filmStockName = activePreset
    ? activePreset.filmStockDisplayName ??
      variant.films?.find((f) => f.id === activePreset.filmId)?.label ??
      activePreset.filmId
    : undefined;

  const image = useImage(photoUri ?? null);
  // useImage gracefully tolerates undefined (returns null) so the LUT pass
  // is dropped by FilteredImage's skip-pass logic when no preset is active.
  const lut = useImage(activePreset?.lutAsset ?? null);
  const filteredRef = useRef<FilteredImageHandle>(null);
  const [comparing, setComparing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);

  const TAB_LABELS = useMemo<Array<{ id: EditorTab; label: string }>>(
    () => [
      { id: 'film', label: copy.editor.tabs.film },
      { id: 'adjust', label: copy.editor.tabs.adjust },
      { id: 'overlay', label: copy.editor.tabs.overlay },
      { id: 'body', label: copy.editor.tabs.body },
    ],
    [copy],
  );

  const onSave = useCallback(async () => {
    if (!image || saving) return;
    setSaving(true);
    try {
      const snapshot = filteredRef.current?.snapshot();
      if (!snapshot) throw new SavePhotoError('snapshot-failed');
      console.log('[F8][editor] saving with watermark:', { cityName: variant.cityName });
      await savePhoto(snapshot, variant.appName, { cityName: variant.cityName });
      haptic.success();
      track('photo_saved', { variant: variant.id });
      showToast(copy.editor.savedToast);
    } catch (err) {
      haptic.error();
      const message =
        err instanceof SavePhotoError && err.code === 'permission-denied'
          ? copy.errors.permissionDenied
          : copy.errors.saveFailed;
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  }, [image, saving, copy, showToast, variant]);

  const onShare = useCallback(async () => {
    if (!image || sharing) return;
    setSharing(true);
    try {
      const snapshot = filteredRef.current?.snapshot();
      if (!snapshot) throw new SharePhotoError('snapshot-failed');
      await sharePhoto(snapshot, { cityName: variant.cityName });
      track('photo_shared', { variant: variant.id });
    } catch {
      haptic.error();
      showToast(copy.errors.shareFailed, 'error');
    } finally {
      setSharing(false);
    }
  }, [image, sharing, copy, showToast, variant]);

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

  const onCompareToggle = useCallback(() => {
    haptic.tap();
    setComparing((v) => !v);
  }, []);

  const filtered = useMemo(
    () =>
      image ? (
        <FilteredImage
          ref={filteredRef}
          image={image}
          lut={lut ?? undefined}
          adjustments={adjustments}
          body={bodyEffect}
          width={previewSize}
          height={previewSize}
        />
      ) : null,
    [image, lut, adjustments, bodyEffect, previewSize],
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

  const saveEnabled = !!image && !saving;
  const shareEnabled = !!image && !sharing;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.bg }]}>
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={12}>
          <Text style={[styles.back, { color: theme.colors.textMuted }]}>{copy.common.cancel}</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Pressable
            onPress={onCompareToggle}
            hitSlop={12}
            disabled={!image}
            accessibilityRole="button"
            accessibilityLabel={copy.editor.compare}
            accessibilityState={{ selected: comparing, disabled: !image }}
          >
            <Text
              style={[
                styles.title,
                {
                  color: !image
                    ? theme.colors.textDimmed
                    : comparing
                    ? theme.colors.accent
                    : theme.colors.text,
                },
              ]}
            >
              {copy.editor.compare}
            </Text>
          </Pressable>
          <Pressable
            onPress={onAuto}
            hitSlop={12}
            disabled={!image}
            accessibilityRole="button"
            accessibilityLabel={copy.editor.auto}
          >
            <Text
              style={[
                styles.auto,
                { color: !image ? theme.colors.textDimmed : theme.colors.textMuted },
              ]}
            >
              {copy.editor.auto}
            </Text>
          </Pressable>
        </View>
        <View style={styles.headerRight}>
          <Pressable
            onPress={onShare}
            hitSlop={12}
            disabled={!shareEnabled}
            accessibilityRole="button"
            accessibilityLabel={copy.editor.share}
          >
            <Text
              style={[
                styles.share,
                { color: !shareEnabled ? theme.colors.textDimmed : theme.colors.text },
              ]}
            >
              {copy.editor.share}
            </Text>
          </Pressable>
          <Pressable
            onPress={onSave}
            hitSlop={12}
            disabled={!saveEnabled}
            accessibilityRole="button"
            accessibilityLabel={copy.common.save}
          >
            <Text
              style={[
                styles.save,
                { color: !saveEnabled ? theme.colors.textDimmed : theme.colors.accent },
              ]}
            >
              {copy.common.save}
            </Text>
          </Pressable>
        </View>
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
            label={copy.editor.intensity}
            value={adjustments.intensity}
            min={0}
            max={100}
            onChange={(v) => setAdjustment('intensity', v)}
          />
        </View>
      ) : null}

      <View style={[styles.tabs, { borderTopColor: theme.colors.border }]}>
        {TAB_LABELS.map((entry) => {
          const isActive = tab === entry.id;
          return (
            <Pressable
              key={entry.id}
              onPress={() => setTab(entry.id)}
              style={[styles.tab, isActive && { borderTopColor: theme.colors.accent }]}
            >
              <Text
                style={[
                  styles.tabLabel,
                  { color: isActive ? theme.colors.text : theme.colors.textMuted },
                ]}
              >
                {entry.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView style={styles.controls}>
        {tab === 'film' ? (
          <>
            <PresetStrip />
            {activePreset && selectedBody ? (
              <Text style={[styles.bodyFilm, { color: theme.colors.textMuted }]}>
                {selectedBody.name} × {filmStockName}
              </Text>
            ) : null}
          </>
        ) : null}
        {tab === 'adjust' ? <AdjustmentsPanel /> : null}
        {tab === 'overlay' ? <OverlaysPanel /> : null}
        {tab === 'body' ? <BodyPicker /> : null}
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
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  title: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  auto: { fontSize: 13, fontWeight: '600', letterSpacing: -0.1 },
  share: { fontSize: 14, fontWeight: '600' },
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
