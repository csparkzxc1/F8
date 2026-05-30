// Persist a Skia-rendered SkImage as PNG into the user's gallery, organized
// into a per-variant album (e.g. "F8 Seoul"). The variant name is supplied
// by the caller so the same module serves every F8 build.
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import type { SkImage } from '@shopify/react-native-skia';
import { applyWatermark } from '../utils/applyWatermark';

export type SaveResult = {
  uri: string;
  albumName: string;
};

export type SaveError = 'permission-denied' | 'snapshot-failed' | 'write-failed';

export class SavePhotoError extends Error {
  constructor(public code: SaveError) {
    super(code);
    this.name = 'SavePhotoError';
  }
}

export async function savePhoto(
  image: SkImage,
  albumName: string,
  // When provided, an "F8 · CITY" wordmark is burned into the bottom-right
  // corner before the file is written. Omit it to save the frame untouched.
  watermark?: { cityName: string },
): Promise<SaveResult> {
  const perm = await MediaLibrary.requestPermissionsAsync();
  if (!perm.granted) throw new SavePhotoError('permission-denied');

  let marked = image;
  if (watermark) {
    console.log('[F8][savePhoto] applyWatermark input:', image.width(), image.height(), watermark);
    marked = applyWatermark(image, watermark);
    console.log(
      '[F8][savePhoto] applyWatermark output:',
      marked ? 'OK' : 'NULL',
      'same-ref-as-input=',
      marked === image,
    );
  }
  const data = marked.encodeToBase64();
  if (!data) throw new SavePhotoError('snapshot-failed');

  const filename = `f8-${Date.now()}.png`;
  const path = `${FileSystem.cacheDirectory}${filename}`;
  try {
    await FileSystem.writeAsStringAsync(path, data, {
      encoding: FileSystem.EncodingType.Base64,
    });
  } catch {
    throw new SavePhotoError('write-failed');
  }

  const asset = await MediaLibrary.createAssetAsync(path);
  const album = await MediaLibrary.getAlbumAsync(albumName);
  if (album) {
    await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
  } else {
    await MediaLibrary.createAlbumAsync(albumName, asset, false);
  }
  return { uri: asset.uri, albumName };
}
