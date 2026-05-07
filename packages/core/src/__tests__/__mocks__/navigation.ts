// Stand-in for any @react-navigation/* import.
export const createNativeStackNavigator = () => ({
  Navigator: 'Navigator',
  Screen: 'Screen',
});
export const NavigationContainer = 'NavigationContainer';
export const useNavigation = () => ({ navigate: () => undefined, replace: () => undefined, goBack: () => undefined });
export const useRoute = () => ({ params: {} });
