// Last-resort error gate. Wraps the navigator so any unhandled render
// failure becomes a brand-voiced retry screen instead of a white death
// screen. Function components cannot be ErrorBoundaries — has to be class.
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { F8Logo } from '../brand/F8Logo';
import { track } from '../../services/analytics';

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends React.Component<Props, State> {
  override state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo): void {
    track('error', {
      message: error.message,
      stack: error.stack ?? null,
      componentStack: info.componentStack ?? null,
    });
  }

  reset = (): void => {
    this.setState({ hasError: false });
  };

  override render(): React.ReactNode {
    if (!this.state.hasError) return this.props.children;
    return (
      <View style={styles.root}>
        <F8Logo size={36} color="#FFFFFF" />
        <Text style={styles.title}>잠시 멈췄습니다.</Text>
        <Pressable
          onPress={this.reset}
          accessibilityRole="button"
          accessibilityLabel="다시 시도"
          style={styles.retry}
        >
          <Text style={styles.retryLabel}>다시 시도</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 32,
  },
  title: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', letterSpacing: -0.2 },
  retry: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  retryLabel: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', letterSpacing: -0.2 },
});
