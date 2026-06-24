import { Paths } from 'expo-file-system';

import { BackupError, BACKUP_ERROR_CODES } from './backupErrors';
import { DISK_SPACE_BUFFER_BYTES } from './backupFormatUtils';

export const getAvailableDiskSpaceBytes = () => {
  const available = Paths.availableDiskSpace;
  return Number.isFinite(available) && available > 0 ? available : null;
};

export const assertSufficientDiskSpace = (requiredBytes) => {
  const available = getAvailableDiskSpaceBytes();
  if (available == null) return;

  const required = Number(requiredBytes) || 0;
  if (available < required + DISK_SPACE_BUFFER_BYTES) {
    throw new BackupError(BACKUP_ERROR_CODES.INSUFFICIENT_STORAGE, 'Not enough free storage.', {
      availableBytes: available,
      requiredBytes: required,
    });
  }
};
