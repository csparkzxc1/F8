// "F8. Be there." — brand slogan. Use at hero moments only.
import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { F8Logo } from './F8Logo';

type Props = {
  size?: number;
  color?: string;
};

export function Slogan({ size = 56, color = '#FAFAFA' }: Props) {
  return (
    <View style={styles.row}>
      <F8Logo size={size} color={color} />
      <Text style={[styles.dot, { fontSize: size, color }]}>.</Text>
      <Text style={[styles.tail, { fontSize: size * 0.42, color }]}>Be there.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  dot: {
    fontFamily: 'SF Pro Display',
    fontWeight: '900',
    letterSpacing: -1,
  },
  tail: {
    fontFamily: 'SF Pro Display',
    fontWeight: '500',
    letterSpacing: -0.3,
    marginLeft: 6,
  },
});
