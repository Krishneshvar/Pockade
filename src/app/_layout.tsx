import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useAppTheme, BitMascot, Typography, PerformanceMonitor } from '../ui';
import { initializeDatabase } from '../core/database';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const { colors } = useAppTheme();

  useEffect(() => {
    async function bootstrap() {
      try {
        // 1. Initialize DB
        initializeDatabase();
        // 2. Simulate a slight delay to show off the mascot bootstrapper
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    bootstrap();
  }, []);

  if (!isReady) {
    return (
      <View style={[styles.splash, { backgroundColor: colors.background }]}>
        <BitMascot size={120} emotion="happy" />
        <Typography variant="h2" style={{ marginTop: 32 }}>Pockade</Typography>
        <Typography variant="caption" color={colors.textSecondary}>Loading assets...</Typography>
      </View>
    );
  }

  return (
    <View style={[{ flex: 1, backgroundColor: colors.background }]}>
      <Slot />
      <PerformanceMonitor />
    </View>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
