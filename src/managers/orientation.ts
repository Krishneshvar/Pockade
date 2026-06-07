import * as ScreenOrientation from 'expo-screen-orientation';

export type OrientationPreference = 'portrait' | 'landscape' | 'any';

export const OrientationManager = {
  async lockPortrait() {
    try {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    } catch (error) {
      console.warn('Failed to lock portrait orientation', error);
    }
  },

  async lockLandscape() {
    try {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } catch (error) {
      console.warn('Failed to lock landscape orientation', error);
    }
  },

  async unlockAll() {
    try {
      await ScreenOrientation.unlockAsync();
    } catch (error) {
      console.warn('Failed to unlock orientation', error);
    }
  },

  async lockForPreference(preference: OrientationPreference) {
    if (preference === 'landscape') {
      await OrientationManager.lockLandscape();
      return;
    }

    if (preference === 'portrait') {
      await OrientationManager.lockPortrait();
      return;
    }

    await OrientationManager.unlockAll();
  },

  async resetToShellDefault() {
    await OrientationManager.lockPortrait();
  },
};
