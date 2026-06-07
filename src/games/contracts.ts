import React from 'react';
import { DeterministicRNG } from '../core/rng';
import type { ColorBlindMode } from '../core/themeStore';
import type { OrientationPreference } from '../managers/orientation';

export interface GameConfig {
  seed: number;
  version: number;
  rng: DeterministicRNG;
  theme: 'light' | 'dark' | 'system';
  audioEnabled: boolean;
  sfxEnabled: boolean;
  hapticsEnabled: boolean;
  notificationsEnabled: boolean;
  performanceMode: boolean;
  colorBlindMode: ColorBlindMode;
  safeAreaPadding: { top: number; bottom: number; left: number; right: number };
  fontScale: number;
}

export interface GameState {
  score: number;
  isGameOver: boolean;
  metadata: Record<string, unknown>;
}

export interface GameModulePreferences {
  orientation?: OrientationPreference;
  keepAwake?: boolean;
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
  preferences?: GameModulePreferences;
  rules?: string[];
  initialize: (config: GameConfig) => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  saveState: () => GameState;
  loadState: (state: GameState) => void;
  destroy: () => void;
  restart?: () => void;
  Component: React.FC<{ config: GameConfig }>;
}

export interface GameCatalogEntry {
  id: string;
  name: string;
  tagline: string;
  category: 'logic' | 'word' | 'strategy';
  status: 'planned' | 'available';
  defaultOrientation: OrientationPreference;
  algorithmVersion: number;
  module?: GameModule;
}
