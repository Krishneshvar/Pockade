import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';

class AudioEngineClass {
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        interruptionModeIOS: InterruptionModeIOS.DuckOthers,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        shouldDuckAndroid: true,
      });
      this.isInitialized = true;
    } catch (e) {
      console.warn('AudioEngine initialization failed', e);
    }
  }

  async playSFX(key: string) {
    if (!this.isInitialized) await this.initialize();
    console.log(`[AudioEngine] Playing SFX: ${key}`);
  }

  async playBGM(key: string) {
    if (!this.isInitialized) await this.initialize();
    console.log(`[AudioEngine] Playing BGM: ${key}`);
  }
}

export const AudioEngine = new AudioEngineClass();
