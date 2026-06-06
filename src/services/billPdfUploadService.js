/**
 * Bill PDF upload — PDF only (Step 11 Bill Submission).
 */

import { getDocumentAsync } from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';

import { patchBillDocumentPath } from '../db/repositories/billSubmissionRepository';
import { upsertDocumentRecord } from '../db/repositories/documentsRepository';
import { getFileNameFromPath } from '../utils/fileName';
import { DOCUMENT_TYPES } from '../constants/documentTypes';
import { showUploadAlert } from '../i18n/alertMessages';

const PICKER_TYPES = ['application/pdf'];

const getExtension = (fileName, mimeType) => {
  const fromName = (fileName || '').split('.').pop()?.toLowerCase() ?? '';
  if (fromName === 'pdf') return 'pdf';

  const mime = (mimeType || '').toLowerCase();
  if (mime === 'application/pdf') return 'pdf';

  return '';
};

const getBillDocumentsDirectory = (workId) => {
  const dir = new Directory(Paths.document, 'app_documents', `work_${workId}`, 'bill_submission');
  if (!dir.exists) {
    dir.create({ intermediates: true });
  }
  return dir;
};

export const pickAndStoreBillPdf = async (workId) => {
  if (!workId) {
    showUploadAlert('upload.failedTitle', 'upload.failedNoWorkId');
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
    console.warn('[billPdfUploadService] picker error:', e);
    showUploadAlert('upload.failedTitle', 'upload.failedPicker');
    return null;
  }

  if (result.canceled || !result.assets?.length) {
    return null;
  }

  const asset = result.assets[0];
  if (!getExtension(asset.name, asset.mimeType)) {
    showUploadAlert('upload.unsupportedTitle', 'upload.unsupportedPdf');
    return null;
  }

  const storedFileName = `bill_${Date.now()}.pdf`;

  try {
    const workDir = getBillDocumentsDirectory(workId);
    const source = new File(asset.uri);
    const destination = new File(workDir, storedFileName);

    if (destination.exists) {
      destination.delete();
    }

    source.copy(destination);
    const filePath = destination.uri;
    const fileName = getFileNameFromPath(filePath);

    patchBillDocumentPath(workId, filePath);
    upsertDocumentRecord(workId, DOCUMENT_TYPES.BILL_DOCUMENT, filePath, fileName);

    return { filePath, fileName };
  } catch (e) {
    console.warn('[billPdfUploadService] store error:', e);
    showUploadAlert('upload.failedTitle', 'upload.failedSavePdf');
    return null;
  }
};

export const deleteBillPdfFile = (filePath) => {
  if (!filePath) return;
  try {
    const file = new File(filePath);
    if (file.exists) {
      file.delete();
    }
  } catch (e) {
    console.warn('[billPdfUploadService] delete error:', e);
  }
};
