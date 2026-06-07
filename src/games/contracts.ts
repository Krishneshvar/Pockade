import React from 'react';

export interface GameConfig {
  seed: number;
  version: number;
  theme: 'light' | 'dark' | 'system';
  audioEnabled: boolean;
  sfxEnabled: boolean;
  safeAreaPadding: { top: number; bottom: number; left: number; right: number };
}

export interface GameState {
  score: number;
  isGameOver: boolean;
  metadata: Record<string, any>;
}

/**
 * [AGENT DIRECTIVE - STRICT ENFORCEMENT REQUIRED]
 * The "No-Bleed" Rule: Game Modules CANNOT import dependencies, states, or logic from other Game Modules. 
 * They may only communicate with the Shell via this Unified Game Interface Contract.
 */
export interface GameModule {
  id: string;
  name: string;
  version: number;
  initialize: (config: GameConfig) => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  saveState: () => GameState;
  loadState: (state: GameState) => void;
  destroy: () => void;
  Component: React.FC<{ config: GameConfig }>;
}
