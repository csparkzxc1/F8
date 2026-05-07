// PostHog adapter for the analytics facade. Each variant App.tsx calls
// initPostHog() with its own project key before createF8App() runs.
import PostHog from 'posthog-react-native';
import { setAnalytics, type AnalyticsAdapter } from './analytics';

type Options = {
  host?: string;
  enableSessionReplay?: boolean;
};

let client: PostHog | null = null;

export function initPostHog(apiKey: string, options: Options = {}): PostHog {
  if (client) return client;
  client = new PostHog(apiKey, {
    host: options.host ?? 'https://app.posthog.com',
    enableSessionReplay: options.enableSessionReplay ?? false,
  });

  const adapter: AnalyticsAdapter = {
    track: (event, props) => client?.capture(event, props),
    identify: (id, traits) => client?.identify(id, traits),
  };
  setAnalytics(adapter);
  return client;
}

export function getPostHog(): PostHog | null {
  return client;
}
