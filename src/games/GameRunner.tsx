import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GameCrashBoundary } from './GameCrashBoundary';
import { InGameOverlay } from './InGameOverlay';
import { GameModule, GameConfig } from './contracts';
import { useThemeStore } from '../core/themeStore';
import { SkiaGarbageCollector } from '../core/gc';

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
    theme: store.theme,
    audioEnabled: store.audioEnabled,
    sfxEnabled: store.sfxEnabled,
    safeAreaPadding: {
      top: insets.top,
      bottom: insets.bottom,
      left: insets.left,
      right: insets.right,
    }
  };

  useEffect(() => {
    // Mount
    module.initialize(config);
    module.start();

    return () => {
      // Unmount & GC
      module.destroy();
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

  const handleExit = () => {
    module.destroy();
    SkiaGarbageCollector.flush();
    onExit();
  };

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
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 }
});
