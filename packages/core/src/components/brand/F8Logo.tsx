// F8 wordmark. Always rendered through this component, never as raw "F8" text in UI chrome.
import React from 'react';
import { Text, StyleSheet } from 'react-native';

type Props = {
  size?: number;
  color?: string;
};

export function F8Logo({ size = 32, color = '#FAFAFA' }: Props) {
  return (
    <Text
      accessibilityRole="header"
      accessibilityLabel="F8"
      style={[
        styles.logo,
        { fontSize: size, color, lineHeight: size * 1.05 },
      ]}
    >
      F8
    </Text>
  );
}

const styles = StyleSheet.create({
  logo: {
    fontFamily: 'SF Pro Display',
    fontWeight: '900',
    letterSpacing: -1,
  },
});
