// Factory that turns a VariantConfig into a full F8 App component.
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { VariantProvider } from './VariantContext';
import { RootNavigator } from '../navigation/RootNavigator';
import { ThemeProvider } from '../theme/ThemeProvider';
import type { VariantConfig } from './types';

export function createF8App(config: VariantConfig) {
  return function F8App() {
    return (
      <VariantProvider config={config}>
        <ThemeProvider accentColor={config.accentColor}>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </ThemeProvider>
      </VariantProvider>
    );
  };
}
