import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Logger } from '../core/logger';

const DAILY_REMINDER_IDENTIFIER = 'daily-reminder';
const DAILY_REMINDER_CHANNEL = 'daily-reminders';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const NotificationsManager = {
  async initialize() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(DAILY_REMINDER_CHANNEL, {
        name: 'Daily reminders',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
  },

  async requestPermission() {
    const existing = await Notifications.getPermissionsAsync();
    if (existing.status === 'granted') {
      return true;
    }

    const requested = await Notifications.requestPermissionsAsync();
    return requested.status === 'granted';
  },

  async syncDailyReminder(enabled: boolean, hour = 19, minute = 0) {
    await Notifications.cancelAllScheduledNotificationsAsync().catch(() => undefined);

    if (!enabled) {
      await Logger.info('Daily reminder disabled');
      return false;
    }

    const granted = await NotificationsManager.requestPermission();
    if (!granted) {
      await Logger.warn('Daily reminder permission denied');
      return false;
    }

    await Notifications.scheduleNotificationAsync({
      identifier: DAILY_REMINDER_IDENTIFIER,
      content: {
        title: 'Pockade is ready',
        body: 'A fresh offline puzzle is waiting for you.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });

    await Logger.info('Daily reminder scheduled', { hour, minute });
    return true;
  },
};
