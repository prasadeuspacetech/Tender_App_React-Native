/** Basename from a local file path or URI (keeps extension). */
export const getFileNameFromPath = (filePath) => {
  if (!filePath || typeof filePath !== 'string') return '';
  const normalized = filePath.replace(/\\/g, '/');
  const parts = normalized.split('/');
  return parts[parts.length - 1] || '';
};
