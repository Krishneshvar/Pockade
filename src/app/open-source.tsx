import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme, Typography, Card, Button } from '../ui';
import { OPEN_SOURCE_DISCLOSURES } from '../core/openSource';

export default function OpenSourceScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Button title="Back" variant="secondary" onPress={() => router.back()} style={{ width: 96 }} />
        <Typography variant="h1">Open Source</Typography>
      </View>

      {OPEN_SOURCE_DISCLOSURES.map((entry) => (
        <Card key={entry.name} style={styles.card}>
          <Typography variant="h2">{entry.name}</Typography>
          <Typography variant="caption" color={colors.textSecondary}>
            {entry.license}
          </Typography>
          <Typography variant="body" style={styles.reason}>
            {entry.reason}
          </Typography>
          <Typography variant="caption" color={colors.textSecondary}>
            {entry.url}
          </Typography>
        </Card>
      ))}
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
    paddingBottom: 40,
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
  reason: {
    marginTop: 12,
    marginBottom: 8,
  },
});
