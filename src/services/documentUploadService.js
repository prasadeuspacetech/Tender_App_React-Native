/**
 * Local document upload — expo-document-picker + expo-file-system (SDK 55).
 * Static imports required: dynamic import() breaks Metro native module resolution.
 */

import { getDocumentAsync } from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';

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
  patchWorkOrderDocumentPath,
} from '../db/repositories/documentPathRepository';
import { getFileNameFromPath } from '../utils/fileName';
import { showUploadAlert, tError } from '../i18n/alertMessages';

const ALLOWED_EXTENSIONS = new Set(['pdf', 'jpg', 'jpeg', 'png']);

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
];

const PICKER_TYPES = ['application/pdf', 'image/*'];

const PATH_PATCHERS = {
  [DOCUMENT_TYPES.PMC_LETTER]: patchPmcLetterPath,
  [DOCUMENT_TYPES.ESTIMATION_FILE]: patchEstimationDocumentPath,
  [DOCUMENT_TYPES.TENDER_ADVERTISEMENT]: patchTenderAdvertisementPath,
  [DOCUMENT_TYPES.TENDER_NOTICE]: patchTenderNoticePath,
  [DOCUMENT_TYPES.CONTRACTOR_DETAILS]: patchContractorDocumentPath,
  [DOCUMENT_TYPES.SANCTION_LETTER]: patchSanctionLetterPath,
  [DOCUMENT_TYPES.WORK_ORDER_DOCUMENT]: patchWorkOrderDocumentPath,
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

const isNativeModuleMissing = (error) => {
  const msg = String(error?.message ?? error ?? '');
  return (
    msg.includes('ExpoDocumentPicker') ||
    msg.includes('ExpoFileSystem') ||
    msg.includes('Cannot find native module') ||
    msg.includes('Requiring unknown module')
  );
};

const getWorkDocumentsDirectory = (workId) => {
  const dir = new Directory(Paths.document, 'app_documents', `work_${workId}`);
  if (!dir.exists) {
    dir.create({ intermediates: true });
  }
  return dir;
};

const copyToWorkStorage = (sourceUri, workId, storedFileName) => {
  const workDir = getWorkDocumentsDirectory(workId);
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
      message: tError('upload.unsupportedDocuments'),
    };
  }

  const mime = (asset.mimeType || '').toLowerCase();
  if (mime && !ALLOWED_MIME_TYPES.includes(mime) && mime !== 'image/jpg') {
    if (!mime.includes('pdf') && !mime.includes('jpeg') && !mime.includes('png')) {
      return {
        ok: false,
        message: tError('upload.unsupportedDocuments'),
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
    showUploadAlert('upload.failedTitle', 'upload.failedNoWorkId');
    return null;
  }

  const patchPath = PATH_PATCHERS[documentType];
  if (!patchPath) {
    throw new Error(`pickAndStoreDocument: unknown documentType "${documentType}"`);
  }

  const defaultBasename = DOCUMENT_DEFAULT_BASENAMES[documentType] ?? 'document';

  let result;
  try {
    result = await getDocumentAsync({
      type: PICKER_TYPES,
      copyToCacheDirectory: true,
      multiple: false,
    });
  } catch (e) {
    console.warn('[documentUploadService] picker error:', e);
    if (isNativeModuleMissing(e)) {
      showUploadAlert('upload.rebuildTitle', 'upload.rebuildDocument');
    } else {
      showUploadAlert('upload.failedTitle', 'upload.failedPicker');
    }
    return null;
  }

  if (result.canceled || !result.assets?.length) {
    return null;
  }

  const asset = result.assets[0];
  const validation = validatePickedAsset(asset);
  if (!validation.ok) {
    showUploadAlert('upload.unsupportedTitle', 'upload.unsupportedDocuments');
    return null;
  }

  const storedFileName = buildStoredFileName(defaultBasename, asset.name, asset.mimeType);
  if (!storedFileName) {
    showUploadAlert('upload.unsupportedTitle', 'upload.unsupportedDocuments');
    return null;
  }

  try {
    const filePath = copyToWorkStorage(asset.uri, workId, storedFileName);
    const fileName = getFileNameFromPath(filePath);

    patchPath(workId, filePath);
    upsertDocumentRecord(workId, documentType, filePath, fileName);

    return { filePath, fileName };
  } catch (e) {
    console.warn('[documentUploadService] store error:', e);
    if (isNativeModuleMissing(e)) {
      showUploadAlert('upload.rebuildTitle', 'upload.rebuildGeneric');
    } else {
      showUploadAlert('upload.failedTitle', 'upload.failedSaveFile');
    }
    return null;
  }
};

export { getFileNameFromPath };
