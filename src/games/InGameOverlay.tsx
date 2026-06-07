import React, { useState } from 'react';
import { View, StyleSheet, Modal, ScrollView } from 'react-native';
import { Typography, Button, useAppTheme } from '../ui';

interface InGameOverlayProps {
  isVisible: boolean;
  onResume: () => void;
  onExit: () => void;
  onPauseRequest: () => void;
  onRestart: () => void;
  rules?: string[];
}

export const InGameOverlay: React.FC<InGameOverlayProps> = ({
  isVisible,
  onResume,
  onExit,
  onPauseRequest,
  onRestart,
  rules = [],
}) => {
  const { activeTheme } = useAppTheme();
  const [isRulesVisible, setRulesVisible] = useState(false);

  const bgColor = activeTheme === 'dark' ? '#0F172AD0' : '#F8FAFCD0';

  return (
    <>
      {!isVisible && (
        <View style={styles.pauseBtnContainer}>
          <Button title="||" onPress={onPauseRequest} style={{ width: 48, height: 48, borderRadius: 24 }} />
        </View>
      )}

      <Modal visible={isVisible} transparent animationType="fade">
        <View style={[StyleSheet.absoluteFill, styles.modal, { backgroundColor: bgColor }]}>
          <Typography variant="h1" style={styles.title}>Paused</Typography>
          <View style={styles.actions}>
            <Button title="Resume" onPress={onResume} style={styles.btn} />
            <Button title="Restart" onPress={onRestart} variant="secondary" style={styles.btn} />
            <Button
              title="Rules"
              onPress={() => setRulesVisible(true)}
              variant="secondary"
              style={styles.btn}
            />
            <Button title="Exit Game" onPress={onExit} variant="accent" style={styles.btn} />
          </View>
        </View>
      </Modal>

      <Modal visible={isRulesVisible} transparent animationType="slide">
        <View style={[StyleSheet.absoluteFill, styles.modal, { backgroundColor: bgColor }]}>
          <ScrollView contentContainerStyle={styles.rulesContent}>
            <Typography variant="h1" style={styles.title}>Rules</Typography>
            {rules.length > 0 ? (
              rules.map((rule) => (
                <Typography key={rule} variant="body" align="center" style={styles.rule}>
                  {rule}
                </Typography>
              ))
            ) : (
              <Typography variant="body" align="center" style={styles.rule}>
                This module has not published its rules yet.
              </Typography>
            )}
            <Button title="Close" onPress={() => setRulesVisible(false)} style={styles.btn} />
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  pauseBtnContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 100,
  },
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 40,
  },
  actions: {
    gap: 16,
    width: '100%',
    alignItems: 'center',
  },
  btn: {
    width: 200,
  },
  rulesContent: {
    width: '100%',
    paddingHorizontal: 32,
    paddingVertical: 72,
    alignItems: 'center',
    gap: 16,
  },
  rule: {
    maxWidth: 340,
  },
});
