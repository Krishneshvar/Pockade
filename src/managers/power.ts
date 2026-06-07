import * as Battery from 'expo-battery';
import * as KeepAwake from 'expo-keep-awake';

export interface PowerSnapshot {
  batteryLevel: number | null;
  batteryState: Battery.BatteryState | null;
  lowPowerMode: boolean;
  shouldThrottleAnimations: boolean;
}

class PowerManagerClass {
  private wakeLockActive = false;

  enableWakeLock() {
    if (!this.wakeLockActive) {
      KeepAwake.activateKeepAwakeAsync('game-session').catch(() => undefined);
      this.wakeLockActive = true;
    }
  }

  disableWakeLock() {
    if (this.wakeLockActive) {
      KeepAwake.deactivateKeepAwake('game-session').catch(() => undefined);
      this.wakeLockActive = false;
    }
  }

  async getSnapshot(): Promise<PowerSnapshot> {
    const [batteryLevel, batteryState, lowPowerMode] = await Promise.all([
      Battery.getBatteryLevelAsync().catch(() => null),
      Battery.getBatteryStateAsync().catch(() => null),
      Battery.isLowPowerModeEnabledAsync().catch(() => false),
    ]);

    const isLowBattery =
      typeof batteryLevel === 'number' &&
      batteryLevel > 0 &&
      batteryLevel <= 0.2 &&
      batteryState !== Battery.BatteryState.CHARGING;

    return {
      batteryLevel,
      batteryState,
      lowPowerMode,
      shouldThrottleAnimations: isLowBattery || lowPowerMode,
    };
  }

  async shouldThrottleAnimations() {
    const snapshot = await this.getSnapshot();
    return snapshot.shouldThrottleAnimations;
  }

  observe(callback: (snapshot: PowerSnapshot) => void) {
    const notify = async () => {
      callback(await this.getSnapshot());
    };

    const levelListener = Battery.addBatteryLevelListener(() => {
      void notify();
    });
    const stateListener = Battery.addBatteryStateListener(() => {
      void notify();
    });
    const powerModeListener = Battery.addLowPowerModeListener(() => {
      void notify();
    });

    void notify();

    return () => {
      levelListener.remove();
      stateListener.remove();
      powerModeListener.remove();
    };
  }
}

export const PowerManager = new PowerManagerClass();
