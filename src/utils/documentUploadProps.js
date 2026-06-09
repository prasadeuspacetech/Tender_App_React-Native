import { getFileNameFromPath } from './fileName';

/** Build UploadDocument document entry with filename in upper field after upload. */
export const buildUploadDocumentEntry = ({
  title,
  uploadText,
  filePath,
  onPress,
  loading = false,
  showUploadAction,
  onUploadPress,
  showDocumentField,
}) => {
  const displayName = filePath ? getFileNameFromPath(filePath) : undefined;
  const hasFile = !!filePath;

  const resolvedOnUploadPress = onUploadPress ?? (onPress ? onPress : undefined);
  const resolvedShowUploadAction =
    showUploadAction ?? (hasFile && resolvedOnUploadPress ? true : false);

  return {
    title,
    uploadText,
    displayName,
    showDocumentField,
    showUploadAction: resolvedShowUploadAction,
    onUploadPress: resolvedOnUploadPress,
    fileUploaded: hasFile,
    fileName: displayName,
    filePath: filePath || undefined,
    onPress: hasFile ? undefined : onPress,
    loading,
  };
};
