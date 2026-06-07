import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { useThemeStore } from '../core/themeStore';
import { Logger } from '../core/logger';

// Define localized type interface for expo-audio AudioPlayer instance
interface AudioPlayerInstance {
  play(): void;
  pause(): void;
  stop(): void;
  seekTo(position: number): Promise<void>;
  release(): void;
  loop: boolean;
  volume: number;
}

class AudioEngineClass {
  private isInitialized = false;
  private sfxPool = new Map<string, AudioPlayerInstance>();
  private bgm: { key: string; player: AudioPlayerInstance } | null = null;
  private unsubscribeTheme: (() => void) | null = null;

  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        interruptionMode: 'duckOthers',
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
      const player = createAudioPlayer(source) as unknown as AudioPlayerInstance;
      this.sfxPool.set(key, player);
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

    const player = this.sfxPool.get(key);
    if (!player) {
      await Logger.warn(`SFX not preloaded: ${key}`);
      return;
    }

    try {
      await player.seekTo(0);
      player.play();
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
      const player = createAudioPlayer(source) as unknown as AudioPlayerInstance;
      player.loop = true;
      
      if (useThemeStore.getState().audioEnabled) {
        player.play();
      }
      
      this.bgm = { key, player };
    } catch (error) {
      await Logger.error(`Failed to load BGM: ${key}`, { error: String(error) });
    }
  }

  async pauseBGM() {
    if (this.bgm?.player) {
      this.bgm.player.pause();
    }
  }

  async resumeBGM() {
    if (this.bgm?.player && useThemeStore.getState().audioEnabled) {
      this.bgm.player.play();
    }
  }

  async stopBGM() {
    if (this.bgm?.player) {
      try {
        this.bgm.player.stop();
        this.bgm.player.release();
      } catch (e) {
        await Logger.warn('Failed to stop/release old BGM', { error: String(e) });
      }
      this.bgm = null;
    }
  }

  async unloadAll() {
    await this.stopBGM();

    for (const player of this.sfxPool.values()) {
      try {
        player.release();
      } catch (e) {
        // ignore errors during cleanup
      }
    }
    this.sfxPool.clear();

    if (this.unsubscribeTheme) {
      this.unsubscribeTheme();
      this.unsubscribeTheme = null;
    }

    this.isInitialized = false;
  }
}

export const AudioEngine = new AudioEngineClass();
