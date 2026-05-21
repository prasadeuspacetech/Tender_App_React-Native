import { useCallback, useState } from 'react';
import { pickAndStoreDocument } from '../services/documentUploadService';

/**
 * Reusable document pick + local store + SQLite persist.
 * @param {number|string} workId
 * @param {string} documentType — DOCUMENT_TYPES.*
 * @param {(filePath: string, fileName: string) => void} onStored
 */
export const useDocumentUpload = (workId, documentType, onStored) => {
  const [uploading, setUploading] = useState(false);

  const pickDocument = useCallback(async () => {
    if (!workId) return null;
    setUploading(true);
    try {
      const result = await pickAndStoreDocument(workId, documentType);
      if (result && onStored) {
        onStored(result.filePath, result.fileName);
      }
      return result;
    } finally {
      setUploading(false);
    }
  }, [workId, documentType, onStored]);

  return { pickDocument, uploading };
};

export default useDocumentUpload;
