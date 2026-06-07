import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { GameRunner } from '../../src/games/GameRunner';
import { GameCrashBoundary } from '../../src/games/GameCrashBoundary';

jest.mock('../../src/ui', () => {
  const React = require('react');
  const { View, Text, Pressable } = require('react-native');
  return {
    useAppTheme: () => ({
      activeTheme: 'light',
      colors: { background: '#fff', textSecondary: '#000', text: '#000' },
    }),
    BitMascot: () => <View testID="mock-mascot" />,
    Typography: ({ children }: any) => <Text>{children}</Text>,
    Button: ({ title, onPress }: any) => <Pressable onPress={onPress}><Text>{title}</Text></Pressable>,
    PerformanceMonitor: () => null,
  };
});

jest.mock('../../src/core/gc', () => ({
  SkiaGarbageCollector: {
    flush: jest.fn(),
  },
}));

jest.mock('../../src/core/database', () => ({
  saveGameSession: jest.fn().mockResolvedValue(null),
  getGameSession: jest.fn().mockResolvedValue(null),
  recordSeedHistory: jest.fn().mockResolvedValue(null),
  deleteGameSession: jest.fn().mockResolvedValue(null),
}));

describe('Game Sandbox Architecture', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('calls initialize and start for the passed GameModule', async () => {
    const mockGameModule = {
      id: 'mock-game',
      name: 'Mock Game',
      version: 1,
      initialize: jest.fn(),
      start: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      saveState: jest.fn(() => ({ score: 0, isGameOver: false, metadata: {} })),
      loadState: jest.fn(),
      destroy: jest.fn(),
      Component: () => null,
    };

    await render(<GameRunner module={mockGameModule} seed={123} version={1} onExit={jest.fn()} />);

    await waitFor(() => {
      expect(mockGameModule.initialize).toHaveBeenCalled();
      expect(mockGameModule.start).toHaveBeenCalled();
    });
  });

  it('renders the crash fallback when a game throws', async () => {
    const ExplodingComponent = () => {
      throw new Error('kaboom');
    };

    const screen = await render(
      <GameCrashBoundary onReturnToDashboard={jest.fn()}>
        <ExplodingComponent />
      </GameCrashBoundary>
    );

    expect(screen.getByText('Oops! The Game Crashed.')).toBeTruthy();
    expect(screen.getByText('kaboom')).toBeTruthy();
  });
});
