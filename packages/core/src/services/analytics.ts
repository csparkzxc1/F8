// Analytics facade. Defaults to a no-op so the package stays portable;
// f8-seoul (or any variant) wires PostHog in App.tsx via setAnalytics().
//
// setVariantContext(id) lets createF8App stamp variant.id onto every
// event without each call site having to pass it explicitly.
export type AnalyticsEvent =
  | 'app_open'
  | 'onboarding_complete'
  | 'photo_picked'
  | 'photo_shot'
  | 'preset_applied'
  | 'body_applied'
  | 'auto_applied'
  | 'photo_saved'
  | 'photo_shared'
  | 'pack_view'
  | 'pack_purchase_attempt'
  | 'pack_purchase_success'
  | 'pack_purchase_fail'
  | 'pack_restore'
  | 'iap_initiated'
  | 'iap_completed'
  | 'iap_failed'
  | 'iap_restored'
  | 'error';

export type AnalyticsAdapter = {
  track(event: AnalyticsEvent, props?: Record<string, unknown>): void;
  identify?(id: string, traits?: Record<string, unknown>): void;
};

const noop: AnalyticsAdapter = {
  track: () => undefined,
};

let adapter: AnalyticsAdapter = noop;
let variantId: string | null = null;

export function setAnalytics(next: AnalyticsAdapter): void {
  adapter = next;
}

export function setVariantContext(id: string): void {
  variantId = id;
}

export function track(event: AnalyticsEvent, props?: Record<string, unknown>): void {
  // Stamp variant on every event so PostHog dashboards can slice by app
  // without each call site remembering to pass it.
  const merged = variantId ? { ...(props ?? {}), variant: variantId } : props;
  adapter.track(event, merged);
}

export function identify(id: string, traits?: Record<string, unknown>): void {
  adapter.identify?.(id, traits);
}
