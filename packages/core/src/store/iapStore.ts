// Owned-pack state. Hydrated from AsyncStorage on app start.
import { create } from 'zustand';
import { listOwned, buyPack, restorePurchases } from '../services/iap';

type IapState = {
  ownedPackIds: string[];
  loading: boolean;
  hydrate: () => Promise<void>;
  purchase: (productId: string) => Promise<boolean>;
  restore: () => Promise<void>;
};

export const useIapStore = create<IapState>((set) => ({
  ownedPackIds: [],
  loading: false,
  hydrate: async () => {
    const ids = await listOwned();
    set({ ownedPackIds: ids });
  },
  purchase: async (productId) => {
    set({ loading: true });
    const ok = await buyPack(productId);
    if (ok) {
      set((s) => ({ ownedPackIds: Array.from(new Set([...s.ownedPackIds, productId])) }));
    }
    set({ loading: false });
    return ok;
  },
  restore: async () => {
    set({ loading: true });
    const ids = await restorePurchases();
    set({ ownedPackIds: ids, loading: false });
  },
}));

export function isPackOwned(productId: string): boolean {
  return useIapStore.getState().ownedPackIds.includes(productId);
}
