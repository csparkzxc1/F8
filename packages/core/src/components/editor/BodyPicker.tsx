// Horizontal camera-body strip for the editor's [body] tab. Each card shows a
// minimal camera glyph, the body name, and a one-line description. The selected
// body gets a beige (accent) outline; locked premium bodies dim out with a lock
// badge and route to the store on tap.
//
// Selection is independent of the active preset: picking a preset recommends
// its bodyId (see editorStore.setPreset), and tapping here overrides it until
// the next preset change. The body's optical character (vignette / softness /
// flare) is composited by FilteredImage via EditorScreen.
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Camera } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useVariant } from '../../variant/VariantContext';
import { useEditorStore } from '../../store/editorStore';
import { useIapStore, isPackUnlocked } from '../../store/iapStore';
import { useTheme } from '../../theme/ThemeProvider';
import { haptic } from '../../services/haptics';
import { track } from '../../services/analytics';
import type { CameraBody } from '../../variant/types';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function BodyPicker() {
  const theme = useTheme();
  const variant = useVariant();
  const nav = useNavigation<Nav>();
  const currentBodyId = useEditorStore((s) => s.currentBodyId);
  const setCurrentBodyId = useEditorStore((s) => s.setCurrentBodyId);
  const ownedIds = useIapStore((s) => s.ownedPackIds);

  const bodies = useMemo(() => variant.bodies ?? [], [variant.bodies]);

  // Premium bodies ship with the premium pack(s); unlock when any is owned.
  const anyPackUnlocked = useMemo(
    () => variant.premiumPacks.some((p) => isPackUnlocked(p.id, variant.iapProductIds, ownedIds)),
    [variant.premiumPacks, variant.iapProductIds, ownedIds],
  );

  // Mirror EditorScreen's resolution: an unknown/null id falls back to the
  // first free body so the strip always shows a live selection.
  const firstFree = useMemo(() => bodies.find((b) => !b.isPremium) ?? bodies[0], [bodies]);
  const selectedId = bodies.find((b) => b.id === currentBodyId)?.id ?? firstFree?.id;

  if (bodies.length === 0) return null;

  const onTap = (body: CameraBody, locked: boolean) => {
    haptic.tap();
    if (locked) {
      nav.navigate('PresetStore');
      return;
    }
    setCurrentBodyId(body.id);
    track('body_applied', { id: body.id, premium: body.isPremium });
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
    >
      {bodies.map((body) => {
        const selected = body.id === selectedId;
        const locked = body.isPremium && !anyPackUnlocked;
        const tint = selected ? theme.colors.text : theme.colors.textMuted;
        return (
          <Pressable
            key={body.id}
            onPress={() => onTap(body, locked)}
            accessibilityRole="button"
            accessibilityLabel={body.name}
            accessibilityState={{ selected, disabled: locked }}
            style={[
              styles.card,
              {
                borderColor: selected ? theme.colors.accent : theme.colors.border,
                backgroundColor: selected ? theme.colors.surface : 'transparent',
                opacity: locked ? 0.5 : 1,
              },
            ]}
          >
            <View style={styles.iconWrap}>
              <Camera size={28} color={tint} />
              {locked ? (
                <View
                  style={[
                    styles.lock,
                    { backgroundColor: theme.colors.bg, borderColor: theme.colors.accent },
                  ]}
                >
                  <Text style={[styles.lockText, { color: theme.colors.accent }]}>🔒</Text>
                </View>
              ) : null}
            </View>
            <Text numberOfLines={1} style={[styles.name, { color: tint }]}>
              {body.name}
            </Text>
            <Text numberOfLines={1} style={[styles.desc, { color: theme.colors.textDimmed }]}>
              {body.description}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 24, gap: 12, paddingVertical: 12 },
  card: {
    width: 90,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 6,
    gap: 6,
  },
  iconWrap: {
    width: '100%',
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lock: {
    position: 'absolute',
    top: -4,
    left: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockText: { fontSize: 9 },
  name: { fontSize: 13, fontWeight: '500', letterSpacing: -0.2 },
  desc: { fontSize: 10 },
});
