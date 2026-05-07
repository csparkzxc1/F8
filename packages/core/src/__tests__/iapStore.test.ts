import { useIapStore } from '../store/iapStore';

describe('useIapStore', () => {
  beforeEach(() => {
    useIapStore.setState({ ownedPackIds: [], loading: false });
  });

  it('starts with no owned packs', () => {
    expect(useIapStore.getState().ownedPackIds).toEqual([]);
  });

  it('hydrate reads from storage and is empty by default', async () => {
    await useIapStore.getState().hydrate();
    expect(useIapStore.getState().ownedPackIds).toEqual([]);
  });

  it('purchase failure leaves the owned list unchanged', async () => {
    const ok = await useIapStore.getState().purchase('com.test.pack');
    // Mock IAP returns null → buyPack returns false.
    expect(ok).toBe(false);
    expect(useIapStore.getState().ownedPackIds).toEqual([]);
    expect(useIapStore.getState().loading).toBe(false);
  });
});
