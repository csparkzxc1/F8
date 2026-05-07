// Thin wrapper over expo-image-picker. Returns a single uri or null.
import * as ImagePicker from 'expo-image-picker';

export async function pickPhoto(): Promise<string | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 1,
    allowsEditing: false,
    exif: false,
  });

  if (result.canceled) return null;
  return result.assets[0]?.uri ?? null;
}
