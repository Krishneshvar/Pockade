import { createGameDeepLink, parseGameDeepLink } from '../../src/core/deepLinking';

describe('deep linking', () => {
  it('creates and parses a game deep link', () => {
    const url = createGameDeepLink({
      gameId: 'sudoku',
      seed: 12345,
      version: 3,
    });

    expect(url).toContain('sudoku');
    expect(parseGameDeepLink(url)).toEqual({
      gameId: 'sudoku',
      seed: 12345,
      version: 3,
    });
  });

  it('returns null for unsupported links', () => {
    expect(parseGameDeepLink('pockade://settings')).toBeNull();
  });
});
