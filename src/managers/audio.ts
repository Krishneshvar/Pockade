import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { useThemeStore } from '../core/themeStore';
import { Logger } from '../core/logger';

class AudioEngineClass {
  private isInitialized = false;
  private sfxPool = new Map<string, Audio.Sound>();
  private bgm: { key: string; sound: Audio.Sound } | null = null;
  private unsubscribeTheme: (() => void) | null = null;

  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        interruptionModeIOS: InterruptionModeIOS.DuckOthers,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        shouldDuckAndroid: true,
      });

      // Subscribe to theme store to dynamically pause/resume audio if settings change
      this.unsubscribeTheme = useThemeStore.subscribe((current, prev) => {
        if (!current.audioEnabled && prev.audioEnabled) {
          void this.pauseBGM();
        } else if (current.audioEnabled && !prev.audioEnabled) {
          void this.resumeBGM();
        }
      });

      this.isInitialized = true;
      await Logger.debug('AudioEngine initialized');
    } catch (error) {
      await Logger.warn('AudioEngine initialization failed', { error: String(error) });
    }
  }

  async preloadSFX(key: string, source: any) {
    if (this.sfxPool.has(key)) {
      return;
    }

    try {
      const { sound } = await Audio.Sound.createAsync(source);
      this.sfxPool.set(key, sound);
    } catch (error) {
      await Logger.error(`Failed to preload SFX: ${key}`, { error: String(error) });
    }
  }

  async playSFX(key: string) {
    if (!useThemeStore.getState().sfxEnabled) {
      return;
    }

    if (!this.isInitialized) {
      await this.initialize();
    }

    const sound = this.sfxPool.get(key);
    if (!sound) {
      await Logger.warn(`SFX not preloaded: ${key}`);
      return;
    }

    try {
      await sound.replayAsync();
    } catch (error) {
      await Logger.warn(`Failed to play SFX: ${key}`, { error: String(error) });
    }
  }

  async playBGM(key: string, source: any) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.bgm?.key === key) {
      // Already playing this BGM
      if (useThemeStore.getState().audioEnabled) {
        await this.resumeBGM();
      }
      return;
    }

    await this.stopBGM();

    try {
      const { sound } = await Audio.Sound.createAsync(source, {
        isLooping: true,
        shouldPlay: useThemeStore.getState().audioEnabled,
      });
      
      this.bgm = { key, sound };
    } catch (error) {
      await Logger.error(`Failed to load BGM: ${key}`, { error: String(error) });
    }
  }

  async pauseBGM() {
    if (this.bgm?.sound) {
      const status = await this.bgm.sound.getStatusAsync();
      if (status.isLoaded && status.isPlaying) {
        await this.bgm.sound.pauseAsync();
      }
    }
  }

  async resumeBGM() {
    if (this.bgm?.sound && useThemeStore.getState().audioEnabled) {
      const status = await this.bgm.sound.getStatusAsync();
      if (status.isLoaded && !status.isPlaying) {
        await this.bgm.sound.playAsync();
      }
    }
  }

  async stopBGM() {
    if (this.bgm?.sound) {
      try {
        await this.bgm.sound.stopAsync();
        await this.bgm.sound.unloadAsync();
      } catch (e) {
        await Logger.warn('Failed to stop/unload old BGM', { error: String(e) });
      }
      this.bgm = null;
    }
  }

  async unloadAll() {
    await this.stopBGM();

    const unloadPromises = Array.from(this.sfxPool.values()).map((sound) =>
      sound.unloadAsync().catch(() => undefined)
    );
    await Promise.all(unloadPromises);
    this.sfxPool.clear();

    if (this.unsubscribeTheme) {
      this.unsubscribeTheme();
      this.unsubscribeTheme = null;
    }

    this.isInitialized = false;
  }
}

export const AudioEngine = new AudioEngineClass();
