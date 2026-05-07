// Factory that turns a VariantConfig into a full F8 App component.
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { VariantProvider } from './VariantContext';
import { RootNavigator } from '../navigation/RootNavigator';
import { ThemeProvider } from '../theme/ThemeProvider';
import { ToastHost } from '../components/ui/Toast';
import { track } from '../services/analytics';
import type { VariantConfig } from './types';

export function createF8App(config: VariantConfig) {
  return function F8App() {
    useEffect(() => {
      track('app_open', { variant: config.id, app: config.appName });
    }, []);

    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <VariantProvider config={config}>
          <ThemeProvider accentColor={config.accentColor}>
            <View style={{ flex: 1 }}>
              <NavigationContainer>
                <RootNavigator />
              </NavigationContainer>
              <ToastHost />
            </View>
          </ThemeProvider>
        </VariantProvider>
      </GestureHandlerRootView>
    );
  };
}
