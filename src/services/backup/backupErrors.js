// Typed backup/restore failures for user-facing i18n mapping.

export const BACKUP_ERROR_CODES = {
  UNKNOWN: 'UNKNOWN',
  PICKER_FAILED: 'PICKER_FAILED',
  ARCHIVE_UNREADABLE: 'ARCHIVE_UNREADABLE',
  INSUFFICIENT_STORAGE: 'INSUFFICIENT_STORAGE',
  MANIFEST_MISSING: 'MANIFEST_MISSING',
  MANIFEST_INVALID_JSON: 'MANIFEST_INVALID_JSON',
  DATABASE_MISSING: 'DATABASE_MISSING',
  DATABASE_INVALID_JSON: 'DATABASE_INVALID_JSON',
  DATABASE_CHECKSUM_MISMATCH: 'DATABASE_CHECKSUM_MISMATCH',
  FILES_FOLDER_MISSING: 'FILES_FOLDER_MISSING',
  UNSUPPORTED_FORMAT_VERSION: 'UNSUPPORTED_FORMAT_VERSION',
  SCHEMA_VERSION_MISSING: 'SCHEMA_VERSION_MISSING',
  SCHEMA_TOO_NEW: 'SCHEMA_TOO_NEW',
  SCHEMA_TOO_OLD: 'SCHEMA_TOO_OLD',
  EXPORTED_AT_MISSING: 'EXPORTED_AT_MISSING',
  TABLE_COUNTS_MISSING: 'TABLE_COUNTS_MISSING',
  UNSUPPORTED_CHECKSUM_ALGORITHM: 'UNSUPPORTED_CHECKSUM_ALGORITHM',
  INVALID_ARCHIVE: 'INVALID_ARCHIVE',
};

export class BackupError extends Error {
  /**
   * @param {keyof typeof BACKUP_ERROR_CODES | string} code
   * @param {string} [message]
   * @param {Record<string, unknown>} [details]
   */
  constructor(code, message = '', details = {}) {
    super(message || code);
    this.name = 'BackupError';
    this.code = code;
    this.details = details;
  }
}

export const getBackupErrorCode = (error, fallback = BACKUP_ERROR_CODES.UNKNOWN) => {
  if (error instanceof BackupError && error.code) {
    return error.code;
  }

  return fallback;
};

export const toBackupError = (error, fallbackCode = BACKUP_ERROR_CODES.UNKNOWN) => {
  if (error instanceof BackupError) return error;
  return new BackupError(fallbackCode, error?.message ?? fallbackCode);
};
