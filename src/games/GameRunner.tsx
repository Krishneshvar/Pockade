import React, { useEffect, useState } from 'react';
import { AppState, PixelRatio, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GameCrashBoundary } from './GameCrashBoundary';
import { InGameOverlay } from './InGameOverlay';
import { GameModule, GameConfig } from './contracts';
import { useAppLifecycle } from '../managers/lifecycle';
import { useThemeStore } from '../core/themeStore';
import { SkiaGarbageCollector } from '../core/gc';
import { DeterministicRNG } from '../core/rng';
import {
  deleteGameSession,
  getGameSession,
  recordSeedHistory,
  saveGameSession,
} from '../core/database';
import { Logger } from '../core/logger';
import { OrientationManager } from '../managers/orientation';
import { PowerManager } from '../managers/power';

interface GameRunnerProps {
  module: GameModule;
  seed: number;
  version: number;
  onExit: () => void;
}

export const GameRunner: React.FC<GameRunnerProps> = ({ module, seed, version, onExit }) => {
  const insets = useSafeAreaInsets();
  const store = useThemeStore();
  const [isOverlayVisible, setOverlayVisible] = useState(false);

  const config: GameConfig = {
    seed,
    version,
    rng: new DeterministicRNG(seed),
    theme: store.theme,
    audioEnabled: store.audioEnabled,
    sfxEnabled: store.sfxEnabled,
    hapticsEnabled: store.hapticsEnabled,
    notificationsEnabled: store.notificationsEnabled,
    performanceMode: store.performanceMode,
    colorBlindMode: store.colorBlindMode,
    fontScale: PixelRatio.getFontScale(),
    safeAreaPadding: {
      top: insets.top,
      bottom: insets.bottom,
      left: insets.left,
      right: insets.right,
    },
  };

  async function persistState() {
    const snapshot = module.saveState();
    await saveGameSession({
      gameId: module.id,
      seed,
      algorithmVersion: version,
      stateJson: JSON.stringify(snapshot),
    });
  }

  useEffect(() => {
    let mounted = true;

    async function mountGame() {
      await OrientationManager.lockForPreference(module.preferences?.orientation ?? 'portrait');
      if (module.preferences?.keepAwake) {
        PowerManager.enableWakeLock();
      }

      const persistedSession = await getGameSession(module.id);

      module.initialize(config);
      if (
        persistedSession &&
        persistedSession.seed === seed &&
        persistedSession.algorithmVersion === version
      ) {
        module.loadState(JSON.parse(persistedSession.stateJson));
      } else {
        await recordSeedHistory(module.id, seed, version);
      }
      module.start();
      await Logger.info('Game module mounted', { gameId: module.id, seed, version });
    }

    void mountGame();

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (!mounted) {
        return;
      }

      if (nextState === 'active') {
        module.resume();
        return;
      }

      module.pause();
      void persistState();
    });

    return () => {
      mounted = false;
      subscription.remove();
      void persistState().catch(() => undefined);
      module.destroy();
      PowerManager.disableWakeLock();
      void OrientationManager.resetToShellDefault();
      SkiaGarbageCollector.flush();
    };
  }, []);

  const handlePause = () => {
    module.pause();
    setOverlayVisible(true);
  };

  const handleResume = () => {
    setOverlayVisible(false);
    module.resume();
  };

  const handleRestart = async () => {
    await deleteGameSession(module.id);
    setOverlayVisible(false);

    if (module.restart) {
      module.restart();
      return;
    }

    module.destroy();
    module.initialize(config);
    module.start();
  };

  const handleExit = () => {
    void persistState().catch(() => undefined);
    module.destroy();
    PowerManager.disableWakeLock();
    void OrientationManager.resetToShellDefault();
    SkiaGarbageCollector.flush();
    onExit();
  };

  useAppLifecycle({
    onBackground: () => {
      // Auto-pause and aggressively flush state when OS suspends
      if (!isOverlayVisible) {
        handlePause();
      }
      void persistState().catch(() => undefined);
    }
  });

  return (
    <View style={styles.container}>
      <GameCrashBoundary onReturnToDashboard={handleExit}>
        <module.Component config={config} />
      </GameCrashBoundary>

      <InGameOverlay
        isVisible={isOverlayVisible}
        onResume={handleResume}
        onExit={handleExit}
        onPauseRequest={handlePause}
        onRestart={() => {
          void handleRestart();
        }}
        rules={module.rules}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});
