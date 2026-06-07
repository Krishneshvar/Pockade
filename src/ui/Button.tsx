import React, { useState } from 'react';
import { Pressable, StyleSheet, ViewStyle, LayoutChangeEvent } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Canvas, RoundedRect, Shadow } from '@shopify/react-native-skia';
import { useAppTheme } from './useAppTheme';
import { Typography } from './Typography';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent';
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Button: React.FC<ButtonProps> = ({ title, onPress, variant = 'primary', style }) => {
  const { colors, activeTheme } = useAppTheme();
  const scale = useSharedValue(1);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const handlePressIn = () => { scale.value = withSpring(0.95); };
  const handlePressOut = () => { scale.value = withSpring(1); };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const bgColor = colors[variant];
  const isDark = activeTheme === 'dark';

  const onLayout = (event: LayoutChangeEvent) => {
    setDimensions({
      width: event.nativeEvent.layout.width,
      height: event.nativeEvent.layout.height,
    });
  };

  return (
    <AnimatedPressable 
      accessibilityRole="button"
      onPress={onPress} 
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLayout={onLayout}
      style={[styles.container, animatedStyle, style]}
    >
      {dimensions.width > 0 && dimensions.height > 0 && (
        <Canvas style={StyleSheet.absoluteFill}>
          <RoundedRect x={0} y={0} width={dimensions.width} height={dimensions.height} r={dimensions.height / 2} color={bgColor}>
            <Shadow dx={4} dy={4} blur={8} color={isDark ? '#00000060' : '#00000030'} />
            <Shadow dx={-4} dy={-4} blur={8} color={isDark ? '#ffffff10' : '#ffffffA0'} />
          </RoundedRect>
        </Canvas>
      )}
      <Typography weight="bold" color="#FFFFFF" style={styles.text}>{title}</Typography>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
  },
  text: {
    zIndex: 1,
  }
});
