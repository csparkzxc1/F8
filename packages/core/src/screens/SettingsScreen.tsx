// Settings. Restore purchases, About link, terms/privacy placeholders.
import React from 'react';
import { Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeProvider';
import { useIapStore } from '../store/iapStore';
import { useToast } from '../components/ui/Toast';
import { t } from '../i18n';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

export function SettingsScreen() {
  const theme = useTheme();
  const nav = useNavigation<Nav>();
  const copy = t();
  const restore = useIapStore((s) => s.restore);
  const showToast = useToast((s) => s.show);

  async function onRestore() {
    await restore();
    showToast('복원이 완료되었습니다.');
  }

  function openUrl(url: string) {
    Linking.openURL(url).catch(() => undefined);
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.bg }]}>
      <View style={styles.header}>
        <Pressable onPress={() => nav.goBack()} hitSlop={12}>
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
          <Row
            theme={theme}
            label="이용약관"
            onPress={() => openUrl('https://f8.app/terms')}
          />
          <Row
            theme={theme}
            label="개인정보 처리방침"
            onPress={() => openUrl('https://f8.app/privacy')}
          />
          <Row
            theme={theme}
            label="문의"
            onPress={() => openUrl('mailto:hello@f8.app')}
          />
        </Section>
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
}: {
  label: string;
  onPress: () => void;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed ? theme.colors.surfaceElevated : 'transparent' },
      ]}
    >
      <Text style={[styles.rowLabel, { color: theme.colors.text }]}>{label}</Text>
      <Text style={[styles.rowChevron, { color: theme.colors.textDimmed }]}>›</Text>
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
  rowChevron: { fontSize: 22, fontWeight: '300' },
});
