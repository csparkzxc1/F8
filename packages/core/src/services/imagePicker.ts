// Thin wrapper over expo-image-picker. Returns a single uri or null.
// Result is run through normalizeImage so EXIF rotation is baked into the
// pixel data before Skia loads it.
import * as ImagePicker from 'expo-image-picker';
import { normalizeImage } from './normalizeImage';

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
  const raw = result.assets[0]?.uri;
  if (!raw) return null;
  return normalizeImage(raw);
}
