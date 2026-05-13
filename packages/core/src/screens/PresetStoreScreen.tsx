// Preset store. Hero copy + pack cards (mini color strip per preset, price,
// chevron). Tapping a card opens a brand-voiced confirm sheet; owned packs
// render dimmed with a "보유 중" label.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useVariant } from '../variant/VariantContext';
import { useTheme } from '../theme/ThemeProvider';
import { useIapStore, isPackUnlocked } from '../store/iapStore';
import { useToast } from '../components/ui/Toast';
import { initIap } from '../services/iap';
import { haptic } from '../services/haptics';
import { track } from '../services/analytics';
import { t } from '../i18n';
import type { PresetPack } from '../variant/types';

// Tone swatch per preset id. Mirrors the dummy LUT seed colors in
// tools/generate-dummy-luts.ts so the strip on the store card matches the
// look the user sees in the editor once they buy.
const PRESET_SWATCH: Record<string, string> = {
  // Free 6 — shown when the variant promotes a common pack.
  noeul: '#d4a574',
  saebyeok: '#88a8c0',
  cheotnun: '#e0e8f0',
  yunyeon: '#c8a87a',
  yeoreumbam: '#e8a060',
  hyuil: '#d4b08c',
  // Vintage Korea (Seoul premium pack).
  ugi: '#4a6878',
  caffein: '#8a6038',
  ibangin: '#6890a0',
  bomnal: '#e0c8c0',
  goyo: '#888888',
  dongbaek: '#b85838',
};

export function PresetStoreScreen() {
  const variant = useVariant();
  const theme = useTheme();
  const nav = useNavigation();
  const copy = t();
  const owned = useIapStore((s) => s.ownedPackIds);
  const loading = useIapStore((s) => s.loading);
  const purchase = useIapStore((s) => s.purchase);
  const restore = useIapStore((s) => s.restore);
  const hydrate = useIapStore((s) => s.hydrate);
  const showToast = useToast((s) => s.show);

  const [confirm, setConfirm] = useState<PresetPack | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    const productIds = Object.values(variant.iapProductIds).map((p) =>
      Platform.OS === 'ios' ? p.ios : p.android,
    );
    initIap(productIds).catch(() => undefined);
    hydrate();
  }, [variant.iapProductIds, hydrate]);

  const productIdFor = useCallback(
    (packId: string): string | null => {
      const map = variant.iapProductIds[packId];
      if (!map) return null;
      return Platform.OS === 'ios' ? map.ios : map.android;
    },
    [variant.iapProductIds],
  );

  const onCardPress = useCallback(
    (pack: PresetPack) => {
      haptic.tap();
      const ownedNow = isPackUnlocked(pack.id, variant.iapProductIds, owned);
      if (ownedNow) {
        showToast('이미 보유 중입니다.');
        return;
      }
      track('pack_view', { id: pack.id });
      setConfirm(pack);
    },
    [variant.iapProductIds, owned, showToast],
  );

  const onConfirmBuy = useCallback(async () => {
    if (!confirm || purchasing) return;
    const productId = productIdFor(confirm.id);
    if (!productId) {
      showToast('결제를 시작하지 못했습니다.', 'error');
      setConfirm(null);
      return;
    }
    setPurchasing(true);
    track('pack_purchase_attempt', { id: confirm.id });
    try {
      const ok = await purchase(productId);
      if (ok) {
        track('pack_purchase_success', { id: confirm.id });
        haptic.success();
        showToast('잠금 해제됨.');
      } else {
        track('pack_purchase_fail', { id: confirm.id });
        haptic.error();
        showToast('결제가 처리되지 않았습니다.', 'error');
      }
    } catch {
      track('pack_purchase_fail', { id: confirm.id });
      haptic.error();
      showToast('결제를 시작하지 못했습니다.', 'error');
    } finally {
      setPurchasing(false);
      setConfirm(null);
    }
  }, [confirm, purchasing, productIdFor, purchase, showToast]);

  const onRestore = useCallback(async () => {
    haptic.tap();
    track('pack_restore');
    try {
      await restore();
      showToast('복원이 완료되었습니다.');
    } catch {
      showToast('복원하지 못했습니다.', 'error');
    }
  }, [restore, showToast]);

  const packs = useMemo(
    () =>
      variant.premiumPacks.map((pack) => ({
        pack,
        owned: isPackUnlocked(pack.id, variant.iapProductIds, owned),
      })),
    [variant.premiumPacks, variant.iapProductIds, owned],
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.bg }]}>
      <View style={styles.header}>
        <Pressable onPress={() => nav.goBack()} hitSlop={12}>
          <Text style={[styles.back, { color: theme.colors.textMuted }]}>←</Text>
        </Pressable>
        <View />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.heroTitle, { color: theme.colors.text }]}>
          {variant.copy.storeHero.title}
        </Text>
        <Text style={[styles.heroDesc, { color: theme.colors.textMuted }]}>
          {variant.copy.storeHero.description}
        </Text>

        {packs.length === 0 ? (
          <Text style={[styles.empty, { color: theme.colors.textDimmed }]}>
            팩이 곧 도착합니다.
          </Text>
        ) : (
          packs.map(({ pack, owned: isOwned }) => (
            <Pressable
              key={pack.id}
              onPress={() => onCardPress(pack)}
              style={[
                styles.card,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                  opacity: isOwned ? 0.6 : 1,
                },
              ]}
            >
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{pack.name}</Text>
              <Text style={[styles.cardDesc, { color: theme.colors.textMuted }]}>
                {pack.description}
              </Text>

              <View style={styles.swatchStrip}>
                {pack.presets.map((p) => (
                  <View
                    key={p.id}
                    style={[styles.swatch, { backgroundColor: PRESET_SWATCH[p.id] ?? '#666' }]}
                  />
                ))}
              </View>

              <View style={styles.cardRow}>
                <Text style={[styles.price, { color: theme.colors.accent }]}>
                  {isOwned ? '보유 중' : pack.priceLabel}
                </Text>
                <Text style={[styles.chevron, { color: theme.colors.textMuted }]}>›</Text>
              </View>
            </Pressable>
          ))
        )}

        <Pressable onPress={onRestore} style={styles.restore} hitSlop={8}>
          <Text style={[styles.restoreLabel, { color: theme.colors.textMuted }]}>
            {copy.store.restore}
          </Text>
        </Pressable>
      </ScrollView>

      <Modal
        visible={!!confirm}
        transparent
        animationType="fade"
        onRequestClose={() => !purchasing && setConfirm(null)}
      >
        <View style={styles.sheetBackdrop}>
          <View style={[styles.sheet, { backgroundColor: theme.colors.surfaceElevated }]}>
            <Text style={[styles.sheetTitle, { color: theme.colors.text }]}>
              {confirm?.name}
            </Text>
            <Text style={[styles.sheetPrice, { color: theme.colors.accent }]}>
              {confirm?.priceLabel}
            </Text>
            <Text style={[styles.sheetDesc, { color: theme.colors.textMuted }]}>
              {confirm?.description}
            </Text>
            <View style={styles.sheetRow}>
              <Pressable
                onPress={() => !purchasing && setConfirm(null)}
                style={[styles.sheetBtn, { borderColor: theme.colors.border }]}
              >
                <Text style={[styles.sheetBtnLabel, { color: theme.colors.text }]}>
                  {copy.common.cancel}
                </Text>
              </Pressable>
              <Pressable
                onPress={onConfirmBuy}
                disabled={purchasing || loading}
                style={[
                  styles.sheetBtn,
                  {
                    backgroundColor: theme.colors.accent,
                    opacity: purchasing || loading ? 0.6 : 1,
                  },
                ]}
              >
                <Text style={[styles.sheetBtnLabel, { color: theme.colors.bg }]}>
                  {copy.store.buy}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  back: { fontSize: 22, fontWeight: '600' },
  content: { paddingHorizontal: 24, paddingBottom: 40, gap: 12 },
  heroTitle: { fontSize: 30, fontWeight: '800', letterSpacing: -0.6 },
  heroDesc: { fontSize: 14, fontStyle: 'italic', marginBottom: 8 },
  empty: { fontSize: 14, marginTop: 24 },
  card: {
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
    marginTop: 8,
  },
  cardTitle: { fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
  cardDesc: { fontSize: 13, lineHeight: 18 },
  swatchStrip: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  swatch: {
    flex: 1,
    height: 18,
    borderRadius: 3,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  price: { fontSize: 17, fontWeight: '700', letterSpacing: -0.2 },
  chevron: { fontSize: 22, fontWeight: '500' },
  restore: { alignSelf: 'center', paddingVertical: 18 },
  restoreLabel: {
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    gap: 8,
  },
  sheetTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
  sheetPrice: { fontSize: 18, fontWeight: '700' },
  sheetDesc: { fontSize: 13, lineHeight: 18, marginBottom: 12 },
  sheetRow: { flexDirection: 'row', gap: 10 },
  sheetBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sheetBtnLabel: { fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
});
