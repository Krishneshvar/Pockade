import * as Haptics from 'expo-haptics';
import { useThemeStore } from '../core/themeStore';

function hapticsEnabled() {
  return useThemeStore.getState().hapticsEnabled;
}

export const HapticBridge = {
  selection() {
    if (!hapticsEnabled()) {
      return;
    }
    Haptics.selectionAsync().catch(() => undefined);
  },

  lightTap() {
    if (!hapticsEnabled()) {
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
  },

  heavyTap() {
    if (!hapticsEnabled()) {
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => undefined);
  },

  success() {
    if (!hapticsEnabled()) {
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
  },

  error() {
    if (!hapticsEnabled()) {
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined);
  },
};
