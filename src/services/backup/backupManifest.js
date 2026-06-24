// Backup bundle manifest v1 — tender_backup_*.tenderbak.zip

import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { BACKUP_SCHEMA_VERSION, MIN_BACKUP_SCHEMA_VERSION } from './backupTableRegistry';
import { BACKUP_ERROR_CODES } from './backupErrors';

export const BACKUP_FORMAT_VERSION = 1;
export const BACKUP_FILE_EXTENSION = '.tenderbak.zip';
export const MANIFEST_FILENAME = 'manifest.json';
export const DATABASE_JSON_FILENAME = 'database.json';
export const BACKUP_FILES_DIR_NAME = 'files';

export const CHECKSUM_ALGORITHM = 'sha256';

export const getAppVersion = () =>
  Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? '1.0.0';

export const getExportPlatform = () => Platform.OS;

/**
 * @typedef {Object} BackupManifestFileEntry
 * @property {string} relativePath files/... path inside the ZIP
 * @property {number} sizeBytes
 * @property {boolean} exists On source device at export time
 * @property {string|null} checksum sha256 hex when file exists
 */

/**
 * @typedef {Object} BackupManifest
 * @property {number} backupFormatVersion
 * @property {number} schemaVersion
 * @property {string} appVersion
 * @property {string} exportedAt ISO-8601 UTC
 * @property {string} platform android | ios
 * @property {Record<string, number>} tableCounts
 * @property {number} fileCount
 * @property {number} totalBytes
 * @property {number} missingFileCount
 * @property {string} checksumAlgorithm
 * @property {string|null} databaseChecksum sha256 of database.json payload
 * @property {string|null} bundleChecksum Reserved for Phase 2 full-archive hash
 * @property {string[]} warnings
 * @property {BackupManifestFileEntry[]} [files] Optional per-file integrity list
 */

/** @returns {BackupManifest} */
export const createExportManifest = ({
  tableCounts = {},
  fileEntries = [],
  warnings = [],
  exportedAt = new Date().toISOString(),
  appVersion = getAppVersion(),
  platform = getExportPlatform(),
  databaseChecksum = null,
  bundleChecksum = null,
} = {}) => {
  const existingFiles = fileEntries.filter((entry) => entry.exists);
  const missingFileCount = fileEntries.filter((entry) => !entry.exists).length;
  const totalBytes = existingFiles.reduce((sum, entry) => sum + (entry.sizeBytes || 0), 0);

  return {
    backupFormatVersion: BACKUP_FORMAT_VERSION,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    appVersion,
    exportedAt,
    platform,
    tableCounts,
    fileCount: fileEntries.length,
    totalBytes,
    missingFileCount,
    checksumAlgorithm: CHECKSUM_ALGORITHM,
    databaseChecksum,
    bundleChecksum,
    warnings: [...warnings],
    ...(fileEntries.length ? { files: fileEntries } : {}),
  };
};

export const parseManifestJson = (raw) => {
  if (raw == null) {
    throw new Error('parseManifestJson: manifest payload is required');
  }

  const text = typeof raw === 'string' ? raw : JSON.stringify(raw);
  const parsed = JSON.parse(text);
  return parsed;
};

/**
 * @returns {{ valid: boolean, errors: string[], errorCodes: string[], manifest: BackupManifest|null }}
 */
export const validateManifest = (manifest) => {
  const errors = [];
  const errorCodes = [];

  if (!manifest || typeof manifest !== 'object') {
    return {
      valid: false,
      errors: ['Manifest is missing or invalid.'],
      errorCodes: [BACKUP_ERROR_CODES.MANIFEST_MISSING],
      manifest: null,
    };
  }

  if (manifest.backupFormatVersion !== BACKUP_FORMAT_VERSION) {
    errors.push(
      `Unsupported backup format version: ${manifest.backupFormatVersion ?? 'unknown'}.`,
    );
    errorCodes.push(BACKUP_ERROR_CODES.UNSUPPORTED_FORMAT_VERSION);
  }

  if (typeof manifest.schemaVersion !== 'number') {
    errors.push('Manifest schemaVersion is missing.');
    errorCodes.push(BACKUP_ERROR_CODES.SCHEMA_VERSION_MISSING);
  } else {
    if (manifest.schemaVersion > BACKUP_SCHEMA_VERSION) {
      errors.push(
        `Backup requires a newer app schema (v${manifest.schemaVersion}); this app supports up to v${BACKUP_SCHEMA_VERSION}.`,
      );
      errorCodes.push(BACKUP_ERROR_CODES.SCHEMA_TOO_NEW);
    }

    if (manifest.schemaVersion < MIN_BACKUP_SCHEMA_VERSION) {
      errors.push(
        `Backup schema (v${manifest.schemaVersion}) is too old for this app (minimum v${MIN_BACKUP_SCHEMA_VERSION}).`,
      );
      errorCodes.push(BACKUP_ERROR_CODES.SCHEMA_TOO_OLD);
    }
  }

  if (!manifest.exportedAt) {
    errors.push('Manifest exportedAt is missing.');
    errorCodes.push(BACKUP_ERROR_CODES.EXPORTED_AT_MISSING);
  }

  if (!manifest.tableCounts || typeof manifest.tableCounts !== 'object') {
    errors.push('Manifest tableCounts is missing.');
    errorCodes.push(BACKUP_ERROR_CODES.TABLE_COUNTS_MISSING);
  }

  if (manifest.checksumAlgorithm && manifest.checksumAlgorithm !== CHECKSUM_ALGORITHM) {
    errors.push(`Unsupported checksum algorithm: ${manifest.checksumAlgorithm}.`);
    errorCodes.push(BACKUP_ERROR_CODES.UNSUPPORTED_CHECKSUM_ALGORITHM);
  }

  return {
    valid: errors.length === 0,
    errors,
    errorCodes,
    manifest,
  };
};

export const serializeManifest = (manifest) => JSON.stringify(manifest, null, 2);
