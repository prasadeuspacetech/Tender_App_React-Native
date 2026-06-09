import { Platform } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import { File } from 'expo-file-system';

import {
  getMimeTypeForPath,
  isImageFilePath,
  localFileExists,
} from '../utils/localFileUtils';

/**
 * Open a document for viewing.
 * - Android: ACTION_VIEW intent (opens PDF reader directly, not share sheet)
 * - iOS / fallback: in-app WebView modal
 */
export const openDocumentAttachment = async (filePath) => {
  if (!localFileExists(filePath)) {
    return { ok: false, reason: 'missing' };
  }

  const mimeType = getMimeTypeForPath(filePath);
  const file = new File(filePath);

  if (Platform.OS === 'android') {
    try {
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: file.contentUri,
        flags: 1,
        type: mimeType,
      });
      return { ok: true, mode: 'external' };
    } catch (error) {
      console.warn('[attachmentPreview] Android VIEW intent failed, using WebView:', error);
      return { ok: true, mode: 'webview', uri: file.uri };
    }
  }

  return { ok: true, mode: 'webview', uri: file.uri };
};

export const resolveAttachmentPreviewMode = (filePath) => {
  if (!filePath) return 'invalid';
  if (!localFileExists(filePath)) return 'missing';
  if (isImageFilePath(filePath)) return 'image';
  return 'document';
};
