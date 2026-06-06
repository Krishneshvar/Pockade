import { create } from 'zustand';
import { storage } from './storage';
import { ThemeType } from '../ui/colors';

interface ThemeState {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  performanceMode: boolean;
  setPerformanceMode: (enabled: boolean) => void;
  audioEnabled: boolean;
  setAudioEnabled: (enabled: boolean) => void;
  sfxEnabled: boolean;
  setSfxEnabled: (enabled: boolean) => void;
}

// MMKV Keys
const THEME_KEY = 'app.settings.theme';
const PERF_MODE_KEY = 'app.settings.perf_mode';
const AUDIO_KEY = 'app.settings.audio';
const SFX_KEY = 'app.settings.sfx';

export const useThemeStore = create<ThemeState>((set) => ({
  theme: (storage.getString(THEME_KEY) as ThemeType) || 'system',
  setTheme: (theme) => {
    storage.set(THEME_KEY, theme);
    set({ theme });
  },
  
  performanceMode: storage.getBoolean(PERF_MODE_KEY) ?? false,
  setPerformanceMode: (enabled) => {
    storage.set(PERF_MODE_KEY, enabled);
    set({ performanceMode: enabled });
  },
  
  audioEnabled: storage.getBoolean(AUDIO_KEY) ?? true,
  setAudioEnabled: (enabled) => {
    storage.set(AUDIO_KEY, enabled);
    set({ audioEnabled: enabled });
  },
  
  sfxEnabled: storage.getBoolean(SFX_KEY) ?? true,
  setSfxEnabled: (enabled) => {
    storage.set(SFX_KEY, enabled);
    set({ sfxEnabled: enabled });
  }
}));
