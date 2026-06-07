import { type GameCatalogEntry } from './contracts';

export const GAME_CATALOG: GameCatalogEntry[] = [
  {
    id: 'sudoku',
    name: 'Sudoku',
    tagline: 'Procedural numbers with deterministic seeds.',
    category: 'logic',
    status: 'planned',
    defaultOrientation: 'portrait',
    algorithmVersion: 1,
  },
  {
    id: 'tower-capture',
    name: 'Tower Capture',
    tagline: 'Fast territory strategy with landscape support.',
    category: 'strategy',
    status: 'planned',
    defaultOrientation: 'landscape',
    algorithmVersion: 1,
  },
  {
    id: 'wordle',
    name: 'Wordle',
    tagline: 'A daily-feeling word puzzle that works offline forever.',
    category: 'word',
    status: 'planned',
    defaultOrientation: 'portrait',
    algorithmVersion: 1,
  },
  {
    id: 'hangman',
    name: 'Hangman',
    tagline: 'Classic letter guessing powered by local dictionaries.',
    category: 'word',
    status: 'planned',
    defaultOrientation: 'portrait',
    algorithmVersion: 1,
  },
];

export function getGameCatalogEntry(gameId: string) {
  return GAME_CATALOG.find((entry) => entry.id === gameId) ?? null;
}
