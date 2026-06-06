import React from 'react';
import { View, StyleSheet, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme, Typography, Card, Button } from '../ui';
import { useThemeStore } from '../core/themeStore';

export default function Settings() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const store = useThemeStore();

  const toggleTheme = () => {
    store.setTheme(store.theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Button 
          title="Back" 
          variant="secondary" 
          onPress={() => router.back()} 
          style={{ width: 80, marginRight: 16 }} 
        />
        <Typography variant="h1">Settings</Typography>
      </View>

      <Card style={styles.card}>
        <View style={styles.row}>
          <Typography variant="body" weight="bold">Dark Mode</Typography>
          <Switch 
            value={store.theme === 'dark'} 
            onValueChange={toggleTheme} 
            trackColor={{ true: colors.primary }}
          />
        </View>
        <View style={styles.divider} />
        
        <View style={styles.row}>
          <Typography variant="body" weight="bold">Performance Mode</Typography>
          <Switch 
            value={store.performanceMode} 
            onValueChange={store.setPerformanceMode} 
            trackColor={{ true: colors.primary }}
          />
        </View>
        <View style={styles.divider} />
        
        <View style={styles.row}>
          <Typography variant="body" weight="bold">Audio (Music)</Typography>
          <Switch 
            value={store.audioEnabled} 
            onValueChange={store.setAudioEnabled} 
            trackColor={{ true: colors.primary }}
          />
        </View>
        <View style={styles.divider} />

        <View style={styles.row}>
          <Typography variant="body" weight="bold">SFX</Typography>
          <Switch 
            value={store.sfxEnabled} 
            onValueChange={store.setSfxEnabled} 
            trackColor={{ true: colors.primary }}
          />
        </View>
      </Card>
      
      <View style={styles.oss}>
         <Typography variant="caption" color={colors.textSecondary} align="center">
           Pockade is Open Source under the Apache 2.0 License.
         </Typography>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 64,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  card: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#00000015',
    marginVertical: 4,
  },
  oss: {
    marginTop: 32,
    alignItems: 'center',
  }
});
