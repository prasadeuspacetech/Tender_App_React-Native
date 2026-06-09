import { File } from 'expo-file-system';

import { getFileNameFromPath } from './fileName';

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png']);

export const getFileExtension = (filePath) => {
  const name = getFileNameFromPath(filePath);
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  return ext;
};

export const isImageFilePath = (filePath) =>
  IMAGE_EXTENSIONS.has(getFileExtension(filePath));

export const isPdfFilePath = (filePath) => getFileExtension(filePath) === 'pdf';

export const localFileExists = (filePath) => {
  if (!filePath || typeof filePath !== 'string') return false;
  try {
    return new File(filePath).exists;
  } catch {
    return false;
  }
};

export const getMimeTypeForPath = (filePath) => {
  const ext = getFileExtension(filePath);
  if (ext === 'pdf') return 'application/pdf';
  if (ext === 'png') return 'image/png';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  return 'application/octet-stream';
};
