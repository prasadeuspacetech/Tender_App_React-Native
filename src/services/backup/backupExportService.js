// Orchestrates backup export: SQLite snapshot → staging → ZIP → share.

import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import {
  exportAllBackupTables,
  getBackupTableCounts,
} from '../../db/repositories/backupRepository';
import { localFileExists } from '../../utils/localFileUtils';
import {
  cleanupDirectory,
  ensureDirectory,
  ensureParentDirectory,
  writeTextFile,
} from './backupFileUtils';
import {
  BACKUP_FILE_EXTENSION,
  BACKUP_FILES_DIR_NAME,
  DATABASE_JSON_FILENAME,
  MANIFEST_FILENAME,
  createExportManifest,
  serializeManifest,
} from './backupManifest';
import { checksumString, scanDatabaseFileIntegrity } from './backupIntegrity';
import { isLargeBackupSize } from './backupFormatUtils';
import { assertSufficientDiskSpace } from './backupStorageUtils';
import {
  BACKUP_FILES_DIR_NAME as BACKUP_FILES_ROOT_NAME,
  collectReferencedAbsolutePaths,
  rewriteDatabasePathsForBackup,
  toRelativeBackupPath,
} from './backupPathUtils';
import { zipDirectoryToBytes } from './backupZipUtils';

const BACKUP_OUTPUT_DIR_NAME = 'app_backups';
const STAGING_DIR_PREFIX = 'backup_staging_';
const ARCHIVE_OVERHEAD_BYTES = 4096;

const pad2 = (value) => String(value).padStart(2, '0');

export const buildBackupFileName = (date = new Date()) => {
  const stamp = [
    date.getFullYear(),
    pad2(date.getMonth() + 1),
    pad2(date.getDate()),
    '_',
    pad2(date.getHours()),
    pad2(date.getMinutes()),
    pad2(date.getSeconds()),
  ].join('');

  return `tender_backup_${stamp}${BACKUP_FILE_EXTENSION}`;
};

const copyReferencedFilesToStaging = (absolutePaths, filesRootDir) => {
  const uniquePaths = [...new Set((absolutePaths ?? []).filter(Boolean))];

  uniquePaths.forEach((absolutePath) => {
    if (!localFileExists(absolutePath)) return;

    const relativePath = toRelativeBackupPath(absolutePath);
    if (!relativePath?.startsWith(`${BACKUP_FILES_ROOT_NAME}/`)) return;

    const innerPath = relativePath.slice(`${BACKUP_FILES_ROOT_NAME}/`.length);
    const segments = innerPath.split('/').filter(Boolean);
    if (!segments.length) return;

    const destination = new File(filesRootDir, ...segments);
    ensureParentDirectory(destination);

    const source = new File(absolutePath);
    if (destination.exists) {
      destination.delete();
    }

    source.copy(destination);
  });
};

const writeZipArchive = (zipBytes, fileName) => {
  const outputDir = new Directory(Paths.document, BACKUP_OUTPUT_DIR_NAME);
  ensureDirectory(outputDir);

  const zipFile = new File(outputDir, fileName);
  if (zipFile.exists) {
    zipFile.delete();
  }

  zipFile.write(zipBytes);
  return zipFile.uri;
};

/**
 * @typedef {'reading' | 'scanning' | 'staging' | 'zipping' | 'sharing' | 'done'} BackupExportPhase
 */

/**
 * Estimate export size before creating the archive.
 */
export const getBackupExportPreview = async () => {
  const snapshot = exportAllBackupTables();
  const tableCounts = getBackupTableCounts(snapshot);
  const totalRows = Object.values(tableCounts).reduce((sum, count) => sum + (Number(count) || 0), 0);
  const workCount = Number(tableCounts.works) || 0;

  const { entries, missingPaths } = await scanDatabaseFileIntegrity(snapshot);
  const fileBytes = entries
    .filter((entry) => entry.exists)
    .reduce((sum, entry) => sum + (entry.sizeBytes || 0), 0);
  const databaseBytes = JSON.stringify(rewriteDatabasePathsForBackup(snapshot)).length;
  const estimatedArchiveBytes = fileBytes + databaseBytes + ARCHIVE_OVERHEAD_BYTES;

  return {
    workCount,
    totalRows,
    tableCounts,
    fileCount: entries.length,
    missingFileCount: missingPaths.length,
    fileBytes,
    databaseBytes,
    estimatedArchiveBytes,
    isLarge: isLargeBackupSize(estimatedArchiveBytes),
  };
};

/**
 * Export all business data to a .tenderbak.zip archive and open the share sheet.
 * @param {{ onProgress?: (phase: BackupExportPhase) => void, shareDialogTitle?: string, estimatedArchiveBytes?: number }} [options]
 */
export const exportAndShareBackup = async ({
  onProgress,
  shareDialogTitle,
  estimatedArchiveBytes,
} = {}) => {
  let stagingDir = null;

  try {
    onProgress?.('reading');
    const snapshot = exportAllBackupTables();
    const tableCounts = getBackupTableCounts(snapshot);

    onProgress?.('scanning');
    const { entries, warnings, missingPaths } = await scanDatabaseFileIntegrity(snapshot);
    const databaseForBackup = rewriteDatabasePathsForBackup(snapshot);
    const databaseJson = JSON.stringify(databaseForBackup, null, 2);
    const databaseChecksum = checksumString(databaseJson);

    const fileBytes = entries
      .filter((entry) => entry.exists)
      .reduce((sum, entry) => sum + (entry.sizeBytes || 0), 0);
    const requiredBytes =
      estimatedArchiveBytes ?? fileBytes + databaseJson.length + ARCHIVE_OVERHEAD_BYTES;
    assertSufficientDiskSpace(requiredBytes * 2);

    onProgress?.('staging');
    stagingDir = new Directory(Paths.cache, `${STAGING_DIR_PREFIX}${Date.now()}`);
    ensureDirectory(stagingDir);

    writeTextFile(stagingDir, DATABASE_JSON_FILENAME, databaseJson);

    const filesDir = new Directory(stagingDir, BACKUP_FILES_DIR_NAME);
    ensureDirectory(filesDir);
    copyReferencedFilesToStaging(collectReferencedAbsolutePaths(snapshot), filesDir);

    const manifest = createExportManifest({
      tableCounts,
      fileEntries: entries,
      warnings,
      databaseChecksum,
    });
    writeTextFile(stagingDir, MANIFEST_FILENAME, serializeManifest(manifest));

    onProgress?.('zipping');
    const zipBytes = zipDirectoryToBytes(stagingDir);
    const filePath = writeZipArchive(zipBytes, buildBackupFileName());

    let shared = false;
    onProgress?.('sharing');

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'application/zip',
        dialogTitle: shareDialogTitle ?? 'Share Tender backup',
        UTI: 'public.zip-archive',
      });
      shared = true;
    }

    onProgress?.('done');

    return {
      filePath,
      shared,
      warnings,
      missingFileCount: missingPaths.length,
      tableCounts,
      archiveBytes: zipBytes.length,
    };
  } finally {
    cleanupDirectory(stagingDir);
  }
};
