import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme, Typography, Card, Button } from '../ui';

export default function Dashboard() {
  const { colors } = useAppTheme();
  const router = useRouter();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Typography variant="h1">Dashboard</Typography>
        <Button 
          title="Settings" 
          variant="secondary" 
          onPress={() => router.push('/settings')} 
          style={{ width: 120 }} 
        />
      </View>

      <Typography variant="body" color={colors.textSecondary} style={styles.subtitle}>
        Select a game to start playing offline.
      </Typography>

      <View style={styles.grid}>
        {/* Placeholder for games */}
        <Card style={styles.gameCard}>
          <Typography variant="h2">Sudoku</Typography>
          <Typography variant="caption" color={colors.textSecondary}>Procedural Numbers</Typography>
          <View style={{ marginTop: 16 }}>
             <Button title="Play" onPress={() => console.log('Play Sudoku')} />
          </View>
        </Card>
        
        <Card style={styles.gameCard}>
          <Typography variant="h2">Minesweeper</Typography>
          <Typography variant="caption" color={colors.textSecondary}>Classic Logic</Typography>
          <View style={{ marginTop: 16 }}>
             <Button title="Play" onPress={() => console.log('Play Minesweeper')} variant="accent" />
          </View>
        </Card>
      </View>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 32,
  },
  grid: {
    flexDirection: 'column',
    gap: 24,
  },
  gameCard: {
    width: '100%',
  }
});
