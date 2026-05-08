// Analytics facade. Defaults to a no-op so the package stays portable;
// f8-seoul (or any variant) wires PostHog in App.tsx via setAnalytics().
export type AnalyticsEvent =
  | 'app_open'
  | 'onboarding_complete'
  | 'photo_picked'
  | 'photo_shot'
  | 'preset_applied'
  | 'auto_applied'
  | 'photo_saved'
  | 'pack_view'
  | 'pack_purchase_attempt'
  | 'pack_purchase_success'
  | 'pack_purchase_fail'
  | 'pack_restore';

export type AnalyticsAdapter = {
  track(event: AnalyticsEvent, props?: Record<string, unknown>): void;
  identify?(id: string, traits?: Record<string, unknown>): void;
};

const noop: AnalyticsAdapter = {
  track: () => undefined,
};

let adapter: AnalyticsAdapter = noop;

export function setAnalytics(next: AnalyticsAdapter): void {
  adapter = next;
}

export function track(event: AnalyticsEvent, props?: Record<string, unknown>): void {
  adapter.track(event, props);
}

export function identify(id: string, traits?: Record<string, unknown>): void {
  adapter.identify?.(id, traits);
}
