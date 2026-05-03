/**
 * LinearGradient shim – works without expo-linear-gradient installed.
 * Replace with 'expo-linear-gradient' once you run:
 *   npm install expo-linear-gradient
 */
import React from 'react';
import { View, ViewProps } from 'react-native';

interface LinearGradientProps extends ViewProps {
  colors: readonly string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  children?: React.ReactNode;
}

export function LinearGradient({ colors, style, children, ...props }: LinearGradientProps) {
  return (
    <View style={[{ backgroundColor: colors?.[0] ?? 'transparent' }, style]} {...props}>
      {children}
    </View>
  );
}
