// Human-readable backup sizes and thresholds.

export const LARGE_BACKUP_BYTES = 100 * 1024 * 1024;
export const DISK_SPACE_BUFFER_BYTES = 50 * 1024 * 1024;

export const formatFileSize = (bytes, language = 'en') => {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value < 0) return '—';
  if (value === 0) return language === 'mr' ? '० बाइट' : '0 B';

  const units =
    language === 'mr'
      ? ['बाइट', 'केबी', 'एमबी', 'जीबी']
      : ['B', 'KB', 'MB', 'GB'];

  let size = value;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  const formatted =
    size >= 10 || unitIndex === 0
      ? Math.round(size).toString()
      : size.toFixed(1);

  return `${formatted} ${units[unitIndex]}`;
};

export const isLargeBackupSize = (bytes) =>
  Number(bytes) >= LARGE_BACKUP_BYTES;
