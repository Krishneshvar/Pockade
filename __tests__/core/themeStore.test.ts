import { useThemeStore } from '../../src/core/themeStore';
import { storage } from '../../src/core/storage';

describe('themeStore', () => {
  let mockStorage: any;

  beforeEach(() => {
    mockStorage = storage as any;
    mockStorage.set.mockClear();
    mockStorage.getString.mockClear();
    mockStorage.getBoolean.mockClear();
    
    useThemeStore.setState({
      theme: 'system',
      performanceMode: false,
      audioEnabled: true,
      sfxEnabled: true,
      hapticsEnabled: true,
      notificationsEnabled: false,
      colorBlindMode: 'off',
      isPerformanceMonitorVisible: false,
    });
  });

  it('initializes with default values if storage is empty', () => {
    const state = useThemeStore.getState();
    expect(state.theme).toBe('system');
    expect(state.performanceMode).toBe(false);
  });

  it('setTheme updates state and persists to MMKV', () => {
    useThemeStore.getState().setTheme('dark');
    expect(useThemeStore.getState().theme).toBe('dark');
    expect(mockStorage.set).toHaveBeenCalledWith('app.settings.theme', 'dark');
  });

  it('setPerformanceMode updates state and persists to MMKV', () => {
    useThemeStore.getState().setPerformanceMode(true);
    expect(useThemeStore.getState().performanceMode).toBe(true);
    expect(mockStorage.set).toHaveBeenCalledWith('app.settings.perf_mode', true);
  });

  it('setAudioEnabled updates state and persists to MMKV', () => {
    useThemeStore.getState().setAudioEnabled(false);
    expect(useThemeStore.getState().audioEnabled).toBe(false);
    expect(mockStorage.set).toHaveBeenCalledWith('app.settings.audio', false);
  });

  it('setNotificationsEnabled updates state and persists to MMKV', () => {
    useThemeStore.getState().setNotificationsEnabled(true);
    expect(useThemeStore.getState().notificationsEnabled).toBe(true);
    expect(mockStorage.set).toHaveBeenCalledWith('app.settings.notifications', true);
  });

  it('setColorBlindMode updates state and persists to MMKV', () => {
    useThemeStore.getState().setColorBlindMode('deuteranopia');
    expect(useThemeStore.getState().colorBlindMode).toBe('deuteranopia');
    expect(mockStorage.set).toHaveBeenCalledWith('app.settings.color_blind_mode', 'deuteranopia');
  });

  it('setPerformanceMonitorVisible updates state and persists to MMKV', () => {
    useThemeStore.getState().setPerformanceMonitorVisible(true);
    expect(useThemeStore.getState().isPerformanceMonitorVisible).toBe(true);
    expect(mockStorage.set).toHaveBeenCalledWith('app.settings.perf_mon', true);
  });
});
