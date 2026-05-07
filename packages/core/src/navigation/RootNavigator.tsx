// Root stack. Onboarding → Home; Editor/Camera/Store/Settings/About are pushed.
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { EditorScreen } from '../screens/EditorScreen';
import { CameraScreen } from '../screens/CameraScreen';
import { PresetStoreScreen } from '../screens/PresetStoreScreen';
import { AboutScreen } from '../screens/AboutScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { useTheme } from '../theme/ThemeProvider';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const theme = useTheme();
  return (
    <Stack.Navigator
      initialRouteName="Onboarding"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.bg },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Editor" component={EditorScreen} />
      <Stack.Screen name="Camera" component={CameraScreen} options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="PresetStore" component={PresetStoreScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
    </Stack.Navigator>
  );
}
