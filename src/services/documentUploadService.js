/**
 * Local document upload — Technical Guide §11 (expo-document-picker + expo-file-system).
 * Stores under app_documents/work_{workId}/ and persists paths to entity columns + documents table.
 */

import { Alert } from 'react-native';
import {
  DOCUMENT_DEFAULT_BASENAMES,
  DOCUMENT_TYPES,
} from '../constants/documentTypes';
import { upsertDocumentRecord } from '../db/repositories/documentsRepository';
import {
  patchCompletionCertificatePath,
  patchContractorDocumentPath,
  patchEstimationDocumentPath,
  patchPaymentReceiptPath,
  patchPmcLetterPath,
  patchSanctionLetterPath,
  patchSitePhotosPath,
  patchTenderAdvertisementPath,
  patchTenderNoticePath,
} from '../db/repositories/documentPathRepository';
import { getFileNameFromPath } from '../utils/fileName';

const ALLOWED_EXTENSIONS = new Set(['pdf', 'jpg', 'jpeg', 'png']);

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
];

const PICKER_TYPES = [
  'application/pdf',
  'image/*',
];

const PATH_PATCHERS = {
  [DOCUMENT_TYPES.PMC_LETTER]: patchPmcLetterPath,
  [DOCUMENT_TYPES.ESTIMATION_FILE]: patchEstimationDocumentPath,
  [DOCUMENT_TYPES.TENDER_ADVERTISEMENT]: patchTenderAdvertisementPath,
  [DOCUMENT_TYPES.TENDER_NOTICE]: patchTenderNoticePath,
  [DOCUMENT_TYPES.CONTRACTOR_DETAILS]: patchContractorDocumentPath,
  [DOCUMENT_TYPES.SANCTION_LETTER]: patchSanctionLetterPath,
  [DOCUMENT_TYPES.PAYMENT_RECEIPT]: patchPaymentReceiptPath,
  [DOCUMENT_TYPES.COMPLETION_CERTIFICATE]: patchCompletionCertificatePath,
  [DOCUMENT_TYPES.SITE_PHOTOS]: patchSitePhotosPath,
};

const getExtension = (fileName, mimeType) => {
  const fromName = (fileName || '').split('.').pop()?.toLowerCase() ?? '';
  if (ALLOWED_EXTENSIONS.has(fromName)) return fromName;

  const mime = (mimeType || '').toLowerCase();
  if (mime === 'application/pdf') return 'pdf';
  if (mime === 'image/jpeg' || mime === 'image/jpg') return 'jpg';
  if (mime === 'image/png') return 'png';

  return '';
};

const sanitizeBaseName = (name) =>
  String(name || 'document')
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80) || 'document';

const buildStoredFileName = (defaultBasename, originalName, mimeType) => {
  const ext = getExtension(originalName, mimeType);
  if (!ext) return null;
  const base = sanitizeBaseName(
    getFileNameFromPath(originalName)?.replace(/\.[^/.]+$/, '') || defaultBasename,
  );
  return `${base}.${ext}`;
};

/** Lazy-load native modules so screens mount before a dev build includes them. */
let nativeModulesPromise = null;

const loadNativeModules = async () => {
  if (!nativeModulesPromise) {
    nativeModulesPromise = Promise.all([
      import('expo-document-picker'),
      import('expo-file-system'),
    ]).then(([DocumentPicker, FileSystem]) => ({
      DocumentPicker,
      Directory: FileSystem.Directory,
      File: FileSystem.File,
      Paths: FileSystem.Paths,
    }));
  }
  return nativeModulesPromise;
};

const isNativeModuleMissing = (error) => {
  const msg = String(error?.message ?? error ?? '');
  return msg.includes('ExpoDocumentPicker') || msg.includes('Cannot find native module');
};

const getWorkDocumentsDirectory = (workId, { Directory, Paths }) => {
  const dir = new Directory(Paths.document, 'app_documents', `work_${workId}`);
  if (!dir.exists) {
    dir.create({ intermediates: true });
  }
  return dir;
};

const copyToWorkStorage = (sourceUri, workId, storedFileName, { Directory, File, Paths }) => {
  const workDir = getWorkDocumentsDirectory(workId, { Directory, Paths });
  const source = new File(sourceUri);
  const destination = new File(workDir, storedFileName);

  if (destination.exists) {
    destination.delete();
  }

  source.copy(destination);
  return destination.uri;
};

const validatePickedAsset = (asset) => {
  const ext = getExtension(asset.name, asset.mimeType);
  if (!ext || !ALLOWED_EXTENSIONS.has(ext)) {
    return {
      ok: false,
      message: 'Only PDF, JPG, JPEG, and PNG files are allowed.',
    };
  }

  const mime = (asset.mimeType || '').toLowerCase();
  if (mime && !ALLOWED_MIME_TYPES.includes(mime) && mime !== 'image/jpg') {
    // Extension is authoritative; reject only clearly wrong MIME when present
    if (!mime.includes('pdf') && !mime.includes('jpeg') && !mime.includes('png')) {
      return {
        ok: false,
        message: 'Only PDF, JPG, JPEG, and PNG files are allowed.',
      };
    }
  }

  return { ok: true, ext };
};

/**
 * Pick a document, copy to app_documents/work_{workId}/, persist to SQLite.
 * @returns {Promise<{ filePath: string, fileName: string } | null>}
 */
export const pickAndStoreDocument = async (workId, documentType) => {
  if (!workId) {
    Alert.alert('Upload failed', 'Work ID not found. Save work details first.');
    return null;
  }

  const patchPath = PATH_PATCHERS[documentType];
  if (!patchPath) {
    throw new Error(`pickAndStoreDocument: unknown documentType "${documentType}"`);
  }

  const defaultBasename = DOCUMENT_DEFAULT_BASENAMES[documentType] ?? 'document';

  let DocumentPicker;
  let Directory;
  let File;
  let Paths;

  try {
    ({ DocumentPicker, Directory, File, Paths } = await loadNativeModules());
  } catch (e) {
    console.warn('[documentUploadService] native modules unavailable:', e);
    if (isNativeModuleMissing(e)) {
      Alert.alert(
        'Rebuild required',
        'Document upload needs a fresh native build. Stop the app, then run:\n\nnpx expo run:android',
      );
    } else {
      Alert.alert('Upload failed', 'Document picker is not available on this build.');
    }
    return null;
  }

  let result;
  try {
    result = await DocumentPicker.getDocumentAsync({
      type: PICKER_TYPES,
      copyToCacheDirectory: true,
      multiple: false,
    });
  } catch (e) {
    console.warn('[documentUploadService] picker error:', e);
    if (isNativeModuleMissing(e)) {
      Alert.alert(
        'Rebuild required',
        'Stop the app, then run:\n\nnpx expo run:android',
      );
    } else {
      Alert.alert('Upload failed', 'Could not open the document picker.');
    }
    return null;
  }

  if (result.canceled || !result.assets?.length) {
    return null;
  }

  const asset = result.assets[0];
  const validation = validatePickedAsset(asset);
  if (!validation.ok) {
    Alert.alert('Unsupported file', validation.message);
    return null;
  }

  const storedFileName = buildStoredFileName(defaultBasename, asset.name, asset.mimeType);
  if (!storedFileName) {
    Alert.alert('Unsupported file', 'Only PDF, JPG, JPEG, and PNG files are allowed.');
    return null;
  }

  try {
    const filePath = copyToWorkStorage(asset.uri, workId, storedFileName, {
      Directory,
      File,
      Paths,
    });
    const fileName = getFileNameFromPath(filePath);

    patchPath(workId, filePath);
    upsertDocumentRecord(workId, documentType, filePath, fileName);

    return { filePath, fileName };
  } catch (e) {
    console.warn('[documentUploadService] store error:', e);
    Alert.alert('Upload failed', 'Could not save the file on this device.');
    return null;
  }
};

export { getFileNameFromPath };
