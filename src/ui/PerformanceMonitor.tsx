import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import * as Device from 'expo-device';
import { useThemeStore } from '../core/themeStore';
import { useAppTheme } from './useAppTheme';
import { PowerManager } from '../managers/power';

const useFrameMetrics = () => {
  const [metrics, setMetrics] = useState({ fps: 60, frameMs: 16.7 });
  
  useEffect(() => {
    let lastFrameTime = performance.now();
    let frameCount = 0;
    let frameDurationTotal = 0;
    let animationFrameId: number;

    const loop = () => {
      const now = performance.now();
      frameDurationTotal += now - lastFrameTime;
      frameCount++;
      if (frameDurationTotal >= 1000) {
        setMetrics({
          fps: Math.round((frameCount * 1000) / frameDurationTotal),
          frameMs: Number((frameDurationTotal / frameCount).toFixed(1)),
        });
        frameCount = 0;
        frameDurationTotal = 0;
      }
      lastFrameTime = now;
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return metrics;
};

export const PerformanceMonitor: React.FC = () => {
  const { isPerformanceMonitorVisible } = useThemeStore();
  const { colors } = useAppTheme();
  const { fps, frameMs } = useFrameMetrics();
  const [maxMemoryMb, setMaxMemoryMb] = useState<number | null>(null);
  const [throttled, setThrottled] = useState(false);

  useEffect(() => {
    if (!__DEV__ || !isPerformanceMonitorVisible) {
      return;
    }

    Device.getMaxMemoryAsync?.()
      .then((value) => {
        setMaxMemoryMb(Math.round(value / 1024 / 1024));
      })
      .catch(() => {
        setMaxMemoryMb(null);
      });

    return PowerManager.observe((snapshot) => {
      setThrottled(snapshot.shouldThrottleAnimations);
    });
  }, [isPerformanceMonitorVisible]);

  if (!__DEV__ || !isPerformanceMonitorVisible) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]} pointerEvents="none">
      <Text style={{ color: colors.text, fontSize: 10, fontFamily: 'monospace', fontWeight: 'bold' }}>
        {`FPS ${fps} | ${frameMs}ms | MEM ${maxMemoryMb ?? '--'}MB | THR ${throttled ? 'ON' : 'OFF'}`}
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
