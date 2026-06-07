export interface OpenSourceEntry {
  name: string;
  license: string;
  url: string;
  reason: string;
}

export const OPEN_SOURCE_DISCLOSURES: OpenSourceEntry[] = [
  {
    name: 'Expo',
    license: 'MIT',
    url: 'https://github.com/expo/expo',
    reason: 'Application runtime, routing, native APIs, and build tooling.',
  },
  {
    name: 'React Native',
    license: 'MIT',
    url: 'https://github.com/facebook/react-native',
    reason: 'Cross-platform mobile UI runtime.',
  },
  {
    name: 'React Native Skia',
    license: 'MIT',
    url: 'https://github.com/Shopify/react-native-skia',
    reason: 'High-performance game and shell rendering surfaces.',
  },
  {
    name: 'React Native Reanimated',
    license: 'MIT',
    url: 'https://github.com/software-mansion/react-native-reanimated',
    reason: 'Fluid shell and mascot animations.',
  },
  {
    name: 'Zustand',
    license: 'MIT',
    url: 'https://github.com/pmndrs/zustand',
    reason: 'Shell settings and runtime state management.',
  },
  {
    name: 'react-native-mmkv',
    license: 'MIT',
    url: 'https://github.com/mrousavy/react-native-mmkv',
    reason: 'Fast local key-value settings storage.',
  },
  {
    name: '@op-engineering/op-sqlite',
    license: 'MIT',
    url: 'https://github.com/OP-Engineering/op-sqlite',
    reason: 'Offline relational persistence for sessions, seeds, and scores.',
  },
];
