import { getFileNameFromPath } from './fileName';

/** Build UploadDocument document entry with filename in upper field after upload. */
export const buildUploadDocumentEntry = ({
  title,
  uploadText,
  filePath,
  onPress,
  loading = false,
  showUploadAction = false,
  onUploadPress,
  showDocumentField,
}) => {
  const displayName = filePath ? getFileNameFromPath(filePath) : undefined;

  return {
    title,
    uploadText,
    displayName,
    showDocumentField,
    showUploadAction,
    onUploadPress,
    fileUploaded: !!filePath,
    fileName: displayName,
    onPress,
    loading,
  };
};
