// Persist a Skia-rendered SkImage as PNG into the user's gallery.
// Returns the asset uri on success.
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import type { SkImage } from '@shopify/react-native-skia';

const ALBUM_NAME = 'F8';

export async function saveSkImage(image: SkImage): Promise<string> {
  const perm = await MediaLibrary.requestPermissionsAsync();
  if (!perm.granted) throw new Error('media-permission-denied');

  const data = image.encodeToBase64();
  const filename = `f8-${Date.now()}.png`;
  const path = `${FileSystem.cacheDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(path, data, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const asset = await MediaLibrary.createAssetAsync(path);
  const album = await MediaLibrary.getAlbumAsync(ALBUM_NAME);
  if (album) {
    await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
  } else {
    await MediaLibrary.createAlbumAsync(ALBUM_NAME, asset, false);
  }
  return asset.uri;
}
