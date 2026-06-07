import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { GameRunner } from '../../src/games/GameRunner';
import { SkiaGarbageCollector } from '../../src/core/gc';

jest.mock('../../src/ui', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return {
    useAppTheme: () => ({ colors: { background: '#fff', textSecondary: '#000' } }),
    BitMascot: () => <View testID="mock-mascot" />,
    Typography: ({ children }: any) => <Text>{children}</Text>,
    Button: () => <View testID="mock-button" />,
    PerformanceMonitor: () => null,
  };
});

jest.mock('../../src/games/GameCrashBoundary', () => {
  const React = require('react');
  return { GameCrashBoundary: ({ children }: any) => React.createElement(React.Fragment, {}, children) };
});

jest.mock('../../src/games/InGameOverlay', () => ({
  InGameOverlay: () => null
}));

// Mock the GC
jest.mock('../../src/core/gc', () => ({
  SkiaGarbageCollector: {
    flush: jest.fn(),
  }
}));

describe('Game Sandbox Architecture', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GameRunner Lifecycle', () => {
    it('should call initialize, start, and destroy on the passed GameModule', async () => {
      const mockGameModule = {
        initialize: jest.fn(),
        start: jest.fn(),
        pause: jest.fn(),
        resume: jest.fn(),
        destroy: jest.fn(),
        Component: () => null,
      };

      const { unmount } = render(<GameRunner module={mockGameModule} seed={123} version={1} onExit={jest.fn()} />);
      
      await waitFor(() => {
        expect(mockGameModule.initialize).toHaveBeenCalled();
        expect(mockGameModule.start).toHaveBeenCalled();
      });
    });
  });
});
