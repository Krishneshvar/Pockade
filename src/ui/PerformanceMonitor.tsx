import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useThemeStore } from '../core/themeStore';
import { useAppTheme } from './useAppTheme';

const useFPS = () => {
  const [fps, setFps] = useState(60);
  
  useEffect(() => {
    let lastFrameTime = performance.now();
    let frameCount = 0;
    let animationFrameId: number;

    const loop = () => {
      const now = performance.now();
      frameCount++;
      if (now - lastFrameTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastFrameTime)));
        frameCount = 0;
        lastFrameTime = now;
      }
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return fps;
};

export const PerformanceMonitor: React.FC = () => {
  const { isPerformanceMonitorVisible } = useThemeStore();
  const { colors } = useAppTheme();
  const fps = useFPS();

  if (!isPerformanceMonitorVisible) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]} pointerEvents="none">
      <Text style={{ color: colors.text, fontSize: 10, fontFamily: 'monospace', fontWeight: 'bold' }}>
        FPS: {fps}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 8,
    borderRadius: 8,
    opacity: 0.85,
    zIndex: 9999,
  }
});
