import React from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { Typography, Button, useAppTheme } from '../ui';

interface InGameOverlayProps {
  isVisible: boolean;
  onResume: () => void;
  onExit: () => void;
  onPauseRequest: () => void;
}

export const InGameOverlay: React.FC<InGameOverlayProps> = ({ isVisible, onResume, onExit, onPauseRequest }) => {
  const { activeTheme } = useAppTheme();
  
  const bgColor = activeTheme === 'dark' ? '#0F172AD0' : '#F8FAFCD0';

  return (
    <>
      {!isVisible && (
        <View style={styles.pauseBtnContainer}>
          <Button title="||" onPress={onPauseRequest} style={{ width: 48, height: 48, borderRadius: 24 }} />
        </View>
      )}

      <Modal visible={isVisible} transparent animationType="fade">
        <View style={[StyleSheet.absoluteFill, { backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center' }]}>
          <Typography variant="h1" style={styles.title}>Paused</Typography>
          <View style={styles.actions}>
            <Button title="Resume" onPress={onResume} style={styles.btn} />
            <Button title="Restart" onPress={() => {}} variant="secondary" style={styles.btn} />
            <Button title="Rules" onPress={() => {}} variant="secondary" style={styles.btn} />
            <Button title="Exit Game" onPress={onExit} variant="accent" style={styles.btn} />
          </View>
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
  }
});
