// Bake EXIF orientation into the pixel data. Skia's useImage doesn't honor the
// EXIF rotation tag, so portrait photos shot with vision-camera or pulled from
// the gallery would render sideways. Re-encoding through image-manipulator
// applies the rotation and strips the metadata.
import * as ImageManipulator from 'expo-image-manipulator';

export async function normalizeImage(uri: string): Promise<string> {
  try {
    const result = await ImageManipulator.manipulateAsync(uri, [], {
      compress: 1,
      format: ImageManipulator.SaveFormat.JPEG,
    });
    return result.uri;
  } catch {
    return uri;
  }
}
