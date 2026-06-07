import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export type ShellPermission = 'notifications' | 'haptics' | 'backup-export';

export const PermissionsGatekeeper = {
  async request(feature: ShellPermission) {
    switch (feature) {
      case 'notifications': {
        const result = await Notifications.requestPermissionsAsync();
        return result.status === 'granted';
      }
      case 'haptics':
      case 'backup-export':
        return true;
      default:
        return Platform.OS !== 'web';
    }
  },
};
