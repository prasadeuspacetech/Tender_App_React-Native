// Backup service layer — Phase 1 foundation exports.

export {
  BACKUP_FORMAT_VERSION,
  BACKUP_FILE_EXTENSION,
  MANIFEST_FILENAME,
  DATABASE_JSON_FILENAME,
  BACKUP_FILES_DIR_NAME,
  CHECKSUM_ALGORITHM,
  createExportManifest,
  parseManifestJson,
  validateManifest,
  serializeManifest,
  getAppVersion,
  getExportPlatform,
} from './backupManifest';

export {
  APP_DOCUMENTS_DIR_NAME,
  BACKUP_FILES_DIR_NAME as BACKUP_FILES_ROOT,
  collectReferencedAbsolutePaths,
  extractAppDocumentsRelativePath,
  extractPathsFromRow,
  getAppDocumentsDirectory,
  isManagedDocumentPath,
  isNonEmptyPath,
  resolveManagedDocumentPath,
  rewriteDatabasePathsForBackup,
  rewriteDatabasePathsForRestore,
  toAbsoluteDevicePath,
  toRelativeBackupPath,
} from './backupPathUtils';

export {
  buildFileIntegrityEntries,
  buildFileIntegrityEntry,
  checksumString,
  getFileSizeBytes,
  scanDatabaseFileIntegrity,
  sha256Hex,
  sha256HexSync,
  verifyChecksumAlgorithm,
} from './backupIntegrity';

export {
  BACKUP_SCHEMA_VERSION,
  MIN_BACKUP_SCHEMA_VERSION,
  BACKUP_TABLE_CLEAR_ORDER,
  BACKUP_TABLE_DEFINITIONS,
  BACKUP_TABLE_IMPORT_ORDER,
  BACKUP_TABLE_NAMES,
  getBackupTableDefinition,
  isBackupTableName,
} from './backupTableRegistry';

export {
  buildBackupFileName,
  createBackupArchive,
  exportAndShareBackup,
  getBackupExportPreview,
  shareBackupArchive,
} from './backupExportService';

export {
  importBackupFromStaging,
  importInspectedBackupArchive,
  inspectBackupArchiveFile,
  inspectStagedBackup,
  pickAndInspectBackupArchive,
  pickBackupArchiveFile,
} from './backupImportService';

export { zipDirectoryToBytes, unzipBytesToDirectory, unzipFileToDirectory } from './backupZipUtils';

export {
  formatFileSize,
  isLargeBackupSize,
  LARGE_BACKUP_BYTES,
} from './backupFormatUtils';

export {
  BACKUP_ERROR_CODES,
  BackupError,
  getBackupErrorCode,
  toBackupError,
} from './backupErrors';

export { assertSufficientDiskSpace, getAvailableDiskSpaceBytes } from './backupStorageUtils';
