import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

import AttachmentImagePreviewModal from '../components/attachments/AttachmentImagePreviewModal';
import AttachmentPdfPreviewModal from '../components/attachments/AttachmentPdfPreviewModal';
import {
  openDocumentAttachment,
  resolveAttachmentPreviewMode,
} from '../services/attachmentPreviewService';
import { getFileNameFromPath } from '../utils/fileName';

/**
 * Reusable attachment preview — images in full-screen modal, documents via native viewer / WebView.
 */
const useAttachmentPreview = () => {
  const { t } = useTranslation('errors');
  const [imageUri, setImageUri] = useState(null);
  const [pdfUri, setPdfUri] = useState(null);
  const [pdfTitle, setPdfTitle] = useState('');

  const closeImagePreview = useCallback(() => {
    setImageUri(null);
  }, []);

  const closePdfPreview = useCallback(() => {
    setPdfUri(null);
    setPdfTitle('');
  }, []);

  const previewAttachment = useCallback(
    async (filePath, options = {}) => {
      const mode = resolveAttachmentPreviewMode(filePath);

      if (mode === 'invalid') {
        Alert.alert(t('preview.errorTitle'), t('preview.invalidPath'));
        return;
      }

      if (mode === 'missing') {
        Alert.alert(t('preview.errorTitle'), t('preview.fileNotFound'));
        return;
      }

      if (mode === 'image') {
        setImageUri(filePath);
        return;
      }

      try {
        const result = await openDocumentAttachment(filePath);

        if (!result.ok) {
          Alert.alert(t('preview.errorTitle'), t('preview.fileNotFound'));
          return;
        }

        if (result.mode === 'webview') {
          setPdfTitle(
            options.dialogTitle ??
              getFileNameFromPath(filePath) ??
              t('preview.documentTitle'),
          );
          setPdfUri(result.uri);
        }
      } catch (error) {
        console.warn('[useAttachmentPreview] open document failed:', error);
        Alert.alert(t('preview.errorTitle'), t('preview.cannotOpen'));
      }
    },
    [t],
  );

  const AttachmentPreviewModals = useCallback(
    () => (
      <>
        <AttachmentImagePreviewModal
          visible={imageUri != null}
          imageUri={imageUri}
          onClose={closeImagePreview}
        />
        <AttachmentPdfPreviewModal
          visible={pdfUri != null}
          documentUri={pdfUri}
          title={pdfTitle}
          onClose={closePdfPreview}
        />
      </>
    ),
    [imageUri, pdfUri, pdfTitle, closeImagePreview, closePdfPreview],
  );

  return {
    previewAttachment,
    AttachmentPreviewModals,
    /** @deprecated Use AttachmentPreviewModals */
    ImagePreviewModal: AttachmentPreviewModals,
  };
};

export default useAttachmentPreview;
