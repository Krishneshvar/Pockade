import React, { useState } from 'react';
import { View, StyleSheet, Switch, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme, Typography, Card, Button } from '../ui';
import { useThemeStore, type ColorBlindMode } from '../core/themeStore';
import { NotificationsManager } from '../managers/notifications';
import { BackupManager } from '../core/backup';
import { BugReportExporter } from '../core/diagnostics';

const THEME_OPTIONS = ['light', 'dark', 'system'] as const;
const COLOR_BLIND_OPTIONS: ColorBlindMode[] = ['off', 'deuteranopia', 'protanopia', 'tritanopia'];

export default function Settings() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const store = useThemeStore();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleNotificationsToggle = async (enabled: boolean) => {
    const synced = await NotificationsManager.syncDailyReminder(enabled);
    store.setNotificationsEnabled(synced);
    setStatusMessage(
      synced
        ? 'Daily reminder scheduled for 7:00 PM.'
        : enabled
          ? 'Notification permission was denied.'
          : 'Daily reminder disabled.'
    );
  };

  const handleBackupExport = async () => {
    const path = await BackupManager.exportBackup();
    setStatusMessage(path ? `Encrypted backup exported to ${path}` : 'Backup export failed.');
  };

  const handleBugReportExport = async () => {
    const path = await BugReportExporter.exportReportFile();
    setStatusMessage(path ? `Bug report exported to ${path}` : 'Bug report export failed.');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Button
          title="Back"
          variant="secondary"
          onPress={() => router.back()}
          style={{ width: 96, marginRight: 16 }}
        />
        <Typography variant="h1">Settings</Typography>
      </View>

      <Card style={styles.card}>
        <Typography variant="h2" style={styles.sectionTitle}>Appearance</Typography>
        <View style={styles.pills}>
          {THEME_OPTIONS.map((themeOption) => {
            const selected = store.theme === themeOption;
            return (
              <Button
                key={themeOption}
                title={themeOption[0].toUpperCase() + themeOption.slice(1)}
                variant={selected ? 'primary' : 'secondary'}
                onPress={() => store.setTheme(themeOption)}
                style={styles.pillButton}
              />
            );
          })}
        </View>

        <View style={styles.divider} />

        <Typography variant="body" weight="bold" style={styles.optionTitle}>
          Colorblind Mode
        </Typography>
        <View style={styles.pills}>
          {COLOR_BLIND_OPTIONS.map((option) => {
            const selected = store.colorBlindMode === option;
            return (
              <Button
                key={option}
                title={option === 'off' ? 'Off' : option.replace('opia', '')}
                variant={selected ? 'accent' : 'secondary'}
                onPress={() => store.setColorBlindMode(option)}
                style={styles.pillButton}
              />
            );
          })}
        </View>
      </Card>

      <Card style={styles.card}>
        <Typography variant="h2" style={styles.sectionTitle}>Play Experience</Typography>
        <SettingRow
          label="Performance Mode"
          value={store.performanceMode}
          onValueChange={store.setPerformanceMode}
          trackColor={colors.primary}
        />
        <SettingRow
          label="Music"
          value={store.audioEnabled}
          onValueChange={store.setAudioEnabled}
          trackColor={colors.primary}
        />
        <SettingRow
          label="Sound Effects"
          value={store.sfxEnabled}
          onValueChange={store.setSfxEnabled}
          trackColor={colors.primary}
        />
        <SettingRow
          label="Haptics"
          value={store.hapticsEnabled}
          onValueChange={store.setHapticsEnabled}
          trackColor={colors.primary}
        />
        <SettingRow
          label="Daily Reminder"
          value={store.notificationsEnabled}
          onValueChange={(value) => {
            void handleNotificationsToggle(value);
          }}
          trackColor={colors.primary}
        />
      </Card>

      <Card style={styles.card}>
        <Typography variant="h2" style={styles.sectionTitle}>Maintenance</Typography>
        <Button title="Export Encrypted Backup" onPress={() => void handleBackupExport()} />
        <View style={styles.actionSpacer} />
        <Button title="Export Bug Report" variant="secondary" onPress={() => void handleBugReportExport()} />
        <View style={styles.actionSpacer} />
        <Button title="Open Source Licenses" variant="accent" onPress={() => router.push('/open-source')} />
      </Card>

      {__DEV__ ? (
        <Card style={styles.card}>
          <Typography variant="h2" style={styles.sectionTitle}>Developer</Typography>
          <SettingRow
            label="Show Perf Monitor"
            value={store.isPerformanceMonitorVisible}
            onValueChange={store.setPerformanceMonitorVisible}
            trackColor={colors.accent}
          />
        </Card>
      ) : null}

      {statusMessage ? (
        <Typography variant="caption" color={colors.textSecondary} align="center" style={styles.status}>
          {statusMessage}
        </Typography>
      ) : null}

      <View style={styles.oss}>
        <Typography variant="caption" color={colors.textSecondary} align="center">
          Pockade is open source under the Apache License 2.0.
        </Typography>
      </View>
    </ScrollView>
  );
}

const SettingRow: React.FC<{
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  trackColor: string;
}> = ({ label, value, onValueChange, trackColor }) => (
  <>
    <View style={styles.row}>
      <Typography variant="body" weight="bold">{label}</Typography>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ true: trackColor }} />
    </View>
    <View style={styles.divider} />
  </>
);

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
    marginBottom: 12,
  },
  card: {
    width: '100%',
  },
  sectionTitle: {
    marginBottom: 16,
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
  optionTitle: {
    marginBottom: 12,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  pillButton: {
    width: 124,
  },
  actionSpacer: {
    height: 12,
  },
  status: {
    paddingHorizontal: 12,
  },
  oss: {
    marginTop: 8,
    alignItems: 'center',
  },
});
