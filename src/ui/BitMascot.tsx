import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';
import { Canvas, RoundedRect, Circle, Group } from '@shopify/react-native-skia';
import { useAppTheme } from './useAppTheme';

interface BitMascotProps {
  size?: number;
  emotion?: 'idle' | 'happy' | 'sad';
}

export const BitMascot: React.FC<BitMascotProps> = ({ size = 100, emotion = 'idle' }) => {
  const { colors } = useAppTheme();
  const breathe = useSharedValue(1);

  useEffect(() => {
    breathe.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathe.value }],
    width: size,
    height: size,
  }));

  const eyeYOffset = emotion === 'sad' ? 5 : (emotion === 'happy' ? -5 : 0);
  
  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Canvas style={StyleSheet.absoluteFill}>
        {/* Body */}
        <RoundedRect x={0} y={0} width={size} height={size} r={size * 0.3} color={colors.primary} />
        {/* Eyes (Oversized) */}
        <Group>
          {/* Left Eye */}
          <Circle cx={size * 0.3} cy={size * 0.4 + eyeYOffset} r={size * 0.15} color="#FFFFFF" />
          <Circle cx={size * 0.3} cy={size * 0.4 + eyeYOffset} r={size * 0.06} color="#000000" />
          {/* Right Eye */}
          <Circle cx={size * 0.7} cy={size * 0.4 + eyeYOffset} r={size * 0.15} color="#FFFFFF" />
          <Circle cx={size * 0.7} cy={size * 0.4 + eyeYOffset} r={size * 0.06} color="#000000" />
        </Group>
      </Canvas>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  }
});
