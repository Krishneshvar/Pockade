import { create } from 'zustand';
import { storage } from './storage';
import { ThemeType } from '../ui/colors';

export type ColorBlindMode = 'off' | 'deuteranopia' | 'protanopia' | 'tritanopia';

interface AppSettingsState {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  performanceMode: boolean;
  setPerformanceMode: (enabled: boolean) => void;
  audioEnabled: boolean;
  setAudioEnabled: (enabled: boolean) => void;
  sfxEnabled: boolean;
  setSfxEnabled: (enabled: boolean) => void;
  hapticsEnabled: boolean;
  setHapticsEnabled: (enabled: boolean) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  colorBlindMode: ColorBlindMode;
  setColorBlindMode: (mode: ColorBlindMode) => void;
  isPerformanceMonitorVisible: boolean;
  setPerformanceMonitorVisible: (enabled: boolean) => void;
}

const SETTINGS_KEYS = {
  theme: 'app.settings.theme',
  performanceMode: 'app.settings.perf_mode',
  audioEnabled: 'app.settings.audio',
  sfxEnabled: 'app.settings.sfx',
  hapticsEnabled: 'app.settings.haptics',
  notificationsEnabled: 'app.settings.notifications',
  colorBlindMode: 'app.settings.color_blind_mode',
  performanceMonitorVisible: 'app.settings.perf_mon',
} as const;

const getBoolean = (key: string, fallback: boolean) => storage.getBoolean(key) ?? fallback;

export const useThemeStore = create<AppSettingsState>((set) => ({
  theme: (storage.getString(SETTINGS_KEYS.theme) as ThemeType | undefined) ?? 'system',
  setTheme: (theme) => {
    storage.set(SETTINGS_KEYS.theme, theme);
    set({ theme });
  },

  performanceMode: getBoolean(SETTINGS_KEYS.performanceMode, false),
  setPerformanceMode: (enabled) => {
    storage.set(SETTINGS_KEYS.performanceMode, enabled);
    set({ performanceMode: enabled });
  },

  audioEnabled: getBoolean(SETTINGS_KEYS.audioEnabled, true),
  setAudioEnabled: (enabled) => {
    storage.set(SETTINGS_KEYS.audioEnabled, enabled);
    set({ audioEnabled: enabled });
  },

  sfxEnabled: getBoolean(SETTINGS_KEYS.sfxEnabled, true),
  setSfxEnabled: (enabled) => {
    storage.set(SETTINGS_KEYS.sfxEnabled, enabled);
    set({ sfxEnabled: enabled });
  },

  hapticsEnabled: getBoolean(SETTINGS_KEYS.hapticsEnabled, true),
  setHapticsEnabled: (enabled) => {
    storage.set(SETTINGS_KEYS.hapticsEnabled, enabled);
    set({ hapticsEnabled: enabled });
  },

  notificationsEnabled: getBoolean(SETTINGS_KEYS.notificationsEnabled, false),
  setNotificationsEnabled: (enabled) => {
    storage.set(SETTINGS_KEYS.notificationsEnabled, enabled);
    set({ notificationsEnabled: enabled });
  },

  colorBlindMode:
    (storage.getString(SETTINGS_KEYS.colorBlindMode) as ColorBlindMode | undefined) ?? 'off',
  setColorBlindMode: (mode) => {
    storage.set(SETTINGS_KEYS.colorBlindMode, mode);
    set({ colorBlindMode: mode });
  },

  isPerformanceMonitorVisible: getBoolean(SETTINGS_KEYS.performanceMonitorVisible, false),
  setPerformanceMonitorVisible: (enabled) => {
    storage.set(SETTINGS_KEYS.performanceMonitorVisible, enabled);
    set({ isPerformanceMonitorVisible: enabled });
  },
}));

export const appSettingsKeys = SETTINGS_KEYS;
