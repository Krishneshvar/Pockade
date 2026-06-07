import * as Linking from 'expo-linking';

export interface GameDeepLinkPayload {
  gameId: string;
  seed: number;
  version: number;
}

export function createGameDeepLink({ gameId, seed, version }: GameDeepLinkPayload) {
  return Linking.createURL(`/game/${gameId}`, {
    scheme: 'pockade',
    queryParams: {
      seed: String(seed),
      v: String(version),
    },
  });
}

export function parseGameDeepLink(url: string | null | undefined) {
  if (!url) {
    return null;
  }

  const parsed = Linking.parse(url);
  const pathSegments = parsed.path?.split('/').filter(Boolean) ?? [];

  if (pathSegments[0] !== 'game' || !pathSegments[1]) {
    return null;
  }

  const seed = Number(parsed.queryParams?.seed);
  const version = Number(parsed.queryParams?.v ?? 1);

  return {
    gameId: pathSegments[1],
    seed: Number.isFinite(seed) ? seed : 0,
    version: Number.isFinite(version) ? version : 1,
  };
}
