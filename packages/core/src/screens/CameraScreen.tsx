// Camera: vision-camera preview with a bottom preset carousel, flash + flip
// controls, 3×3 framing grid, and a shutter that brand-fades to black + "F8"
// before pushing the captured frame into the editor.
//
// Live LUT preview is gated behind ENABLE_LIVE_LUT in
// services/cameraFrameProcessor.ts (needs react-native-worklets-core + a device
// build to profile). With the flag off, the chosen preset is committed to the
// editor store on shutter so EditorScreen renders the look immediately; with it
// on, the frame processor grades the live feed and the shutter saves WYSIWYG.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
  Image as RNImage,
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
import { F8Logo } from '../components/brand/F8Logo';
import type { Preset } from '../variant/types';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Camera'>;

type Facing = 'back' | 'front';
type Flash = 'off' | 'on' | 'auto';

// Carousel geometry. 64px tile + 8px gap = 72px stride so snapToInterval lands
// each tile flush against the 16px content inset.
const TILE = 64;
const TILE_GAP = 8;
const TILE_STRIDE = TILE + TILE_GAP; // 72

// FlatList separator — the 8px gap between tiles.
function CarouselGap() {
  return <View style={{ width: TILE_GAP }} />;
}

// Loose, deterministic EXIF feel — keyed off the active preset so the strip
// in the corner moves when the user changes the film. Not a real meter; the
// "f/8" stays put because that's the brand.
function fakeExif(preset: Preset | null): string {
  if (!preset) return 'ISO 400  ·  1/125  ·  f/8';
  const filmId = preset.filmId;
  let iso = 400;
  if (filmId.includes('160')) iso = 160;
  else if (filmId.includes('800')) iso = 800;
  else if (filmId.includes('50d')) iso = 50;
  else if (filmId.includes('200')) iso = 200;
  const shutter = preset.defaults.pushPull >= 0 ? '1/250' : '1/60';
  return `ISO ${iso}  ·  ${shutter}  ·  f/8`;
}

export function CameraScreen() {
  const theme = useTheme();
  const nav = useNavigation<Nav>();
  const copy = t();
  const variant = useVariant();
  const { hasPermission, requestPermission } = useCameraPermission();
  const [facing, setFacing] = useState<Facing>('back');
  const [flash, setFlash] = useState<Flash>('off');
  const [gridOn, setGridOn] = useState(true);
  const device = useCameraDevice(facing);
  const cameraRef = useRef<Camera>(null);
  const setPhoto = useEditorStore((s) => s.setPhoto);
  const setPreset = useEditorStore((s) => s.setPreset);
  const activePreset = useEditorStore((s) => s.activePreset);
  const ownedIds = useIapStore((s) => s.ownedPackIds);

  const fade = useRef(new Animated.Value(0)).current;
  const [shooting, setShooting] = useState(false);
  const showToast = useToast((s) => s.show);

  // Active preset's LUT, loaded once on the JS thread. Fed to the live frame
  // processor and reused on shutter for the WYSIWYG capture grade.
  const activeLut = useImage(activePreset?.lutAsset ?? null);
  const frameProcessor = useFilmFrameProcessor({ preset: activePreset, lut: activeLut });

  // Same filter rule as PresetStrip — defaults + every unlocked premium.
  const rail: Preset[] = useMemo(() => {
    const unlocked = variant.premiumPacks
      .filter((pack) => isPackUnlocked(pack.id, variant.iapProductIds, ownedIds))
      .flatMap((pack) => pack.presets);
    return [...variant.defaultPresets, ...unlocked];
  }, [variant.defaultPresets, variant.premiumPacks, variant.iapProductIds, ownedIds]);

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
    setShooting(true);
    haptic.shutter();
    track('photo_shot', { variant: variant.id, preset: activePreset?.id ?? null });

    try {
      const photo: PhotoFile = await cameraRef.current.takePhoto({ flash });
      const rawUri = photo.path.startsWith('file://') ? photo.path : `file://${photo.path}`;
      const uri = await normalizeImage(rawUri);

      if (ENABLE_LIVE_LUT) {
        // WYSIWYG: the live feed was LUT-graded, so re-apply the same LUT at
        // full intensity to the captured still and save it straight to the
        // gallery (watermark included) — no editor round-trip.
        const data = await Skia.Data.fromURI(uri);
        const still = Skia.Image.MakeImageFromEncoded(data);
        const graded = still ? renderLutStill(still, activeLut, 1) ?? still : null;
        if (!graded) throw new Error('snapshot-failed');
        await savePhoto(graded, variant.appName, { cityName: variant.cityName });
        haptic.success();
        track('photo_saved', { variant: variant.id });
        showToast(copy.editor.savedToast);
        brandFade(() => setShooting(false));
        return;
      }

      setPhoto(uri);
      // Keep the preset committed so EditorScreen renders the same look the
      // user framed through — applying via the live FilteredImage chain.
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
    brandFade,
    setPhoto,
    setPreset,
    activePreset,
    activeLut,
    flash,
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

  const onCycleFlash = useCallback(() => {
    haptic.tap();
    setFlash((f) => (f === 'off' ? 'on' : f === 'on' ? 'auto' : 'off'));
  }, []);

  // Bottom carousel tile: 64×64 thumb + Korean caption, beige border when
  // active. onTogglePreset already fires a selection haptic. Until real
  // filtered-preview PNGs ship, the thumb is the film's signature colour with a
  // centred "F8" wordmark (ink auto-contrasts against the background).
  const renderTile: ListRenderItem<Preset> = useCallback(
    ({ item }) => {
      const isActive = activePreset?.id === item.id;
      const bg = item.thumbnailColor ?? '#2A2A2A';
      return (
        <Pressable onPress={() => onTogglePreset(item)} style={styles.tile}>
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
            style={[styles.tileLabel, { color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.72)' }]}
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
          >
            <Text style={[styles.permBtnLabel, { color: theme.colors.bg }]}>설정 열기</Text>
          </Pressable>
          <Pressable onPress={() => nav.goBack()} style={styles.permBack}>
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
          <Pressable onPress={() => nav.goBack()} style={styles.permBack}>
            <Text style={[styles.permBackLabel, { color: theme.colors.textMuted }]}>
              {copy.common.cancel}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const filmName = activePreset?.name ?? '필름 없음';
  const exif = fakeExif(activePreset);
  const hasFlash = !!device.hasFlash;

  return (
    <View style={styles.root}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive
        photo
        frameProcessor={frameProcessor}
      />

      {gridOn ? <GridOverlay /> : null}

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.top}>
          <Pressable
            onPress={() => nav.goBack()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={copy.common.cancel}
          >
            <Text style={[styles.iconText, { color: '#FFFFFF' }]}>✕</Text>
          </Pressable>
          <View style={styles.topCenter}>
            <F8Logo size={18} color="#FFFFFF" />
            <Text style={styles.filmName} numberOfLines={1}>
              {filmName}
            </Text>
          </View>
          <View style={styles.topRight}>
            {hasFlash ? (
              <Pressable
                onPress={onCycleFlash}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={`플래시 ${flash}`}
              >
                <Text style={[styles.iconText, { color: flash === 'off' ? '#888' : '#FFD66B' }]}>
                  {flash === 'auto' ? 'A' : flash === 'on' ? '⚡' : '⚡̸'}
                </Text>
              </Pressable>
            ) : null}
            <Pressable
              onPress={onFlipFacing}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="카메라 전환"
            >
              <Text style={[styles.iconText, { color: '#FFFFFF' }]}>↺</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.exifWrap} pointerEvents="none">
          <Text style={styles.exif}>{exif}</Text>
        </View>

        {/* Spacer keeps the subject clear — the preset picker now lives in the
            bottom carousel instead of a side rail that covered ~30% of frame. */}
        <View style={styles.body} pointerEvents="box-none" />

        <View style={styles.carousel} pointerEvents="box-none">
          <FlatList
            data={rail}
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
        </View>

        <View style={styles.bottom}>
          <Pressable
            onPress={() => nav.replace('Home')}
            hitSlop={10}
            style={[styles.galleryThumb, { borderColor: 'rgba(255,255,255,0.4)' }]}
          >
            {typeof variant.defaultPresets[0]?.thumbnail === 'number' ? (
              <RNImage
                source={variant.defaultPresets[0].thumbnail}
                style={styles.galleryImg}
              />
            ) : null}
          </Pressable>

          <Pressable
            onPress={onShutter}
            disabled={shooting}
            accessibilityRole="button"
            accessibilityLabel="셔터"
            accessibilityHint="사진을 촬영합니다"
            style={[
              styles.shutter,
              { borderColor: '#FFFFFF', opacity: shooting ? 0.6 : 1 },
            ]}
          >
            <View style={[styles.shutterCore, { backgroundColor: '#FFFFFF' }]} />
          </Pressable>

          <Pressable
            onPress={() => {
              haptic.tap();
              setGridOn((v) => !v);
            }}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={gridOn ? '그리드 끄기' : '그리드 켜기'}
            style={styles.gridBtn}
          >
            <Text style={[styles.iconText, { color: gridOn ? theme.colors.accent : '#888' }]}>
              ⌗
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>

      <Animated.View
        pointerEvents="none"
        style={[styles.flash, { opacity: fade, backgroundColor: '#000' }]}
      >
        <F8Logo size={48} color="#FFFFFF" />
      </Animated.View>
    </View>
  );
}

// 3×3 rule-of-thirds grid. Lines sit at ~12% alpha so they don't fight the
// frame; tap the corner toggle on the bottom row to hide them.
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
  root: { flex: 1, backgroundColor: '#000' },
  overlay: { flex: 1, justifyContent: 'space-between' },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  topCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconText: { fontSize: 18, fontWeight: '700' },
  filmName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  exifWrap: { position: 'absolute', top: 56, left: 20 },
  exif: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontFamily: undefined,
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.6,
  },
  body: { flex: 1 },
  carousel: {
    // Sits just above the shutter row; ~88px tall (64 thumb + caption).
    paddingBottom: 12,
  },
  carouselContent: {
    paddingHorizontal: 16,
    alignItems: 'flex-start',
  },
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
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  tileImg: { width: '100%', height: '100%' },
  tileF8: { fontSize: 25, fontWeight: '900', letterSpacing: -0.5 },
  tileLabel: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: -0.2,
    maxWidth: TILE + 8,
    textAlign: 'center',
  },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  galleryThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  galleryImg: { width: '100%', height: '100%' },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterCore: { width: 60, height: 60, borderRadius: 30 },
  gridBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  permText: { fontSize: 16, fontWeight: '700' },
  permHint: { fontSize: 13, textAlign: 'center' },
  permBtn: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 10, marginTop: 4 },
  permBtnLabel: { fontSize: 15, fontWeight: '700' },
  permBack: { padding: 12, marginTop: 4 },
  permBackLabel: { fontSize: 14, fontWeight: '600' },
});
