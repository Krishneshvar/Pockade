import React, { Component, ErrorInfo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography, Button, BitMascot, useAppTheme } from '../ui';
import { SkiaGarbageCollector } from '../core/gc';

interface Props {
  children: React.ReactNode;
  onReturnToDashboard: () => void;
}

interface State {
  hasError: boolean;
  errorMsg: string;
}

export class GameCrashBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMsg: error.message };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Attempt to flush memory aggressively to prevent OS shell crash
    SkiaGarbageCollector.flush();
    console.error('Game Module Crashed:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <BoundaryFallback 
          onReturn={this.props.onReturnToDashboard} 
          errorMsg={this.state.errorMsg} 
        />
      );
    }
    return this.props.children;
  }
}

const BoundaryFallback: React.FC<{ onReturn: () => void, errorMsg: string }> = ({ onReturn, errorMsg }) => {
  const { colors } = useAppTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <BitMascot size={150} emotion="sad" />
      <Typography variant="h2" style={styles.title}>Oops! The Game Crashed.</Typography>
      <Typography variant="body" color={colors.textSecondary} align="center" style={styles.subtitle}>
        A procedurally generated anomaly caused this game instance to fail. Bit is very sorry!
      </Typography>
      <Button title="Return to Dashboard" onPress={onReturn} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  title: {
    marginTop: 32,
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 32,
  }
});
