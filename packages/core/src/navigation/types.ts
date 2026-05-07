// Root stack route shape, shared across all F8 variants.
export type RootStackParamList = {
  Onboarding: undefined;
  Home: undefined;
  Editor: { photoUri?: string } | undefined;
  Camera: undefined;
  PresetStore: undefined;
  Settings: undefined;
  About: undefined;
};
