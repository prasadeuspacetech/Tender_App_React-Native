import { getBackupErrorCode } from '../services/backup/backupErrors';
import { formatFileSize } from '../services/backup/backupFormatUtils';

export const resolveBackupErrorMessage = (error, t, namespace = 'backup') => {
  const code = getBackupErrorCode(error);
  const key = `${namespace}.errors.${code}`;
  const translated = t(key, { defaultValue: '' });

  if (translated && translated !== key) {
    return translated;
  }

  return namespace === 'restore'
    ? t('restore.errorMessage')
    : t('backup.errorMessage');
};

export const formatBackupSizeLabel = (bytes, language) => formatFileSize(bytes, language);
