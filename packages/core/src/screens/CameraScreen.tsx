// Camera screen — F8 brand layout with the reference's stacked control deck:
//   close / grid / store         (top bar)
//   ┌─── camera preview ───┐    (inset, rounded)
//   [0.5x] [1x] [2x] [5x]       (zoom)
//   ★ ──●──────── ★            (live LUT strength)
//   ★  시간  계절  일상  감성   (category tabs)
//   ▣ ▣ ▣ ▣ ▣ ▣ ▣ ▣           (preset carousel)
//        Photo  Video           (mode toggle, video disabled v1)
//   [▣]      ◯       [↻]        (gallery / shutter / flip)
//
// Live LUT preview is gated behind ENABLE_LIVE_LUT (cameraFrameProcessor.ts).
// With it on, the strength slider talks directly to the frame processor's
// intensity SharedValue, and the shutter saves a WYSIWYG capture through
// renderLutStill at the same strength.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Linking,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
  Image as RNImage,
  type GestureResponderEvent,
  type LayoutChangeEvent,
  type ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  type PhotoFile,
} from 'react-native-vision-camera';
import { Skia, useImage } from '@shopify/react-native-skia';
import {
  Grid3x3,
  Image as GalleryIcon,
  RotateCw,
  Sparkles,
  Star,
  X,
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useVariant } from '../variant/VariantContext';
import { useEditorStore } from '../store/editorStore';
import { useIapStore, isPackUnlocked } from '../store/iapStore';
import { useFilmFrameProcessor, ENABLE_LIVE_LUT } from '../services/cameraFrameProcessor';
import { renderLutStill } from '../engine/renderLutStill';
import { inkOn } from '../utils/applyWatermark';
import { savePhoto } from '../services/savePhoto';
import { haptic } from '../services/haptics';
import { track } from '../services/analytics';
import { normalizeImage } from '../services/normalizeImage';
import { useToast } from '../components/ui/Toast';
import { t } from '../i18n';
import type { Preset, PresetCategory } from '../variant/types';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Camera'>;

type Facing = 'back' | 'front';
type Mode = 'photo' | 'video';

const TILE = 56;
const TILE_GAP = 8;
const TILE_STRIDE = TILE + TILE_GAP;

const ZOOMS = [0.5, 1, 2, 5] as const;
type Zoom = (typeof ZOOMS)[number];

type CategoryTab = { id: 'all' | PresetCategory; label: string };
const CATEGORIES: ReadonlyArray<CategoryTab> = [
  { id: 'all', label: '★' },
  { id: 'time', label: '시간' },
  { id: 'season', label: '계절' },
  { id: 'daily', label: '일상' },
  { id: 'mood', label: '감성' },
];

function CarouselGap() {
  return <View style={{ width: TILE_GAP }} />;
}

export function CameraScreen() {
  const theme = useTheme();
  const nav = useNavigation<Nav>();
  const copy = t();
  const variant = useVariant();
  const { hasPermission, requestPermission } = useCameraPermission();
  const [facing, setFacing] = useState<Facing>('back');
  const [gridOn, setGridOn] = useState(false);
  const [zoom, setZoom] = useState<Zoom>(1);
  const [strength, setStrength] = useState(100);
  const [category, setCategory] = useState<CategoryTab['id']>('all');
  const [mode, setMode] = useState<Mode>('photo');
  const device = useCameraDevice(facing);
  const cameraRef = useRef<Camera>(null);
  const setPhoto = useEditorStore((s) => s.setPhoto);
  const setPreset = useEditorStore((s) => s.setPreset);
  const activePreset = useEditorStore((s) => s.activePreset);
  const ownedIds = useIapStore((s) => s.ownedPackIds);
  const showToast = useToast((s) => s.show);

  const fade = useRef(new Animated.Value(0)).current;
  const [shooting, setShooting] = useState(false);

  // Active preset's LUT (loaded once on JS) + a 0..1 strength to drive the
  // frame processor's SharedValue. Strength=0 makes the processor pass-through.
  const activeLut = useImage(activePreset?.lutAsset ?? null);
  const intensity = strength / 100;
  const frameProcessor = useFilmFrameProcessor({
    preset: activePreset,
    lut: activeLut,
    intensity,
  });

  // Defaults + every unlocked premium. Untouched by the category filter — the
  // tabs gate the carousel only, never the set itself.
  const allPresets: Preset[] = useMemo(() => {
    const unlocked = variant.premiumPacks
      .filter((pack) => isPackUnlocked(pack.id, variant.iapProductIds, ownedIds))
      .flatMap((pack) => pack.presets);
    return [...variant.defaultPresets, ...unlocked];
  }, [variant.defaultPresets, variant.premiumPacks, variant.iapProductIds, ownedIds]);

  const visiblePresets = useMemo(
    () =>
      category === 'all'
        ? allPresets
        : allPresets.filter((p) => p.category === category),
    [allPresets, category],
  );

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const brandFade = useCallback(
    (onDone: () => void) => {
      Animated.sequence([
        Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(120),
        Animated.timing(fade, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start(onDone);
    },
    [fade],
  );

  const onShutter = useCallback(async () => {
    if (!cameraRef.current || shooting) return;
    if (mode === 'video') {
      haptic.tap();
      showToast('동영상은 곧 출시.');
      return;
    }
    setShooting(true);
    haptic.shutter();
    track('photo_shot', { variant: variant.id, preset: activePreset?.id ?? null });

    try {
      const photo: PhotoFile = await cameraRef.current.takePhoto({ flash: 'off' });
      const rawUri = photo.path.startsWith('file://') ? photo.path : `file://${photo.path}`;
      const uri = await normalizeImage(rawUri);

      if (ENABLE_LIVE_LUT) {
        const data = await Skia.Data.fromURI(uri);
        const still = Skia.Image.MakeImageFromEncoded(data);
        const graded = still ? renderLutStill(still, activeLut, intensity) ?? still : null;
        if (!graded) throw new Error('snapshot-failed');
        await savePhoto(graded, variant.appName, { cityName: variant.cityName });
        haptic.success();
        track('photo_saved', { variant: variant.id });
        showToast(copy.editor.savedToast);
        brandFade(() => setShooting(false));
        return;
      }

      setPhoto(uri);
      if (activePreset) setPreset(activePreset);
      brandFade(() => {
        setShooting(false);
        nav.replace('Editor', { photoUri: uri });
      });
    } catch {
      setShooting(false);
      haptic.error();
    }
  }, [
    shooting,
    mode,
    brandFade,
    setPhoto,
    setPreset,
    activePreset,
    activeLut,
    intensity,
    nav,
    variant.id,
    variant.appName,
    variant.cityName,
    showToast,
    copy.editor.savedToast,
  ]);

  const onTogglePreset = useCallback(
    (preset: Preset) => {
      haptic.tap();
      setPreset(activePreset?.id === preset.id ? null : preset);
      if (activePreset?.id !== preset.id) {
        track('preset_applied', { id: preset.id, premium: preset.isPremium });
      }
    },
    [activePreset, setPreset],
  );

  const onFlipFacing = useCallback(() => {
    haptic.tap();
    setFacing((f) => (f === 'back' ? 'front' : 'back'));
  }, []);

  const onSetZoom = useCallback((z: Zoom) => {
    haptic.tap();
    setZoom(z);
  }, []);

  const onSetCategory = useCallback((id: CategoryTab['id']) => {
    haptic.tap();
    setCategory(id);
  }, []);

  const onSetMode = useCallback((m: Mode) => {
    haptic.tap();
    setMode(m);
  }, []);

  const renderTile: ListRenderItem<Preset> = useCallback(
    ({ item }) => {
      const isActive = activePreset?.id === item.id;
      const bg = item.thumbnailColor ?? '#2A2A2A';
      return (
        <Pressable
          onPress={() => onTogglePreset(item)}
          accessibilityRole="button"
          accessibilityLabel={item.name}
          style={styles.tile}
        >
          <View
            style={[
              styles.tileThumb,
              { backgroundColor: bg },
              isActive && { borderColor: theme.colors.accent, borderWidth: 2 },
            ]}
          >
            {typeof item.thumbnail === 'number' ? (
              <RNImage source={item.thumbnail} style={styles.tileImg} />
            ) : (
              <Text style={[styles.tileF8, { color: inkOn(bg) }]}>F8</Text>
            )}
          </View>
          <Text
            style={[
              styles.tileLabel,
              { color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.65)' },
            ]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
        </Pressable>
      );
    },
    [activePreset, onTogglePreset, theme.colors.accent],
  );

  // Permission-denied path: deep-link to the OS settings page.
  if (!hasPermission) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.bg }]}>
        <View style={styles.center}>
          <Text style={[styles.permText, { color: theme.colors.text }]}>
            {copy.errors.permissionDenied}
          </Text>
          <Text style={[styles.permHint, { color: theme.colors.textMuted }]}>
            설정에서 카메라 권한을 허용해주세요.
          </Text>
          <Pressable
            onPress={() => Linking.openSettings().catch(() => undefined)}
            style={[styles.permBtn, { backgroundColor: theme.colors.accent }]}
            accessibilityRole="button"
            accessibilityLabel="설정 열기"
          >
            <Text style={[styles.permBtnLabel, { color: theme.colors.bg }]}>설정 열기</Text>
          </Pressable>
          <Pressable
            onPress={() => nav.goBack()}
            style={styles.permBack}
            accessibilityRole="button"
            accessibilityLabel={copy.common.cancel}
          >
            <Text style={[styles.permBackLabel, { color: theme.colors.textMuted }]}>
              {copy.common.cancel}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (!device) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.bg }]}>
        <View style={styles.center}>
          <Text style={[styles.permText, { color: theme.colors.text }]}>
            카메라를 찾지 못했습니다.
          </Text>
          <Pressable
            onPress={() => nav.goBack()}
            style={styles.permBack}
            accessibilityRole="button"
            accessibilityLabel={copy.common.cancel}
          >
            <Text style={[styles.permBackLabel, { color: theme.colors.textMuted }]}>
              {copy.common.cancel}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Clamp the chosen zoom to the device's reported range so vision-camera
  // doesn't throw on hardware without an ultra-wide or telephoto.
  const clampedZoom = Math.max(device.minZoom, Math.min(device.maxZoom, zoom));

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.bg }]}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => nav.goBack()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={copy.common.cancel}
          style={styles.topBtn}
        >
          <X size={22} color={theme.colors.text} strokeWidth={1.7} />
        </Pressable>
        <View style={styles.topRight}>
          <Pressable
            onPress={() => {
              haptic.tap();
              setGridOn((v) => !v);
            }}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={gridOn ? '그리드 끄기' : '그리드 켜기'}
            style={styles.topBtn}
          >
            <Grid3x3
              size={20}
              color={gridOn ? theme.colors.accent : theme.colors.textMuted}
              strokeWidth={1.7}
            />
          </Pressable>
          <Pressable
            onPress={() => {
              haptic.tap();
              nav.navigate('PresetStore');
            }}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="프리셋 스토어"
            style={styles.topBtn}
          >
            <Sparkles size={20} color={theme.colors.accent} strokeWidth={1.7} />
          </Pressable>
        </View>
      </View>

      <View
        style={[
          styles.previewWrap,
          { borderColor: theme.colors.border, backgroundColor: '#000' },
        ]}
      >
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive
          photo
          zoom={clampedZoom}
          frameProcessor={frameProcessor}
        />
        {gridOn ? <GridOverlay /> : null}
      </View>

      <View style={styles.zoomRow}>
        {ZOOMS.map((z) => {
          const isActive = z === zoom;
          return (
            <Pressable
              key={z}
              onPress={() => onSetZoom(z)}
              accessibilityRole="button"
              accessibilityLabel={`${z}x 줌`}
              style={[
                styles.zoomPill,
                {
                  borderColor: isActive ? theme.colors.accent : 'rgba(255,255,255,0.18)',
                  backgroundColor: isActive ? 'rgba(232,195,158,0.12)' : 'rgba(255,255,255,0.04)',
                },
              ]}
            >
              <Text
                style={[
                  styles.zoomLabel,
                  { color: isActive ? theme.colors.accent : theme.colors.textMuted },
                ]}
              >
                {z}x
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.strengthRow}>
        <Star size={14} color={theme.colors.textMuted} strokeWidth={1.7} />
        <StrengthBar
          value={strength}
          onChange={setStrength}
          trackColor={theme.colors.border}
          fillColor={theme.colors.accent}
          thumbColor={theme.colors.text}
        />
        <Star size={18} color={theme.colors.accent} strokeWidth={2} fill={theme.colors.accent} />
      </View>

      <View style={styles.categoryRow}>
        {CATEGORIES.map((c) => {
          const isActive = c.id === category;
          return (
            <Pressable
              key={c.id}
              onPress={() => onSetCategory(c.id)}
              accessibilityRole="button"
              accessibilityLabel={c.label}
              accessibilityState={{ selected: isActive }}
              style={styles.categoryBtn}
            >
              <Text
                style={[
                  styles.categoryLabel,
                  {
                    color: isActive ? theme.colors.text : theme.colors.textMuted,
                    fontWeight: isActive ? '800' : '600',
                  },
                ]}
              >
                {c.label}
              </Text>
              <View
                style={[
                  styles.categoryUnderline,
                  { backgroundColor: isActive ? theme.colors.accent : 'transparent' },
                ]}
              />
            </Pressable>
          );
        })}
      </View>

      <View style={styles.carousel}>
        {visiblePresets.length === 0 ? (
          <Text style={[styles.carouselEmpty, { color: theme.colors.textDimmed }]}>
            이 카테고리에 프리셋이 없습니다.
          </Text>
        ) : (
          <FlatList
            data={visiblePresets}
            keyExtractor={(p) => p.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContent}
            ItemSeparatorComponent={CarouselGap}
            snapToInterval={TILE_STRIDE}
            snapToAlignment="start"
            decelerationRate="fast"
            renderItem={renderTile}
          />
        )}
      </View>

      <View style={styles.modeRow}>
        {(['photo', 'video'] as const).map((m) => {
          const isActive = m === mode;
          return (
            <Pressable
              key={m}
              onPress={() => onSetMode(m)}
              accessibilityRole="button"
              accessibilityLabel={m === 'photo' ? '사진 모드' : '동영상 모드'}
              accessibilityState={{ selected: isActive }}
              style={styles.modeBtn}
            >
              <Text
                style={[
                  styles.modeLabel,
                  {
                    color: isActive ? theme.colors.text : theme.colors.textMuted,
                    fontWeight: isActive ? '800' : '600',
                  },
                ]}
              >
                {m === 'photo' ? '사진' : '동영상'}
              </Text>
              <View
                style={[
                  styles.modeUnderline,
                  { backgroundColor: isActive ? theme.colors.accent : 'transparent' },
                ]}
              />
            </Pressable>
          );
        })}
      </View>

      <View style={styles.bottom}>
        <Pressable
          onPress={() => {
            haptic.tap();
            nav.replace('Home');
          }}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="갤러리"
          style={[
            styles.gallery,
            {
              borderColor: 'rgba(255,255,255,0.2)',
              backgroundColor: 'rgba(255,255,255,0.04)',
            },
          ]}
        >
          <GalleryIcon size={20} color={theme.colors.text} strokeWidth={1.7} />
        </Pressable>

        <Pressable
          onPress={onShutter}
          disabled={shooting}
          accessibilityRole="button"
          accessibilityLabel={mode === 'photo' ? '셔터' : '녹화'}
          style={[
            styles.shutter,
            { borderColor: '#FFFFFF', opacity: shooting ? 0.6 : 1 },
          ]}
        >
          <View
            style={[
              styles.shutterCore,
              mode === 'video'
                ? { backgroundColor: '#E04A4A' }
                : { backgroundColor: '#FFFFFF' },
            ]}
          />
        </Pressable>

        <Pressable
          onPress={onFlipFacing}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="카메라 전환"
          style={[
            styles.gallery,
            {
              borderColor: 'rgba(255,255,255,0.2)',
              backgroundColor: 'rgba(255,255,255,0.04)',
            },
          ]}
        >
          <RotateCw size={20} color={theme.colors.text} strokeWidth={1.7} />
        </Pressable>
      </View>

      <Animated.View
        pointerEvents="none"
        style={[styles.flash, { opacity: fade, backgroundColor: '#000' }]}
      />
    </SafeAreaView>
  );
}

// Slim PanResponder slider — the editor's IntensitySlider has a label/value
// header that doesn't fit the camera's tight strip.
function StrengthBar({
  value,
  onChange,
  trackColor,
  fillColor,
  thumbColor,
}: {
  value: number;
  onChange: (v: number) => void;
  trackColor: string;
  fillColor: string;
  thumbColor: string;
}) {
  const [width, setWidth] = useState(0);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  }, []);

  const apply = useCallback(
    (localX: number) => {
      if (width <= 0) return;
      const ratio = Math.max(0, Math.min(1, localX / width));
      onChange(ratio * 100);
    },
    [width, onChange],
  );

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt: GestureResponderEvent) => apply(evt.nativeEvent.locationX),
        onPanResponderMove: (evt: GestureResponderEvent) => apply(evt.nativeEvent.locationX),
      }),
    [apply],
  );

  const ratio = Math.max(0, Math.min(1, value / 100));
  const fillW = ratio * width;

  return (
    <View
      onLayout={onLayout}
      {...responder.panHandlers}
      accessibilityRole="adjustable"
      accessibilityLabel="강도"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(value) }}
      style={styles.strengthHit}
    >
      <View pointerEvents="none" style={[styles.strengthTrack, { backgroundColor: trackColor }]}>
        <View style={[styles.strengthFill, { width: fillW, backgroundColor: fillColor }]} />
      </View>
      <View
        pointerEvents="none"
        style={[
          styles.strengthThumb,
          {
            left: Math.max(0, fillW - 7),
            backgroundColor: thumbColor,
            borderColor: fillColor,
          },
        ]}
      />
    </View>
  );
}

function GridOverlay() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.gridLineV, { left: '33.33%' }]} />
      <View style={[styles.gridLineV, { left: '66.66%' }]} />
      <View style={[styles.gridLineH, { top: '33.33%' }]} />
      <View style={[styles.gridLineH, { top: '66.66%' }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  topBtn: { padding: 8 },

  previewWrap: {
    marginHorizontal: 16,
    aspectRatio: 3 / 4,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },

  zoomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 12,
  },
  zoomPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  zoomLabel: { fontSize: 13, fontWeight: '700', fontVariant: ['tabular-nums'] },

  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 28,
    paddingTop: 14,
  },
  // 24px-tall hit area so the finger doesn't have to land on the 4px line.
  // The visual track sits inside it; the thumb floats above. Both inner views
  // are pointerEvents="none" so PanResponder.locationX stays relative to this
  // wrapper and never gets hijacked by the thumb the moment it moves under
  // the finger.
  strengthHit: {
    flex: 1,
    height: 24,
    justifyContent: 'center',
    position: 'relative',
  },
  strengthTrack: { height: 4, borderRadius: 2, width: '100%' },
  strengthFill: { height: 4, borderRadius: 2 },
  strengthThumb: {
    position: 'absolute',
    top: 5,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },

  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  categoryBtn: { alignItems: 'center', paddingVertical: 6, paddingHorizontal: 6 },
  categoryLabel: { fontSize: 13, letterSpacing: -0.2 },
  categoryUnderline: { marginTop: 4, width: 16, height: 2, borderRadius: 1 },

  carousel: { paddingTop: 8, minHeight: TILE + 28 },
  carouselContent: { paddingHorizontal: 16, alignItems: 'flex-start' },
  carouselEmpty: { fontSize: 12, paddingHorizontal: 24, paddingVertical: 16 },
  tile: { width: TILE, alignItems: 'center' },
  tileThumb: {
    width: TILE,
    height: TILE,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileImg: { width: '100%', height: '100%' },
  tileF8: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  tileLabel: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: -0.2,
    maxWidth: TILE + 8,
    textAlign: 'center',
  },

  modeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingTop: 6,
    paddingBottom: 4,
  },
  modeBtn: { alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4 },
  modeLabel: { fontSize: 12, letterSpacing: 0.4, textTransform: 'uppercase' },
  modeUnderline: { marginTop: 3, width: 20, height: 2, borderRadius: 1 },

  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingTop: 10,
    paddingBottom: 16,
  },
  gallery: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutter: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterCore: { width: 56, height: 56, borderRadius: 28 },

  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },

  flash: { ...StyleSheet.absoluteFillObject },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  permText: { fontSize: 16, fontWeight: '700' },
  permHint: { fontSize: 13, textAlign: 'center' },
  permBtn: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 10, marginTop: 4 },
  permBtnLabel: { fontSize: 15, fontWeight: '700' },
  permBack: { padding: 12, marginTop: 4 },
  permBackLabel: { fontSize: 14, fontWeight: '600' },
});
