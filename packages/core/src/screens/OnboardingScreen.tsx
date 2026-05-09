// Onboarding: 3 slides driven by variant.copy.onboarding. F8 voice.
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useVariant } from '../variant/VariantContext';
import { useTheme } from '../theme/ThemeProvider';
import { Slogan } from '../components/brand/Slogan';
import { F8Logo } from '../components/brand/F8Logo';
import { haptic } from '../services/haptics';
import { track } from '../services/analytics';
import { t } from '../i18n';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

export function OnboardingScreen() {
  const variant = useVariant();
  const theme = useTheme();
  const nav = useNavigation<Nav>();
  const copy = t();
  const slides = variant.copy.onboarding;
  const [index, setIndex] = useState(0);

  const slide = slides[index];
  if (!slide) return null;

  const isFirst = index === 0;
  const isLast = index === slides.length - 1;

  function next() {
    haptic.tap();
    if (isLast) {
      track('onboarding_complete');
      nav.replace('Home');
      return;
    }
    setIndex((i) => i + 1);
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.bg }]}>
      <View style={styles.top}>
        <Pressable onPress={() => nav.replace('Home')} hitSlop={12}>
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
          style={[styles.cta, { backgroundColor: theme.colors.text }]}
        >
          <Text style={[styles.ctaLabel, { color: theme.colors.bg }]}>
            {isLast ? copy.common.start : copy.common.next}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  top: { flexDirection: 'row', justifyContent: 'flex-end', padding: 20 },
  skip: { fontSize: 14, fontWeight: '500' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  textBlock: { alignItems: 'flex-start', gap: 16, alignSelf: 'stretch' },
  title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.6 },
  body: { fontSize: 17, lineHeight: 26 },
  bottom: { paddingHorizontal: 24, paddingBottom: 32, gap: 24 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  cta: { paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  ctaLabel: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
});
