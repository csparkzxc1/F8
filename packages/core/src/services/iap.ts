// IAP wrapper. Owned-pack ids cached in AsyncStorage so the UI updates
// immediately while a remote receipt validation runs in background.
// Critical: every successful purchase must be acknowledged via
// finishTransaction or iOS keeps re-delivering it on every cold start.
import * as IAP from 'react-native-iap';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OWNED_KEY = 'f8.owned-packs.v1';

let initialized = false;

export async function initIap(productIds: string[]): Promise<void> {
  if (initialized) return;
  await IAP.initConnection();
  await IAP.getProducts({ skus: productIds });
  initialized = true;
}

export async function endIap(): Promise<void> {
  if (!initialized) return;
  await IAP.endConnection();
  initialized = false;
}

export async function listOwned(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(OWNED_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

async function persistOwned(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(OWNED_KEY, JSON.stringify(Array.from(new Set(ids))));
}

export async function buyPack(productId: string): Promise<boolean> {
  try {
    const purchase = await IAP.requestPurchase({ sku: productId });
    const result = Array.isArray(purchase) ? purchase[0] : purchase;
    if (!result) return false;
    // Preset packs are non-consumable — keep them owned permanently.
    await IAP.finishTransaction({ purchase: result, isConsumable: false });
    const owned = await listOwned();
    await persistOwned([...owned, productId]);
    return true;
  } catch {
    return false;
  }
}

export async function restorePurchases(): Promise<string[]> {
  const purchases = await IAP.getAvailablePurchases();
  for (const purchase of purchases) {
    try {
      await IAP.finishTransaction({ purchase, isConsumable: false });
    } catch {
      // Already finished — ignore.
    }
  }
  const ids = purchases.map((p) => p.productId);
  await persistOwned(ids);
  return ids;
}
