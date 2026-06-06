import React, { useState } from 'react';
import { View, StyleSheet, ViewStyle, LayoutChangeEvent } from 'react-native';
import { Canvas, RoundedRect, Shadow } from '@shopify/react-native-skia';
import { useAppTheme } from './useAppTheme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({ children, style }) => {
  const { colors, activeTheme } = useAppTheme();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const isDark = activeTheme === 'dark';

  const onLayout = (event: LayoutChangeEvent) => {
    setDimensions({
      width: event.nativeEvent.layout.width,
      height: event.nativeEvent.layout.height,
    });
  };

  return (
    <View onLayout={onLayout} style={[styles.container, style]}>
      {dimensions.width > 0 && dimensions.height > 0 && (
        <Canvas style={StyleSheet.absoluteFill}>
          <RoundedRect x={0} y={0} width={dimensions.width} height={dimensions.height} r={24} color={colors.surface}>
            <Shadow dx={6} dy={6} blur={12} color={isDark ? '#00000080' : '#00000020'} />
            <Shadow dx={-6} dy={-6} blur={12} color={isDark ? '#ffffff05' : '#ffffff'} />
          </RoundedRect>
        </Canvas>
      )}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    minHeight: 100,
  },
  content: {
    padding: 24,
    zIndex: 1,
  }
});
