// Persist a Skia-rendered SkImage as PNG into the user's gallery, organized
// into a per-variant album (e.g. "F8 Seoul"). The variant name is supplied
// by the caller so the same module serves every F8 build.
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import type { SkImage } from '@shopify/react-native-skia';

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

export async function savePhoto(image: SkImage, albumName: string): Promise<SaveResult> {
  const perm = await MediaLibrary.requestPermissionsAsync();
  if (!perm.granted) throw new SavePhotoError('permission-denied');

  const data = image.encodeToBase64();
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
