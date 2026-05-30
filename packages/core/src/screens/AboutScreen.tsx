// About: full brand story. The Weegee origin lives here, in F8 voice.
import React from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Info } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useVariant } from '../variant/VariantContext';
import { useTheme } from '../theme/ThemeProvider';
import { F8Logo } from '../components/brand/F8Logo';
import { Slogan } from '../components/brand/Slogan';
import { t } from '../i18n';

export function AboutScreen() {
  const variant = useVariant();
  const theme = useTheme();
  const nav = useNavigation();
  const copy = t();

  const version =
    Constants.expoConfig?.version ?? Constants.manifest2?.extra?.expoClient?.version ?? '0.1.0';

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.bg }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => nav.goBack()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={copy.common.cancel}
        >
          <Text style={[styles.back, { color: theme.colors.textMuted }]}>{copy.common.cancel}</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.textMuted }]}>About</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroBlock}>
          <Slogan size={42} color={theme.colors.text} />
        </View>

        <Section title="100년 전, Weegee" theme={theme}>
          1930-1940년대 뉴욕. 거리 사진의 거장 Weegee(Arthur Fellig, 1899-1968)는 사진을
          잘 찍는 비결을 묻는 사람들에게 단 한 줄로 답했습니다.
          {'\n\n'}
          <Text style={{ fontStyle: 'italic', color: theme.colors.text }}>
            &ldquo;f/8 and be there.&rdquo;
          </Text>
          {'\n\n'}
          조리개 f/8에 맞춰놓고, 그냥 거기 있어라.
        </Section>

        <Section title="장비가 아니라 시선" theme={theme}>
          기술적으로 f/8은 거의 모든 상황에서 무난하게 작동하는 조리개값입니다.
          Weegee의 가르침은 단순했습니다 — 장비에 집착하지 말고, 그 자리에 있어라.
          좋은 사진은 기술이 아니라 순간이다.
        </Section>

        <Section title="F8" theme={theme}>
          F8은 이 철학을 100년 후에 모바일로 옮긴 앱입니다. 복잡한 설정 없이,
          필름을 고르고 셔터를 누른다. 카메라가 아니라 그 자리에 있는 사람의 시선이
          작품을 만든다.
        </Section>

        <Section title="필름의 정직함" theme={theme}>
          F8의 모든 프리셋은 실제 필름의 LUT를 GPU 셰이더로 처리한 결과입니다.
          AI 합성이나 단순 톤커브가 아닌, 진짜 필름의 색.
        </Section>

        <Section title="LUT 출처" theme={theme}>
          현재 빌드는 자체 제작 파라메트릭 LUT를 사용합니다.
          실제 필름 스캔 LUT 도입 시 라이선스와 출처를 이 자리에 명시합니다.
        </Section>

        <Section title="만든 사람들" theme={theme}>
          기획·디자인·엔지니어링. 서울에서.
        </Section>

        <View style={[styles.footer, { borderColor: theme.colors.border }]}>
          <F8Logo size={20} color={theme.colors.textMuted} />
          <View style={styles.versionLine}>
            <Info size={12} color={theme.colors.textMuted} strokeWidth={1.5} />
            <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>
              {variant.appName} · v{version}
            </Text>
          </View>
          <Text style={[styles.footerText, { color: theme.colors.textDimmed }]}>
            Made in Seoul
          </Text>
        </View>

        <Text style={[styles.trademarks, { color: theme.colors.textMuted }]}>
          {copy.about.trademarks}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  children,
  theme,
}: {
  title: string;
  children: React.ReactNode;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.accent }]}>{title}</Text>
      <Text style={[styles.sectionBody, { color: theme.colors.text }]}>{children}</Text>
    </View>
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
  headerTitle: { fontSize: 12, fontWeight: '600', letterSpacing: 0.4, textTransform: 'uppercase' },
  headerSpacer: { width: 40 },
  back: { fontSize: 15, fontWeight: '500' },
  content: { paddingHorizontal: 24, paddingBottom: 40, gap: 24 },
  heroBlock: { paddingTop: 16, paddingBottom: 8, alignItems: 'flex-start' },
  section: { gap: 8 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  sectionBody: { fontSize: 15, lineHeight: 24 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 24,
    borderTopWidth: 1,
  },
  footerText: { fontSize: 12 },
  versionLine: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  trademarks: { fontSize: 10, lineHeight: 15 },
});
