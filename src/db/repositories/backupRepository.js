// Bulk read of all backup-eligible SQLite tables.

import { getDB } from '../database';
import {
  BACKUP_TABLE_CLEAR_ORDER,
  BACKUP_TABLE_DEFINITIONS,
  BACKUP_TABLE_IMPORT_ORDER,
  BACKUP_TABLE_NAMES,
  getBackupTableDefinition,
  isBackupTableName,
} from '../../services/backup/backupTableRegistry';

const quoteIdentifier = (name) => `"${String(name).replace(/"/g, '""')}"`;

const readTableRows = (db, tableName) => {
  const sql = `SELECT * FROM ${quoteIdentifier(tableName)};`;
  return db.getAllSync(sql, []);
};

/**
 * Export all registered business tables inside a read transaction.
 * @returns {Record<string, object[]>}
 */
export const exportAllBackupTables = () => {
  const db = getDB();
  const snapshot = {};

  db.withTransactionSync(() => {
    BACKUP_TABLE_NAMES.forEach((tableName) => {
      snapshot[tableName] = readTableRows(db, tableName);
    });
  });

  return snapshot;
};

/** Row counts per table — used for manifest.tableCounts. */
export const getBackupTableCounts = (snapshot = null) => {
  const data = snapshot ?? exportAllBackupTables();
  const counts = {};

  BACKUP_TABLE_NAMES.forEach((tableName) => {
    const rows = data[tableName];
    counts[tableName] = Array.isArray(rows) ? rows.length : 0;
  });

  return counts;
};

export const getBackupTableImportOrder = () => [...BACKUP_TABLE_IMPORT_ORDER];

export const getBackupTableClearOrder = () => [...BACKUP_TABLE_CLEAR_ORDER];

export const listBackupTableDefinitions = () => [...BACKUP_TABLE_DEFINITIONS];

export const assertBackupSnapshotShape = (snapshot) => {
  if (!snapshot || typeof snapshot !== 'object') {
    throw new Error('assertBackupSnapshotShape: snapshot must be an object');
  }

  const missingTables = BACKUP_TABLE_NAMES.filter(
    (tableName) => !Array.isArray(snapshot[tableName]),
  );

  if (missingTables.length) {
    throw new Error(
      `assertBackupSnapshotShape: snapshot is missing tables: ${missingTables.join(', ')}`,
    );
  }

  return true;
};

export const getUnknownSnapshotTables = (snapshot) =>
  Object.keys(snapshot ?? {}).filter((tableName) => !isBackupTableName(tableName));

export const getBackupTableDefinitionByName = (tableName) => getBackupTableDefinition(tableName);

const insertBackupRow = (db, tableName, row) => {
  const columns = Object.keys(row ?? {});
  if (!columns.length) return;

  const quotedColumns = columns.map((column) => quoteIdentifier(column)).join(', ');
  const placeholders = columns.map(() => '?').join(', ');
  const sql = `INSERT INTO ${quoteIdentifier(tableName)} (${quotedColumns}) VALUES (${placeholders});`;
  const values = columns.map((column) => row[column]);

  db.runSync(sql, values);
};

const resetAutoIncrementSequences = (db) => {
  BACKUP_TABLE_NAMES.forEach((tableName) => {
    const row = db.getFirstSync(
      `SELECT MAX(id) AS maxId FROM ${quoteIdentifier(tableName)};`,
      [],
    );
    const maxId = Number(row?.maxId) || 0;

    if (maxId > 0) {
      db.runSync('DELETE FROM sqlite_sequence WHERE name = ?;', [tableName]);
      db.runSync('INSERT INTO sqlite_sequence (name, seq) VALUES (?, ?);', [tableName, maxId]);
    } else {
      db.runSync('DELETE FROM sqlite_sequence WHERE name = ?;', [tableName]);
    }
  });
};

/** Parent tenders must be inserted before child rows that reference parent_tender_id. */
const sortRowsForImport = (tableName, rows) => {
  if (tableName !== 'tenders' || !Array.isArray(rows) || rows.length < 2) {
    return rows;
  }

  const sorted = [];
  const pending = [...rows];
  const insertedIds = new Set();

  while (pending.length > 0) {
    const nextIndex = pending.findIndex((row) => {
      const parentId = row.parent_tender_id;
      return parentId == null || parentId === '' || insertedIds.has(Number(parentId));
    });

    if (nextIndex === -1) {
      sorted.push(...pending);
      break;
    }

    const [row] = pending.splice(nextIndex, 1);
    sorted.push(row);
    if (row.id != null) {
      insertedIds.add(Number(row.id));
    }
  }

  return sorted;
};

/** Normalize imported JSON to the full registered table shape. */
export const normalizeBackupSnapshot = (snapshot) => {
  const normalized = {};

  BACKUP_TABLE_NAMES.forEach((tableName) => {
    const rows = snapshot?.[tableName];
    normalized[tableName] = Array.isArray(rows) ? rows : [];
  });

  return normalized;
};

/**
 * Full replace of all backup tables inside one transaction.
 * Expects rows with explicit primary keys from the exported backup.
 */
export const importBackupSnapshot = (snapshot) => {
  const db = getDB();
  const normalized = normalizeBackupSnapshot(snapshot);

  db.runSync('PRAGMA foreign_keys = OFF;');

  try {
    db.withTransactionSync(() => {
      BACKUP_TABLE_CLEAR_ORDER.forEach((tableName) => {
        db.runSync(`DELETE FROM ${quoteIdentifier(tableName)};`);
      });

      BACKUP_TABLE_IMPORT_ORDER.forEach((tableName) => {
        sortRowsForImport(tableName, normalized[tableName]).forEach((row) => {
          insertBackupRow(db, tableName, row);
        });
      });

      resetAutoIncrementSequences(db);
    });
  } finally {
    db.runSync('PRAGMA foreign_keys = ON;');
  }

  return normalized;
};
