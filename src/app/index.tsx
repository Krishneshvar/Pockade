import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme, Typography, Card, Button, BitMascot } from '../ui';
import { GAME_CATALOG } from '../games';
import { listGameSessions } from '../core/database';

type CategoryFilter = 'all' | 'logic' | 'word' | 'strategy';

export default function Dashboard() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [sessionIds, setSessionIds] = useState<string[]>([]);

  useEffect(() => {
    async function loadSessions() {
      const sessions = await listGameSessions();
      setSessionIds(sessions.map((session) => session.gameId));
    }

    void loadSessions();
  }, []);

  const filteredGames = useMemo(
    () =>
      GAME_CATALOG.filter((game) => category === 'all' || game.category === category).sort((left, right) =>
        left.name.localeCompare(right.name)
      ),
    [category]
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.hero}>
        <View style={styles.heroCopy}>
          <Typography variant="h1">Pockade</Typography>
          <Typography variant="body" color={colors.textSecondary} style={styles.subtitle}>
            A calm, fully offline arcade shell built for deterministic mini-games and long-term extensibility.
          </Typography>
        </View>
        <BitMascot size={96} emotion="happy" />
      </View>

      <View style={styles.header}>
        <Typography variant="h2">Game Hub</Typography>
        <Button
          title="Settings"
          variant="secondary"
          onPress={() => router.push('/settings')}
          style={{ width: 132 }}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {(['all', 'logic', 'word', 'strategy'] as const).map((filter) => {
          const selected = category === filter;
          return (
            <Pressable
              key={filter}
              onPress={() => setCategory(filter)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: selected ? colors.primary : colors.surface,
                },
              ]}
            >
              <Typography color={selected ? '#FFFFFF' : colors.text} weight="bold">
                {filter === 'all' ? 'All Games' : filter[0].toUpperCase() + filter.slice(1)}
              </Typography>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.grid}>
        {filteredGames.map((game) => {
          const hasSavedSession = sessionIds.includes(game.id);
          return (
            <Card key={game.id} style={styles.gameCard}>
              <View style={styles.cardHeader}>
                <Typography variant="h2">{game.name}</Typography>
                <View style={styles.badges}>
                  <Badge label={game.status === 'available' ? 'Ready' : 'Planned'} color={game.status === 'available' ? colors.secondary : colors.accent} />
                  {hasSavedSession ? <Badge label="Resume" color={colors.primary} /> : null}
                </View>
              </View>

              <Typography variant="caption" color={colors.textSecondary}>
                {game.tagline}
              </Typography>

              <View style={styles.metaRow}>
                <Badge label={game.category} color={colors.surface} textColor={colors.text} />
                <Badge label={game.defaultOrientation} color={colors.surface} textColor={colors.text} />
                <Badge label={`v${game.algorithmVersion}`} color={colors.surface} textColor={colors.text} />
              </View>

              <View style={{ marginTop: 20 }}>
                <Button
                  title={hasSavedSession ? 'Continue' : game.status === 'available' ? 'Play' : 'View Shell'}
                  onPress={() =>
                    router.push({
                      pathname: '/game/[gameId]',
                      params: {
                        gameId: game.id,
                        seed: String(Date.now()),
                        v: String(game.algorithmVersion),
                      },
                    })
                  }
                />
              </View>
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
}

const Badge: React.FC<{ label: string; color: string; textColor?: string }> = ({
  label,
  color,
  textColor = '#FFFFFF',
}) => (
  <View style={[styles.badge, { backgroundColor: color }]}>
    <Typography variant="caption" weight="bold" color={textColor}>
      {label}
    </Typography>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 64,
    paddingBottom: 48,
  },
  hero: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
    gap: 16,
  },
  heroCopy: {
    flex: 1,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  subtitle: {
    maxWidth: 520,
  },
  filters: {
    gap: 12,
    paddingBottom: 16,
  },
  filterChip: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  grid: {
    flexDirection: 'column',
    gap: 20,
  },
  gameCard: {
    width: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
});
