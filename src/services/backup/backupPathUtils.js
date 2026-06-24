// Normalize absolute device paths ↔ relative backup paths (files/...).

import { Directory, File, Paths } from 'expo-file-system';

import { parseSitePhotosJson } from '../../db/repositories/workProgressRepository';
import { getBackupTableDefinition } from './backupTableRegistry';

export const APP_DOCUMENTS_DIR_NAME = 'app_documents';
export const BACKUP_FILES_DIR_NAME = 'files';

const normalizeUri = (value) => String(value ?? '').trim().replace(/\\/g, '/');

export const isNonEmptyPath = (value) => {
  const normalized = normalizeUri(value);
  return Boolean(normalized);
};

export const getAppDocumentsDirectory = () => new Directory(Paths.document, APP_DOCUMENTS_DIR_NAME);

/** Path segment after app_documents/ on this device, or null if not managed storage. */
export const extractAppDocumentsRelativePath = (absolutePath) => {
  const normalized = normalizeUri(absolutePath);
  if (!normalized) return null;

  const marker = `/${APP_DOCUMENTS_DIR_NAME}/`;
  const lower = normalized.toLowerCase();
  const idx = lower.indexOf(marker);
  if (idx === -1) return null;

  return normalized.slice(idx + marker.length);
};

export const isManagedDocumentPath = (absolutePath) =>
  Boolean(extractAppDocumentsRelativePath(absolutePath));

/** e.g. files/work_12/estimation.pdf */
export const toRelativeBackupPath = (absolutePath) => {
  const relativeToAppDocs = extractAppDocumentsRelativePath(absolutePath);
  if (!relativeToAppDocs) return null;
  return `${BACKUP_FILES_DIR_NAME}/${relativeToAppDocs}`;
};

/** Inverse of toRelativeBackupPath for restore. */
export const toAbsoluteDevicePath = (relativeBackupPath) => {
  const normalized = normalizeUri(relativeBackupPath);
  if (!normalized) return '';

  let inner = normalized;
  const filesPrefix = `${BACKUP_FILES_DIR_NAME}/`;
  if (inner.toLowerCase().startsWith(filesPrefix)) {
    inner = inner.slice(filesPrefix.length);
  } else if (inner.toLowerCase() === BACKUP_FILES_DIR_NAME) {
    inner = '';
  }

  const root = getAppDocumentsDirectory();
  if (!inner) return root.uri;

  const segments = inner.split('/').filter(Boolean);
  return new File(root, ...segments).uri;
};

const parsePathListValue = (raw, kind) => {
  if (!raw) return [];

  if (kind === 'json_array' || kind === 'json_array_or_single') {
    const parsed = parseSitePhotosJson(raw);
    if (parsed.length) return parsed;
    if (kind === 'json_array_or_single' && typeof raw === 'string' && isNonEmptyPath(raw)) {
      return [normalizeUri(raw)];
    }
    return [];
  }

  return isNonEmptyPath(raw) ? [normalizeUri(raw)] : [];
};

/** Collect absolute managed paths referenced by one DB row. */
export const extractPathsFromRow = (tableName, row) => {
  if (!row) return [];

  const definition = getBackupTableDefinition(tableName);
  if (!definition?.pathColumns?.length) return [];

  const paths = [];
  definition.pathColumns.forEach(({ column, kind }) => {
    parsePathListValue(row[column], kind).forEach((path) => {
      if (isManagedDocumentPath(path)) {
        paths.push(path);
      }
    });
  });

  return paths;
};

/** Unique absolute managed paths across an exported database snapshot. */
export const collectReferencedAbsolutePaths = (databaseSnapshot) => {
  const paths = new Set();

  Object.entries(databaseSnapshot ?? {}).forEach(([tableName, rows]) => {
    if (!Array.isArray(rows)) return;
    rows.forEach((row) => {
      extractPathsFromRow(tableName, row).forEach((path) => paths.add(path));
    });
  });

  return [...paths];
};

const mapPathValueForBackup = (raw, kind) => {
  if (!raw) return raw;

  if (kind === 'json_array' || kind === 'json_array_or_single') {
    const absolutePaths = parsePathListValue(raw, kind);
    if (!absolutePaths.length) return raw;

    const relativePaths = absolutePaths
      .map((path) => toRelativeBackupPath(path) ?? path)
      .filter(Boolean);

    if (kind === 'json_array') {
      return JSON.stringify(relativePaths);
    }

    if (relativePaths.length === 1) {
      return relativePaths[0];
    }

    return JSON.stringify(relativePaths);
  }

  const relative = toRelativeBackupPath(raw);
  return relative ?? raw;
};

const mapPathValueForRestore = (raw, kind) => {
  if (!raw) return raw;

  if (kind === 'json_array' || kind === 'json_array_or_single') {
    const storedPaths = parsePathListValue(raw, kind);
    if (!storedPaths.length) return raw;

    const absolutePaths = storedPaths.map((path) => {
      if (path.toLowerCase().startsWith(`${BACKUP_FILES_DIR_NAME}/`)) {
        return toAbsoluteDevicePath(path);
      }
      if (isManagedDocumentPath(path)) return path;
      return toAbsoluteDevicePath(path);
    });

    if (kind === 'json_array') {
      return JSON.stringify(absolutePaths);
    }

    if (absolutePaths.length === 1) {
      return absolutePaths[0];
    }

    return JSON.stringify(absolutePaths);
  }

  const normalized = normalizeUri(raw);
  if (normalized.toLowerCase().startsWith(`${BACKUP_FILES_DIR_NAME}/`)) {
    return toAbsoluteDevicePath(normalized);
  }

  return raw;
};

const rewriteRowPaths = (row, tableName, direction) => {
  const definition = getBackupTableDefinition(tableName);
  if (!definition?.pathColumns?.length) return row;

  const mapper = direction === 'backup' ? mapPathValueForBackup : mapPathValueForRestore;
  const nextRow = { ...row };

  definition.pathColumns.forEach(({ column, kind }) => {
    if (column in nextRow) {
      nextRow[column] = mapper(nextRow[column], kind);
    }
  });

  return nextRow;
};

/** Deep-clone snapshot with absolute paths rewritten to files/... relative paths. */
export const rewriteDatabasePathsForBackup = (databaseSnapshot) => {
  const next = {};

  Object.entries(databaseSnapshot ?? {}).forEach(([tableName, rows]) => {
    next[tableName] = Array.isArray(rows)
      ? rows.map((row) => rewriteRowPaths(row, tableName, 'backup'))
      : [];
  });

  return next;
};

/** Deep-clone snapshot with files/... paths rewritten to this device URIs. */
export const rewriteDatabasePathsForRestore = (databaseSnapshot) => {
  const next = {};

  Object.entries(databaseSnapshot ?? {}).forEach(([tableName, rows]) => {
    next[tableName] = Array.isArray(rows)
      ? rows.map((row) => rewriteRowPaths(row, tableName, 'restore'))
      : [];
  });

  return next;
};
