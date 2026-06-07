import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Slot, useRouter } from 'expo-router';
import * as ExpoLinking from 'expo-linking';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useAppTheme, BitMascot, Typography, PerformanceMonitor } from '../ui';
import { bootstrapShell } from '../core/bootstrap';
import { Logger } from '../core/logger';
import { parseGameDeepLink } from '../core/deepLinking';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [bootError, setBootError] = useState<string | null>(null);
  const { colors, activeTheme } = useAppTheme();
  const router = useRouter();

  useEffect(() => {
    async function bootstrap() {
      try {
        await bootstrapShell();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown bootstrap error';
        setBootError(message);
        await Logger.error('Shell bootstrap failed', { message });
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    void bootstrap();
  }, []);

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(colors.background).catch(() => undefined);
  }, [colors.background]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const navigateFromUrl = (url: string | null) => {
      const parsed = parseGameDeepLink(url);
      if (!parsed) {
        return;
      }

      router.push({
        pathname: '/game/[gameId]',
        params: {
          gameId: parsed.gameId,
          seed: String(parsed.seed),
          v: String(parsed.version),
        },
      });
    };

    void ExpoLinking.getInitialURL().then(navigateFromUrl);

    const subscription = ExpoLinking.addEventListener('url', ({ url }) => {
      navigateFromUrl(url);
    });

    return () => subscription.remove();
  }, [isReady, router]);

  if (!isReady) {
    return (
      <View style={[styles.splash, { backgroundColor: colors.background }]}>
        <BitMascot size={120} emotion="happy" />
        <Typography variant="h2" style={{ marginTop: 32 }}>Pockade</Typography>
        <Typography variant="caption" color={colors.textSecondary}>
          Bootstrapping the offline arcade...
        </Typography>
      </View>
    );
  }

  if (bootError) {
    return (
      <View style={[styles.splash, { backgroundColor: colors.background }]}>
        <BitMascot size={120} emotion="sad" />
        <Typography variant="h2" style={{ marginTop: 32 }}>Bootstrap Failed</Typography>
        <Typography variant="body" color={colors.textSecondary} align="center" style={styles.error}>
          {bootError}
        </Typography>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style={activeTheme === 'dark' ? 'light' : 'dark'} />
        <View style={[styles.root, { backgroundColor: colors.background }]}>
          <Slot />
          <PerformanceMonitor />
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  error: {
    marginTop: 16,
    maxWidth: 320,
  },
});
