import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-worklets', () => {
  return new Proxy({}, {
    get: (target, prop) => {
      if (prop === '__esModule') return true;
      if (prop === 'serializableMappingCache') return new Map();
      return jest.fn((v) => v);
    }
  });
});

// Reanimated mock
require('react-native-reanimated').setUpTests();

// Skia mock
jest.mock('@shopify/react-native-skia', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Canvas: (props) => React.createElement(View, { testID: 'skia-canvas', ...props }, props.children),
    Group: (props) => React.createElement(View, { testID: 'skia-group', ...props }, props.children),
    Path: (props) => React.createElement(View, { testID: 'skia-path', ...props }, props.children),
    RoundedRect: (props) => React.createElement(View, { testID: 'skia-rounded-rect', ...props }, props.children),
    Circle: (props) => React.createElement(View, { testID: 'skia-circle', ...props }, props.children),
    Shadow: (props) => React.createElement(View, { testID: 'skia-shadow', ...props }, props.children),
    BackdropBlur: (props) => React.createElement(View, { testID: 'skia-backdrop-blur', ...props }, props.children),
    Fill: (props) => React.createElement(View, { testID: 'skia-fill', ...props }, props.children),
    vec: jest.fn((x, y) => ({ x, y })),
    useValue: jest.fn((v) => ({ current: v })),
    useComputedValue: jest.fn((fn) => ({ current: fn() })),
    useClockValue: jest.fn(() => ({ current: 0 })),
  };
});

// MMKV Mock
jest.mock('react-native-mmkv', () => {
  return {
    createMMKV: jest.fn().mockImplementation(() => ({
      set: jest.fn(),
      getString: jest.fn(),
      getNumber: jest.fn(),
      getBoolean: jest.fn(),
      contains: jest.fn(),
      delete: jest.fn(),
      getAllKeys: jest.fn(),
      clearAll: jest.fn(),
    })),
  };
});

// OP-SQLite Mock
jest.mock('@op-engineering/op-sqlite', () => ({
  open: jest.fn().mockReturnValue({
    execute: jest.fn().mockResolvedValue({ rows: [], rowsAffected: 0 }),
    executeAsync: jest.fn(),
    transaction: jest.fn(async (callback) => {
      await callback({
        execute: jest.fn().mockResolvedValue({ rows: [], rowsAffected: 0 }),
      });
    }),
    close: jest.fn(),
    closeAsync: jest.fn().mockResolvedValue(),
    getDbPath: jest.fn(() => 'file:///mock/doc/dir/pockade.sqlite'),
  }),
}));

// Expo Modules Mocks
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(() => 'mocked-uuid'),
  digestStringAsync: jest.fn(async () => 'mocked-hash'),
  CryptoDigestAlgorithm: {
    SHA256: 'SHA256',
  },
}));

jest.mock('expo-screen-orientation', () => ({
  lockAsync: jest.fn(),
  unlockAsync: jest.fn(),
  OrientationLock: {
    PORTRAIT_UP: 1,
    LANDSCAPE: 2,
  },
}));

jest.mock('expo-av', () => ({
  Audio: {
    setAudioModeAsync: jest.fn().mockResolvedValue(),
    Sound: {
      createAsync: jest.fn().mockResolvedValue({
        sound: {
          replayAsync: jest.fn().mockResolvedValue(),
          playAsync: jest.fn().mockResolvedValue(),
          pauseAsync: jest.fn().mockResolvedValue(),
          stopAsync: jest.fn().mockResolvedValue(),
          unloadAsync: jest.fn().mockResolvedValue(),
          getStatusAsync: jest.fn().mockResolvedValue({ isLoaded: true, isPlaying: true }),
        }
      })
    }
  },
  InterruptionModeIOS: { DuckOthers: 1 },
  InterruptionModeAndroid: { DuckOthers: 1 },
}));

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn().mockResolvedValue(),
  impactAsync: jest.fn().mockResolvedValue(),
  notificationAsync: jest.fn().mockResolvedValue(),
  ImpactFeedbackStyle: { Light: 0, Heavy: 2 },
  NotificationFeedbackType: { Success: 0, Error: 1 },
}));

jest.mock('expo-battery', () => ({
  getBatteryLevelAsync: jest.fn().mockResolvedValue(1),
  getBatteryStateAsync: jest.fn().mockResolvedValue(1),
  isLowPowerModeEnabledAsync: jest.fn().mockResolvedValue(false),
  addBatteryLevelListener: jest.fn(() => ({ remove: jest.fn() })),
  addBatteryStateListener: jest.fn(() => ({ remove: jest.fn() })),
  addLowPowerModeListener: jest.fn(() => ({ remove: jest.fn() })),
  BatteryState: { CHARGING: 2 },
}));

jest.mock('expo-keep-awake', () => ({
  activateKeepAwakeAsync: jest.fn().mockResolvedValue(),
  deactivateKeepAwake: jest.fn(),
}));

jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///mock/doc/dir/',
  getInfoAsync: jest.fn().mockResolvedValue({ exists: true }),
  writeAsStringAsync: jest.fn().mockResolvedValue(),
  readAsStringAsync: jest.fn().mockResolvedValue('mocked logs'),
  EncodingType: { UTF8: 'utf8' },
}));

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///mock/doc/dir/',
  getInfoAsync: jest.fn().mockResolvedValue({ exists: true, size: 32 }),
  writeAsStringAsync: jest.fn().mockResolvedValue(),
  readAsStringAsync: jest.fn().mockResolvedValue('mocked logs'),
  deleteAsync: jest.fn().mockResolvedValue(),
  moveAsync: jest.fn().mockResolvedValue(),
  copyAsync: jest.fn().mockResolvedValue(),
  makeDirectoryAsync: jest.fn().mockResolvedValue(),
  EncodingType: { UTF8: 'utf8', Base64: 'base64' },
}));

jest.mock('expo-device', () => ({
  osName: 'MockOS',
  osVersion: '1.0',
  modelName: 'MockPhone',
  brand: 'MockBrand',
  totalMemory: 8589934592, // 8GB
}));

jest.mock('expo-application', () => ({
  nativeApplicationVersion: '1.0.0',
  nativeBuildVersion: '1',
}));

jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: jest.fn().mockImplementation(({ children }) => children),
    SafeAreaConsumer: jest.fn().mockImplementation(({ children }) => children(inset)),
    useSafeAreaInsets: jest.fn().mockReturnValue(inset),
  };
});

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn().mockResolvedValue(null),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('notification-id'),
  AndroidImportance: { DEFAULT: 3 },
  SchedulableTriggerInputTypes: { DAILY: 'daily' },
}));

jest.mock('expo-linking', () => ({
  createURL: jest.fn((path, options) => {
    const query = options?.queryParams
      ? `?${new URLSearchParams(options.queryParams).toString()}`
      : '';
    return `pockade:///${path.replace(/^\//, '')}${query}`;
  }),
  parse: jest.fn((url) => {
    const parsed = new URL(url.replace('pockade:///', 'https://app/'));
    return {
      path: parsed.pathname.replace(/^\//, ''),
      queryParams: Object.fromEntries(parsed.searchParams.entries()),
    };
  }),
  getInitialURL: jest.fn().mockResolvedValue(null),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
}));

jest.mock('expo-system-ui', () => ({
  setBackgroundColorAsync: jest.fn().mockResolvedValue(),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(),
}));

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn().mockResolvedValue({
    canceled: false,
    assets: [{ uri: 'file:///mock/doc/dir/mocked_backup.pock' }]
  }),
}));

jest.mock('react-native-quick-crypto', () => require('crypto'));
