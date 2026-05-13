// Hand a Skia-rendered SkImage off to the system share sheet. Writes the
// image to a cache file first because expo-sharing requires a file URI.
//
// TODO: Instagram Stories direct share via instagram-stories:// URL scheme.
// Needs background asset + sticker payload per Instagram's spec — wire up
// when the iOS Stories integration is on the v1.1 list.
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { SkImage } from '@shopify/react-native-skia';

export type ShareError = 'unavailable' | 'snapshot-failed' | 'write-failed';

export class SharePhotoError extends Error {
  constructor(public code: ShareError) {
    super(code);
    this.name = 'SharePhotoError';
  }
}

export async function sharePhoto(image: SkImage): Promise<void> {
  const available = await Sharing.isAvailableAsync();
  if (!available) throw new SharePhotoError('unavailable');

  const data = image.encodeToBase64();
  if (!data) throw new SharePhotoError('snapshot-failed');

  const path = `${FileSystem.cacheDirectory}f8-share-${Date.now()}.png`;
  try {
    await FileSystem.writeAsStringAsync(path, data, {
      encoding: FileSystem.EncodingType.Base64,
    });
  } catch {
    throw new SharePhotoError('write-failed');
  }

  await Sharing.shareAsync(path, {
    mimeType: 'image/png',
    dialogTitle: 'F8',
    UTI: 'public.png',
  });
}
