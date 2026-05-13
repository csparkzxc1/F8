// Settings. Restore purchases, terms / privacy / contact links, About,
// brand version at the foot. URLs are placeholder constants; swap in the
// real ones before submission.
import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Constants from 'expo-constants';
import { useTheme } from '../theme/ThemeProvider';
import { useVariant } from '../variant/VariantContext';
import { useIapStore } from '../store/iapStore';
import { useToast } from '../components/ui/Toast';
import { track } from '../services/analytics';
import { haptic } from '../services/haptics';
import { t } from '../i18n';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

// TODO: replace with the real public URLs before launch.
const TERMS_URL = 'https://f8.app/terms';
const PRIVACY_URL = 'https://f8.app/privacy';
const CONTACT_MAIL = 'mailto:hello@f8.app';

export function SettingsScreen() {
  const theme = useTheme();
  const nav = useNavigation<Nav>();
  const variant = useVariant();
  const copy = t();
  const restore = useIapStore((s) => s.restore);
  const showToast = useToast((s) => s.show);

  const version =
    Constants.expoConfig?.version ?? Constants.manifest2?.extra?.expoClient?.version ?? '0.1.0';

  async function onRestore() {
    haptic.tap();
    track('iap_restored');
    try {
      await restore();
      showToast('보유 항목을 복원했습니다.');
    } catch {
      showToast('복원하지 못했습니다.', 'error');
    }
  }

  function openUrl(url: string) {
    haptic.tap();
    Linking.openURL(url).catch(() => {
      showToast('링크를 열지 못했습니다.', 'error');
    });
  }

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
        <Text style={[styles.title, { color: theme.colors.text }]}>{copy.common.settings}</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Section theme={theme} label="구매">
          <Row theme={theme} label={copy.store.restore} onPress={onRestore} />
          <Row theme={theme} label="프리셋 팩" onPress={() => nav.navigate('PresetStore')} />
        </Section>

        <Section theme={theme} label="브랜드">
          <Row theme={theme} label={copy.common.about} onPress={() => nav.navigate('About')} />
        </Section>

        <Section theme={theme} label="문서">
          <Row theme={theme} label="이용약관" onPress={() => openUrl(TERMS_URL)} external />
          <Row
            theme={theme}
            label="개인정보 처리방침"
            onPress={() => openUrl(PRIVACY_URL)}
            external
          />
          <Row theme={theme} label="문의하기" onPress={() => openUrl(CONTACT_MAIL)} external />
        </Section>

        <View style={styles.versionBlock}>
          <Text style={[styles.versionText, { color: theme.colors.textDimmed }]}>
            {variant.appName}  ·  v{version}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  label,
  children,
  theme,
}: {
  label: string;
  children: React.ReactNode;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>{label}</Text>
      <View style={[styles.sectionBody, { borderColor: theme.colors.border }]}>{children}</View>
    </View>
  );
}

function Row({
  label,
  onPress,
  theme,
  external,
}: {
  label: string;
  onPress: () => void;
  theme: ReturnType<typeof useTheme>;
  external?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed ? theme.colors.surfaceElevated : 'transparent' },
      ]}
    >
      <Text style={[styles.rowLabel, { color: theme.colors.text }]}>{label}</Text>
      <Text style={[styles.rowChevron, { color: theme.colors.textDimmed }]}>
        {external ? '↗' : '›'}
      </Text>
    </Pressable>
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
  title: { fontSize: 16, fontWeight: '700' },
  spacer: { width: 60 },
  content: { paddingHorizontal: 24, paddingBottom: 40, gap: 24 },
  section: { gap: 8 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sectionBody: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLabel: { fontSize: 15, fontWeight: '500' },
  rowChevron: { fontSize: 18, fontWeight: '400' },
  versionBlock: { alignItems: 'center', paddingVertical: 32 },
  versionText: { fontSize: 12, fontVariant: ['tabular-nums'] },
});
