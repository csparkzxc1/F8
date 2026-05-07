// Camera: vision-camera preview + shutter. After shutter, fade to F8 0.5s
// then push the captured photo into the editor.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  type PhotoFile,
} from 'react-native-vision-camera';
import { useTheme } from '../theme/ThemeProvider';
import { F8Logo } from '../components/brand/F8Logo';
import { useEditorStore } from '../store/editorStore';
import { haptic } from '../services/haptics';
import { track } from '../services/analytics';
import { t } from '../i18n';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Camera'>;

export function CameraScreen() {
  const theme = useTheme();
  const nav = useNavigation<Nav>();
  const copy = t();
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const cameraRef = useRef<Camera>(null);
  const setPhoto = useEditorStore((s) => s.setPhoto);

  const fade = useRef(new Animated.Value(0)).current;
  const [shooting, setShooting] = useState(false);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const onShutter = useCallback(async () => {
    if (!cameraRef.current || shooting) return;
    setShooting(true);
    haptic.shutter();
    track('photo_shot');

    const photo: PhotoFile = await cameraRef.current.takePhoto({
      flash: 'off',
    });
    const uri = photo.path.startsWith('file://') ? photo.path : `file://${photo.path}`;
    setPhoto(uri);

    Animated.sequence([
      Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(120),
      Animated.timing(fade, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(() => {
      setShooting(false);
      nav.replace('Editor', { photoUri: uri });
    });
  }, [shooting, fade, setPhoto, nav]);

  if (!device || !hasPermission) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.bg }]}>
        <View style={styles.center}>
          <Text style={[styles.permText, { color: theme.colors.text }]}>
            카메라 권한이 필요합니다.
          </Text>
          <Pressable onPress={() => requestPermission()} style={styles.permBtn}>
            <Text style={[styles.permBtnLabel, { color: theme.colors.accent }]}>
              {copy.common.retry}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      <Camera ref={cameraRef} style={StyleSheet.absoluteFill} device={device} isActive photo />

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.top}>
          <Pressable onPress={() => nav.goBack()} hitSlop={12}>
            <Text style={[styles.close, { color: theme.colors.text }]}>{copy.common.cancel}</Text>
          </Pressable>
        </View>
        <View style={styles.bottom}>
          <Pressable
            onPress={onShutter}
            disabled={shooting}
            style={[styles.shutter, { borderColor: theme.colors.text }]}
          >
            <View style={[styles.shutterCore, { backgroundColor: theme.colors.text }]} />
          </Pressable>
        </View>
      </SafeAreaView>

      <Animated.View
        pointerEvents="none"
        style={[styles.flash, { opacity: fade, backgroundColor: '#000' }]}
      >
        <F8Logo size={64} color={theme.colors.text} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  overlay: { flex: 1, justifyContent: 'space-between' },
  top: { padding: 20 },
  close: { fontSize: 16, fontWeight: '600' },
  bottom: { alignItems: 'center', paddingBottom: 40 },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterCore: { width: 60, height: 60, borderRadius: 30 },
  flash: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  permText: { fontSize: 15 },
  permBtn: { padding: 12 },
  permBtnLabel: { fontSize: 15, fontWeight: '700' },
});
