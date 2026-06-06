import React, { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

import UploadDocument from '../UploadDocument';
import { buildUploadDocumentEntry } from '../../utils/documentUploadProps';
import {
  deleteBillPdfFile,
  pickAndStoreBillPdf,
} from '../../services/billPdfUploadService';

/**
 * Bill PDF upload section — PDF only, replace support.
 */
const BillDocumentUpload = ({ workId, filePath = '', onChange }) => {
  const { t } = useTranslation('workflow');
  const [uploading, setUploading] = useState(false);

  const handlePick = useCallback(async () => {
    if (!workId) {
      Alert.alert(
        t('alerts.uploadFailedTitle'),
        t('alerts.uploadFailedNoWorkId'),
      );
      return;
    }

    const uploadPdf = async () => {
      setUploading(true);
      try {
        const result = await pickAndStoreBillPdf(workId);
        if (result) {
          if (filePath && filePath !== result.filePath) {
            deleteBillPdfFile(filePath);
          }
          onChange?.(result.filePath);
        }
      } finally {
        setUploading(false);
      }
    };

    if (filePath) {
      Alert.alert(
        t('alerts.replaceDocumentTitle'),
        t('alerts.replaceDocumentMessage'),
        [
          { text: t('alerts.cancel'), style: 'cancel' },
          { text: t('alerts.replace'), onPress: uploadPdf },
        ],
      );
      return;
    }

    await uploadPdf();
  }, [workId, filePath, onChange, t]);

  return (
    <UploadDocument
      sectionLabel={t('common.documents')}
      documents={[
        buildUploadDocumentEntry({
          title: t('steps.billSubmission.uploads.billTitle'),
          uploadText: t('steps.billSubmission.uploads.billUpload'),
          filePath,
          onPress: handlePick,
          loading: uploading,
        }),
      ]}
    />
  );
};

export default BillDocumentUpload;
