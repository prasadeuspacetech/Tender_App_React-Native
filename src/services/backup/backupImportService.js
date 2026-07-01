// Orchestrates backup import: pick → validate → full replace with rollback.

import { getDocumentAsync } from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';

import {
  exportAllBackupTables,
  importBackupSnapshot,
  normalizeBackupSnapshot,
} from '../../db/repositories/backupRepository';
import {
  BACKUP_FILES_DIR_NAME,
  DATABASE_JSON_FILENAME,
  MANIFEST_FILENAME,
  parseManifestJson,
  validateManifest,
} from './backupManifest';
import { checksumString } from './backupIntegrity';
import { BackupError, BACKUP_ERROR_CODES, toBackupError } from './backupErrors';
import { assertSufficientDiskSpace } from './backupStorageUtils';
import {
  cleanupDirectory,
  ensureDirectory,
  replaceAppDocumentsFromBackupFiles,
  restoreAppDocumentsDirectory,
  snapshotAppDocumentsDirectory,
} from './backupFileUtils';
import { rewriteDatabasePathsForRestore } from './backupPathUtils';
import { unzipFileToDirectory } from './backupZipUtils';

const IMPORT_STAGING_PREFIX = 'backup_import_';

const formatInspectionDate = (exportedAt, language = 'en') => {
  if (!exportedAt) return '';

  try {
    return new Date(exportedAt).toLocaleString(language === 'mr' ? 'mr-IN' : 'en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return String(exportedAt);
  }
};

const extractArchiveToStaging = (archiveUri) => {
  const zipFile = new File(archiveUri);
  if (!zipFile.exists) {
    throw new BackupError(BACKUP_ERROR_CODES.ARCHIVE_UNREADABLE, 'Backup file could not be read.');
  }

  const archiveSizeBytes = zipFile.size ?? 0;
  assertSufficientDiskSpace(archiveSizeBytes * 2);

  const stagingDir = new Directory(Paths.cache, `${IMPORT_STAGING_PREFIX}${Date.now()}`);
  ensureDirectory(stagingDir);
  unzipFileToDirectory(zipFile, stagingDir);

  return { stagingDir, archiveSizeBytes };
};

const readStagedTextFile = (stagingDir, fileName) => {
  const file = new File(stagingDir, fileName);
  if (!file.exists) return null;
  return file.textSync();
};

const buildInvalidInspection = (errorCodes, errors, manifest = null) => ({
  valid: false,
  errors,
  errorCodes,
  manifest,
  tableCounts: manifest?.tableCounts ?? {},
  workCount: Number(manifest?.tableCounts?.works) || 0,
  fileCount: Number(manifest?.fileCount) || 0,
  totalBytes: Number(manifest?.totalBytes) || 0,
  schemaVersion: manifest?.schemaVersion ?? null,
  exportedAt: manifest?.exportedAt ?? '',
  exportedAtLabel: formatInspectionDate(manifest?.exportedAt ?? ''),
  archiveSizeBytes: 0,
});

/**
 * Present the system document picker only — NO progress modal should be on
 * screen when this runs.
 *
 * IMPORTANT (iOS): the document picker is a view controller that must be
 * presented from the top-most controller. If a React Native <Modal> (e.g. the
 * backup progress modal) is already visible, iOS cannot present the picker and
 * the promise hangs, leaving the UI stuck on "Reading backup file…". Call this
 * before showing any loading modal.
 *
 * @returns {Promise<{ canceled: true } | { canceled: false, fileUri: string }>}
 */
export const pickBackupArchiveFile = async () => {
  let result;

  try {
    result = await getDocumentAsync({
      type: ['application/zip', 'application/octet-stream'],
      copyToCacheDirectory: true,
    });
  } catch {
    throw new BackupError(BACKUP_ERROR_CODES.PICKER_FAILED, 'Could not open file picker.');
  }

  if (result.canceled || !result.assets?.[0]?.uri) {
    return { canceled: true };
  }

  return { canceled: false, fileUri: result.assets[0].uri };
};

/**
 * Extract + validate an already-picked archive. Safe to run while the progress
 * modal is visible (no system UI is presented here).
 *
 * @returns {{ fileUri: string, stagingDir: Directory, inspection: object }}
 */
export const inspectBackupArchiveFile = (fileUri, { language = 'en', onProgress } = {}) => {
  onProgress?.('validating');

  const { stagingDir, archiveSizeBytes } = extractArchiveToStaging(fileUri);
  const inspection = inspectStagedBackup(stagingDir, language, archiveSizeBytes);

  return { fileUri, stagingDir, inspection };
};

/**
 * Convenience wrapper: pick + extract + inspect in one call.
 *
 * Prefer calling {@link pickBackupArchiveFile} and {@link inspectBackupArchiveFile}
 * separately when a loading modal is involved, so the picker is presented before
 * the modal appears (required for iOS).
 *
 * @returns {Promise<{ canceled: true } | { canceled: false, fileUri: string, inspection: object, stagingDir: Directory }>}
 */
export const pickAndInspectBackupArchive = async ({ language = 'en', onProgress } = {}) => {
  onProgress?.('inspecting');

  const pick = await pickBackupArchiveFile();
  if (pick.canceled) return { canceled: true };

  return { canceled: false, ...inspectBackupArchiveFile(pick.fileUri, { language, onProgress }) };
};

/**
 * @returns {{ valid: boolean, errors: string[], errorCodes: string[], manifest: object|null, tableCounts: Record<string, number>, workCount: number, fileCount: number, totalBytes: number, schemaVersion: number|null, exportedAt: string, exportedAtLabel: string, archiveSizeBytes: number }}
 */
export const inspectStagedBackup = (stagingDir, language = 'en', archiveSizeBytes = 0) => {
  const errors = [];
  const errorCodes = [];

  const manifestText = readStagedTextFile(stagingDir, MANIFEST_FILENAME);
  if (!manifestText) {
    return buildInvalidInspection(
      [BACKUP_ERROR_CODES.MANIFEST_MISSING],
      ['Manifest is missing from backup archive.'],
    );
  }

  let manifest;
  try {
    manifest = parseManifestJson(manifestText);
  } catch {
    return buildInvalidInspection(
      [BACKUP_ERROR_CODES.MANIFEST_INVALID_JSON],
      ['Manifest is not valid JSON.'],
    );
  }

  const manifestValidation = validateManifest(manifest);
  if (!manifestValidation.valid) {
    return {
      ...buildInvalidInspection(
        manifestValidation.errorCodes,
        manifestValidation.errors,
        manifest,
      ),
      exportedAtLabel: formatInspectionDate(manifest.exportedAt, language),
      archiveSizeBytes,
    };
  }

  const databaseText = readStagedTextFile(stagingDir, DATABASE_JSON_FILENAME);
  if (!databaseText) {
    errors.push('Database payload is missing from backup archive.');
    errorCodes.push(BACKUP_ERROR_CODES.DATABASE_MISSING);
  } else if (manifest.databaseChecksum) {
    const actualChecksum = checksumString(databaseText);
    if (actualChecksum !== manifest.databaseChecksum) {
      errors.push('Database checksum does not match manifest.');
      errorCodes.push(BACKUP_ERROR_CODES.DATABASE_CHECKSUM_MISMATCH);
    }
  }

  if (databaseText) {
    try {
      const parsed = JSON.parse(databaseText);
      normalizeBackupSnapshot(parsed);
    } catch {
      errors.push('Database payload is not valid JSON.');
      errorCodes.push(BACKUP_ERROR_CODES.DATABASE_INVALID_JSON);
    }
  }

  const filesDir = new Directory(stagingDir, BACKUP_FILES_DIR_NAME);
  if (!filesDir.exists) {
    errors.push('Document files folder is missing from backup archive.');
    errorCodes.push(BACKUP_ERROR_CODES.FILES_FOLDER_MISSING);
  }

  const tableCounts = manifest.tableCounts ?? {};
  const exportedAt = manifest.exportedAt ?? '';

  return {
    valid: errors.length === 0,
    errors,
    errorCodes,
    manifest,
    tableCounts,
    workCount: Number(tableCounts.works) || 0,
    fileCount: Number(manifest.fileCount) || 0,
    totalBytes: Number(manifest.totalBytes) || 0,
    schemaVersion: manifest.schemaVersion ?? null,
    exportedAt,
    exportedAtLabel: formatInspectionDate(exportedAt, language),
    archiveSizeBytes,
  };
};

const loadDatabaseSnapshotFromStaging = (stagingDir) => {
  const databaseText = readStagedTextFile(stagingDir, DATABASE_JSON_FILENAME);
  if (!databaseText) {
    throw new BackupError(BACKUP_ERROR_CODES.DATABASE_MISSING, 'Database payload is missing.');
  }

  try {
    const parsed = JSON.parse(databaseText);
    const normalized = normalizeBackupSnapshot(parsed);
    return rewriteDatabasePathsForRestore(normalized);
  } catch (error) {
    if (error instanceof BackupError) throw error;
    throw new BackupError(BACKUP_ERROR_CODES.DATABASE_INVALID_JSON, 'Database payload is invalid.');
  }
};

const rollbackImport = (databaseSnapshot, documentsSnapshotDir) => {
  try {
    importBackupSnapshot(databaseSnapshot);
    restoreAppDocumentsDirectory(documentsSnapshotDir);
  } catch (rollbackError) {
    console.error('[backupImport] rollback failed:', rollbackError);
  }
};

/**
 * @typedef {'validating' | 'restoring' | 'done'} BackupImportPhase
 */

/**
 * Replace all business data from a validated staged backup folder.
 *
 * @param {Directory} stagingDir
 * @param {{ onProgress?: (phase: BackupImportPhase) => void, inspection?: object }} [options]
 *   Pass the `inspection` already produced by {@link inspectBackupArchiveFile}
 *   to skip a second manifest parse + full database.json SHA-256 re-hash. This
 *   matters on iOS, where re-hashing a large payload adds avoidable CPU/memory
 *   pressure. Falls back to inspecting when not provided.
 */
export const importBackupFromStaging = async (
  stagingDir,
  { onProgress, inspection: providedInspection } = {},
) => {
  onProgress?.('validating');

  const inspection =
    providedInspection && providedInspection.valid
      ? providedInspection
      : inspectStagedBackup(stagingDir);
  if (!inspection.valid) {
    const code = inspection.errorCodes?.[0] ?? BACKUP_ERROR_CODES.INVALID_ARCHIVE;
    throw new BackupError(code, inspection.errors?.[0] ?? 'Invalid backup archive.');
  }

  const requiredBytes = Math.max(
    inspection.archiveSizeBytes,
    inspection.totalBytes,
  );
  assertSufficientDiskSpace(requiredBytes * 2);

  const databaseSnapshot = loadDatabaseSnapshotFromStaging(stagingDir);
  const backupFilesDir = new Directory(stagingDir, BACKUP_FILES_DIR_NAME);
  const databaseRollback = exportAllBackupTables();
  const documentsRollbackDir = snapshotAppDocumentsDirectory();

  onProgress?.('restoring');

  try {
    replaceAppDocumentsFromBackupFiles(backupFilesDir);
    importBackupSnapshot(databaseSnapshot);
  } catch (error) {
    rollbackImport(databaseRollback, documentsRollbackDir);
    throw toBackupError(error);
  } finally {
    cleanupDirectory(documentsRollbackDir);
  }

  onProgress?.('done');

  return {
    tableCounts: inspection.tableCounts,
    workCount: inspection.workCount,
    fileCount: inspection.fileCount,
    exportedAt: inspection.exportedAt,
    manifest: inspection.manifest,
  };
};

/**
 * Import a validated staged backup archive after user confirmation.
 */
export const importInspectedBackupArchive = async (stagingDir, options = {}) => {
  try {
    return await importBackupFromStaging(stagingDir, options);
  } finally {
    cleanupDirectory(stagingDir);
  }
};
