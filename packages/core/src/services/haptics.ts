// Haptic shorthand. Wraps expo-haptics so the rest of the codebase has one entry.
import * as Haptics from 'expo-haptics';

export const haptic = {
  tap: () => Haptics.selectionAsync().catch(() => undefined),
  shutter: () =>
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => undefined),
  success: () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined),
  error: () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined),
};
