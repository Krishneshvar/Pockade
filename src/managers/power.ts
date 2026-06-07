import * as KeepAwake from 'expo-keep-awake';
import * as Battery from 'expo-battery';

class PowerManagerClass {
  private wakeLockActive = false;

  public enableWakeLock() {
    if (!this.wakeLockActive) {
      KeepAwake.activateKeepAwakeAsync('game-session').catch(() => {});
      this.wakeLockActive = true;
    }
  }

  public disableWakeLock() {
    if (this.wakeLockActive) {
      KeepAwake.deactivateKeepAwake('game-session').catch(() => {});
      this.wakeLockActive = false;
    }
  }

  public async isLowBattery(): Promise<boolean> {
    try {
      const level = await Battery.getBatteryLevelAsync();
      const state = await Battery.getBatteryStateAsync();
      // If below 20% and not charging
      return level > 0 && level <= 0.2 && state !== Battery.BatteryState.CHARGING;
    } catch (e) {
      return false;
    }
  }

  public async shouldThrottleAnimations(): Promise<boolean> {
    // Check battery level; OS thermal state checking would need a native module like react-native-device-info
    const lowBattery = await this.isLowBattery();
    const powerSaveMode = await Battery.isLowPowerModeEnabledAsync().catch(() => false);
    return lowBattery || powerSaveMode;
  }
}

export const PowerManager = new PowerManagerClass();
