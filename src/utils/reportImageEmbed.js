import * as FileSystem from 'expo-file-system/legacy';

import { isImageFilePath, localFileExists } from './localFileUtils';

/**
 * Convert a local image path to a base64 data URI for expo-print HTML embedding.
 */
export const imagePathToDataUri = async (filePath) => {
  if (!filePath || !localFileExists(filePath) || !isImageFilePath(filePath)) {
    return null;
  }

  try {
    const base64 = await FileSystem.readAsStringAsync(filePath, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const mime = filePath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
    return `data:${mime};base64,${base64}`;
  } catch (error) {
    console.warn('[reportImageEmbed] failed for path:', filePath, error);
    return null;
  }
};

/** Build a path → dataUri map for all image paths in a FY report payload. */
export const buildImageDataUriCache = async (report) => {
  const cache = new Map();
  const paths = new Set();

  report.works?.forEach((work) => {
    work.imagePaths?.forEach((p) => paths.add(p));
  });

  for (const path of paths) {
    const dataUri = await imagePathToDataUri(path);
    if (dataUri) {
      cache.set(path, dataUri);
    }
  }

  return cache;
};
