/**
 * Site progress photo pick + local store (JPG/PNG only, max 10 per work).
 */

import { getDocumentAsync } from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';

import { MAX_SITE_PHOTOS } from '../db/repositories/workProgressRepository';
import { getFileNameFromPath } from '../utils/fileName';
import { showUploadAlert } from '../i18n/alertMessages';

const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png']);
const PICKER_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

const getExtension = (fileName, mimeType) => {
  const fromName = (fileName || '').split('.').pop()?.toLowerCase() ?? '';
  if (ALLOWED_EXTENSIONS.has(fromName)) return fromName === 'jpeg' ? 'jpg' : fromName;

  const mime = (mimeType || '').toLowerCase();
  if (mime === 'image/jpeg' || mime === 'image/jpg') return 'jpg';
  if (mime === 'image/png') return 'png';

  return '';
};

const getWorkPhotosDirectory = (workId, subfolder = 'work_progress_photos') => {
  const dir = new Directory(Paths.document, 'app_documents', `work_${workId}`, subfolder);
  if (!dir.exists) {
    dir.create({ intermediates: true });
  }
  return dir;
};

const buildStoredFileName = (originalName, mimeType, index, filePrefix = 'site_photo') => {
  const ext = getExtension(originalName, mimeType);
  if (!ext) return null;
  const stamp = Date.now();
  return `${filePrefix}_${stamp}_${index}.${ext}`;
};

/**
 * Pick one JPG/PNG and copy to app storage.
 * @returns {Promise<string|null>} local file URI
 */
export const pickAndStoreSitePhoto = async (workId, currentCount = 0, options = {}) => {
  const {
    subfolder = 'work_progress_photos',
    filePrefix = 'site_photo',
    maxPhotos = MAX_SITE_PHOTOS,
  } = options;

  if (!workId) {
    showUploadAlert('upload.failedTitle', 'upload.failedNoWorkId');
    return null;
  }

  if (currentCount >= maxPhotos) {
    showUploadAlert('upload.limitReachedTitle', 'upload.limitReachedPhotos', { max: maxPhotos });
    return null;
  }

  let result;
  try {
    result = await getDocumentAsync({
      type: PICKER_TYPES,
      copyToCacheDirectory: true,
      multiple: false,
    });
  } catch (e) {
    console.warn('[sitePhotosUploadService] picker error:', e);
    showUploadAlert('upload.failedTitle', 'upload.failedPhotoPicker');
    return null;
  }

  if (result.canceled || !result.assets?.length) {
    return null;
  }

  const asset = result.assets[0];
  const ext = getExtension(asset.name, asset.mimeType);
  if (!ext) {
    showUploadAlert('upload.unsupportedTitle', 'upload.unsupportedPhotos');
    return null;
  }

  const storedFileName = buildStoredFileName(
    asset.name,
    asset.mimeType,
    currentCount + 1,
    filePrefix,
  );
  if (!storedFileName) {
    showUploadAlert('upload.unsupportedTitle', 'upload.unsupportedPhotos');
    return null;
  }

  try {
    const workDir = getWorkPhotosDirectory(workId, subfolder);
    const source = new File(asset.uri);
    const destination = new File(workDir, storedFileName);

    if (destination.exists) {
      destination.delete();
    }

    source.copy(destination);
    return destination.uri;
  } catch (e) {
    console.warn('[sitePhotosUploadService] store error:', e);
    showUploadAlert('upload.failedTitle', 'upload.failedSavePhoto');
    return null;
  }
};

export const deleteSitePhotoFile = (filePath) => {
  if (!filePath) return;
  try {
    const file = new File(filePath);
    if (file.exists) {
      file.delete();
    }
  } catch (e) {
    console.warn('[sitePhotosUploadService] delete error:', e);
  }
};

export { getFileNameFromPath };
