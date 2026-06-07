import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { SkiaGarbageCollector } from '../core/gc';
import { recordHealthEvent } from '../core/database';

export function useAppLifecycle(callbacks: {
  onBackground?: () => void;
  onForeground?: () => void;
}) {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      // Transitioning to background or inactive
      if (
        appState.current.match(/active/) &&
        nextAppState.match(/inactive|background/)
      ) {
        recordHealthEvent('app_backgrounded', 'App transitioned to background.');
        
        // Aggressively flush memory before OS suspends the process
        SkiaGarbageCollector.flush();
        
        if (callbacks.onBackground) {
          callbacks.onBackground();
        }
      }

      // Transitioning to foreground
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        recordHealthEvent('app_foregrounded', 'App transitioned to foreground.');
        
        if (callbacks.onForeground) {
          callbacks.onForeground();
        }
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [callbacks]);
}
