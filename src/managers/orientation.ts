import * as ScreenOrientation from 'expo-screen-orientation';

export const OrientationManager = {
  lockPortrait: async () => {
    try {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    } catch (e) {
      console.warn('Failed to lock portrait orientation', e);
    }
  },
  
  lockLandscape: async () => {
    try {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } catch (e) {
      console.warn('Failed to lock landscape orientation', e);
    }
  },
  
  unlockAll: async () => {
    try {
      await ScreenOrientation.unlockAsync();
    } catch (e) {
      console.warn('Failed to unlock orientation', e);
    }
  }
};
