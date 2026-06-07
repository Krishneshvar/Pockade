import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GameRunner, getGameCatalogEntry } from '../../games';
import { useAppTheme, Typography, Card, Button } from '../../ui';
import { createGameDeepLink } from '../../core/deepLinking';

export default function GameRoute() {
  const params = useLocalSearchParams<{ gameId: string; seed?: string; v?: string }>();
  const router = useRouter();
  const { colors } = useAppTheme();
  const gameId = Array.isArray(params.gameId) ? params.gameId[0] : params.gameId;
  const seed = Number(Array.isArray(params.seed) ? params.seed[0] : params.seed ?? Date.now());
  const version = Number(Array.isArray(params.v) ? params.v[0] : params.v ?? 1);
  const game = gameId ? getGameCatalogEntry(gameId) : null;

  if (game?.module) {
    return (
      <GameRunner
        module={game.module}
        seed={seed}
        version={version}
        onExit={() => router.back()}
      />
    );
  }

  const shareLink = gameId
    ? createGameDeepLink({
        gameId,
        seed,
        version,
      })
    : null;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Button title="Back" variant="secondary" onPress={() => router.back()} style={{ width: 96 }} />
        <Typography variant="h1">{game?.name ?? 'Unknown Game'}</Typography>
      </View>

      <Card style={styles.card}>
        <Typography variant="h2">
          {game ? 'Shell Route Ready' : 'Game Not Registered'}
        </Typography>
        <Typography variant="body" color={colors.textSecondary} style={styles.body}>
          {game
            ? 'This title is cataloged, seeded, deep-linkable, and ready for its future module implementation.'
            : 'This route exists, but no catalog entry was found for the requested game ID.'}
        </Typography>
        <Typography variant="caption" color={colors.textSecondary}>
          Seed: {seed}
        </Typography>
        <Typography variant="caption" color={colors.textSecondary}>
          Algorithm Version: {version}
        </Typography>
        {shareLink ? (
          <Typography variant="caption" color={colors.textSecondary} style={styles.link}>
            Deep Link: {shareLink}
          </Typography>
        ) : null}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 64,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  card: {
    width: '100%',
  },
  body: {
    marginVertical: 16,
  },
  link: {
    marginTop: 12,
  },
});
