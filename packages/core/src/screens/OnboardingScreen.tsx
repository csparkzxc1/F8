// Onboarding: 3 slides driven by variant.copy.onboarding. F8 voice.
// First slide is the F8 wordmark, second leans into the Weegee quote with a
// sepia wash, third is a warm sunset gradient + the start CTA in accent.
//
// Persists `hasSeenOnboarding` so cold starts after first run skip straight
// to Home.
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useVariant } from '../variant/VariantContext';
import { useTheme } from '../theme/ThemeProvider';
import { Slogan } from '../components/brand/Slogan';
import { F8Logo } from '../components/brand/F8Logo';
import { haptic } from '../services/haptics';
import { track } from '../services/analytics';
import { t } from '../i18n';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

const SEEN_KEY = 'f8.onboarding.v1';

// Per-slide background tints. No images needed — sepia and warm gradients
// land via stacked translucent rectangles over the base theme background.
const SLIDE_TINTS: ReadonlyArray<readonly [string, string]> = [
  ['#000000', '#000000'],
  ['#2a1f14', '#0A0A0A'], // sepia → black
  ['#3a2618', '#1a1310'], // warm sunset
];

export function OnboardingScreen() {
  const variant = useVariant();
  const theme = useTheme();
  const nav = useNavigation<Nav>();
  const copy = t();
  const slides = variant.copy.onboarding;
  const [index, setIndex] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(SEEN_KEY)
      .then((v) => {
        if (v === 'true') {
          nav.replace('Home');
        } else {
          setHydrated(true);
        }
      })
      .catch(() => setHydrated(true));
  }, [nav]);

  const slide = slides[index];

  if (!hydrated || !slide) {
    return <View style={[styles.root, { backgroundColor: theme.colors.bg }]} />;
  }

  const isFirst = index === 0;
  const isLast = index === slides.length - 1;
  const tint = SLIDE_TINTS[index] ?? SLIDE_TINTS[0]!;

  async function finish() {
    haptic.tap();
    try {
      await AsyncStorage.setItem(SEEN_KEY, 'true');
    } catch {
      // Non-fatal — worst case, the user sees onboarding twice.
    }
    track('onboarding_complete');
    nav.replace('Home');
  }

  function next() {
    haptic.tap();
    if (isLast) {
      void finish();
      return;
    }
    setIndex((i) => i + 1);
  }

  function skip() {
    haptic.tap();
    void finish();
  }

  return (
    <View style={styles.root}>
      {/* Background tint stack — keeps the base bg neutral so dark mode
          doesn't fight the sepia overlay on slide 2. */}
      <View style={[styles.bg, { backgroundColor: tint[0] }]} />
      <View style={[styles.bgFade, { backgroundColor: tint[1] }] as StyleProp<ViewStyle>} />

      <SafeAreaView style={styles.layer}>
        <View style={styles.top}>
          <Pressable
            onPress={skip}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={copy.common.skip}
          >
            <Text style={[styles.skip, { color: theme.colors.textMuted }]}>{copy.common.skip}</Text>
          </Pressable>
        </View>

        <View style={styles.center}>
          {isFirst ? (
            <Slogan size={72} color={theme.colors.text} />
          ) : (
            <View style={styles.textBlock}>
              <F8Logo size={28} color={theme.colors.accent} />
              <Text style={[styles.title, { color: theme.colors.text }]}>{slide.title}</Text>
              <Text style={[styles.body, { color: theme.colors.textMuted }]}>{slide.body}</Text>
            </View>
          )}
        </View>

        <View style={styles.bottom}>
          {/* Progress bar — slides fill left to right, slim and beige. */}
          <View style={[styles.progressTrack, { backgroundColor: theme.colors.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: theme.colors.accent,
                  width: `${((index + 1) / slides.length) * 100}%`,
                },
              ]}
            />
          </View>
          <View style={styles.dots}>
            {slides.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: i === index ? theme.colors.text : theme.colors.border,
                  },
                ]}
              />
            ))}
          </View>
          <Pressable
            onPress={next}
            accessibilityRole="button"
            accessibilityLabel={isLast ? copy.common.start : copy.common.next}
            style={[
              styles.cta,
              { backgroundColor: isLast ? theme.colors.accent : theme.colors.text },
            ]}
          >
            <Text style={[styles.ctaLabel, { color: theme.colors.bg }]}>
              {isLast ? copy.common.start : copy.common.next}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  bg: { ...StyleSheet.absoluteFillObject },
  bgFade: { ...StyleSheet.absoluteFillObject, opacity: 0.55 },
  layer: { flex: 1 },
  top: { flexDirection: 'row', justifyContent: 'flex-end', padding: 20 },
  skip: { fontSize: 14, fontWeight: '500' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  textBlock: { alignItems: 'flex-start', gap: 16, alignSelf: 'stretch' },
  title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.6 },
  body: { fontSize: 17, lineHeight: 26, fontStyle: 'italic' },
  bottom: { paddingHorizontal: 24, paddingBottom: 32, gap: 16 },
  progressTrack: { height: 2, borderRadius: 1, overflow: 'hidden' },
  progressFill: { height: 2, borderRadius: 1 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  cta: { paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  ctaLabel: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
});
