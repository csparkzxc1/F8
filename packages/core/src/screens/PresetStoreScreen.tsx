// Preset store. Each PresetPack lists its films by name (no marketing puff).
import React, { useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useVariant } from '../variant/VariantContext';
import { useTheme } from '../theme/ThemeProvider';
import { useIapStore } from '../store/iapStore';
import { useToast } from '../components/ui/Toast';
import { initIap } from '../services/iap';
import { t } from '../i18n';

export function PresetStoreScreen() {
  const variant = useVariant();
  const theme = useTheme();
  const nav = useNavigation();
  const copy = t();
  const owned = useIapStore((s) => s.ownedPackIds);
  const purchase = useIapStore((s) => s.purchase);
  const restore = useIapStore((s) => s.restore);
  const hydrate = useIapStore((s) => s.hydrate);
  const showToast = useToast((s) => s.show);

  useEffect(() => {
    const productIds = Object.values(variant.iapProductIds).map((p) =>
      Platform.OS === 'ios' ? p.ios : p.android,
    );
    initIap(productIds).catch(() => undefined);
    hydrate();
  }, [variant.iapProductIds, hydrate]);

  function productIdFor(packId: string): string | null {
    const map = variant.iapProductIds[packId];
    if (!map) return null;
    return Platform.OS === 'ios' ? map.ios : map.android;
  }

  async function onBuy(packId: string) {
    const productId = productIdFor(packId);
    if (!productId) return;
    const ok = await purchase(productId);
    showToast(ok ? '구매가 완료되었습니다.' : copy.errors.saveFailed, ok ? 'info' : 'error');
  }

  async function onRestore() {
    await restore();
    showToast('복원이 완료되었습니다.');
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.bg }]}>
      <View style={styles.header}>
        <Pressable onPress={() => nav.goBack()} hitSlop={12}>
          <Text style={[styles.back, { color: theme.colors.textMuted }]}>{copy.common.cancel}</Text>
        </Pressable>
        <Pressable onPress={onRestore} hitSlop={12}>
          <Text style={[styles.restore, { color: theme.colors.accent }]}>{copy.store.restore}</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.heroTitle, { color: theme.colors.text }]}>
          {variant.copy.storeHero.title}
        </Text>
        <Text style={[styles.heroDesc, { color: theme.colors.textMuted }]}>
          {variant.copy.storeHero.description}
        </Text>

        {variant.premiumPacks.length === 0 ? (
          <Text style={[styles.empty, { color: theme.colors.textDimmed }]}>
            팩이 곧 도착합니다.
          </Text>
        ) : (
          variant.premiumPacks.map((pack) => {
            const productId = productIdFor(pack.id);
            const isOwned = !!productId && owned.includes(productId);
            return (
              <View
                key={pack.id}
                style={[styles.card, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
              >
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{pack.name}</Text>
                <Text style={[styles.cardDesc, { color: theme.colors.textMuted }]}>
                  {pack.description}
                </Text>
                <View style={styles.cardRow}>
                  <Text style={[styles.price, { color: theme.colors.text }]}>
                    {pack.priceLabel}
                  </Text>
                  <Pressable
                    onPress={() => onBuy(pack.id)}
                    disabled={isOwned}
                    style={[
                      styles.buy,
                      {
                        backgroundColor: isOwned ? theme.colors.surfaceElevated : theme.colors.accent,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.buyLabel,
                        { color: isOwned ? theme.colors.textMuted : theme.colors.bg },
                      ]}
                    >
                      {isOwned ? '구매됨' : copy.store.buy}
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  back: { fontSize: 15, fontWeight: '500' },
  restore: { fontSize: 15, fontWeight: '700' },
  content: { paddingHorizontal: 24, paddingBottom: 40, gap: 16 },
  heroTitle: { fontSize: 28, fontWeight: '800', letterSpacing: -0.6 },
  heroDesc: { fontSize: 14 },
  empty: { fontSize: 14, marginTop: 24 },
  card: { padding: 16, borderRadius: 12, borderWidth: 1, gap: 8, marginTop: 12 },
  cardTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  cardDesc: { fontSize: 13, lineHeight: 18 },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  price: { fontSize: 15, fontWeight: '700' },
  buy: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  buyLabel: { fontSize: 14, fontWeight: '700', letterSpacing: -0.2 },
});
