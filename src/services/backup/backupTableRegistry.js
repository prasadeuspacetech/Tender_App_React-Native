// Registry of SQLite tables included in device backup/restore.
// Import order respects foreign keys; clear order is the reverse.

/** @typedef {'single' | 'json_array' | 'json_array_or_single'} BackupPathColumnKind */

/**
 * @typedef {Object} BackupPathColumn
 * @property {string} column
 * @property {BackupPathColumnKind} kind
 */

/**
 * @typedef {Object} BackupTableDefinition
 * @property {string} name
 * @property {number} importOrder Lower numbers are inserted first on restore.
 * @property {BackupPathColumn[]} pathColumns Columns that reference local files.
 */

/** Bump when schema.js migrations change backup-compatible shape. */
export const BACKUP_SCHEMA_VERSION = 12;

/** Oldest schema version this app can import. */
export const MIN_BACKUP_SCHEMA_VERSION = 12;

/** @type {BackupTableDefinition[]} */
export const BACKUP_TABLE_DEFINITIONS = [
  {
    name: 'works',
    importOrder: 10,
    pathColumns: [],
  },
  {
    name: 'financial_year_budgets',
    importOrder: 20,
    pathColumns: [],
  },
  {
    name: 'general_correspondence',
    importOrder: 30,
    pathColumns: [{ column: 'document_path', kind: 'single' }],
  },
  {
    name: 'approvals',
    importOrder: 40,
    pathColumns: [{ column: 'pmc_letter_path', kind: 'single' }],
  },
  {
    name: 'estimations',
    importOrder: 50,
    pathColumns: [{ column: 'document_path', kind: 'single' }],
  },
  {
    name: 'tenders',
    importOrder: 60,
    pathColumns: [
      { column: 'advertisement_path', kind: 'single' },
      { column: 'tender_notice_path', kind: 'single' },
    ],
  },
  {
    name: 'retenders',
    importOrder: 70,
    pathColumns: [],
  },
  {
    name: 'contractors',
    importOrder: 80,
    pathColumns: [{ column: 'document_path', kind: 'single' }],
  },
  {
    name: 'sanctions',
    importOrder: 90,
    pathColumns: [{ column: 'sanction_letter_path', kind: 'single' }],
  },
  {
    name: 'work_orders',
    importOrder: 100,
    pathColumns: [
      { column: 'work_order_document_path', kind: 'single' },
      { column: 'inauguration_photos', kind: 'json_array' },
    ],
  },
  {
    name: 'work_progress',
    importOrder: 110,
    pathColumns: [{ column: 'site_photos', kind: 'json_array' }],
  },
  {
    name: 'bill_submissions',
    importOrder: 120,
    pathColumns: [{ column: 'bill_document', kind: 'single' }],
  },
  {
    name: 'completion_closure',
    importOrder: 130,
    pathColumns: [
      { column: 'completion_certificate_path', kind: 'single' },
      { column: 'site_photos_path', kind: 'json_array_or_single' },
    ],
  },
  {
    name: 'payments',
    importOrder: 140,
    pathColumns: [{ column: 'payment_receipt_path', kind: 'single' }],
  },
  {
    name: 'documents',
    importOrder: 150,
    pathColumns: [{ column: 'file_path', kind: 'single' }],
  },
];

const sortByImportOrder = (tables) =>
  [...tables].sort((left, right) => left.importOrder - right.importOrder);

/** Table names in FK-safe restore insert order. */
export const BACKUP_TABLE_IMPORT_ORDER = sortByImportOrder(BACKUP_TABLE_DEFINITIONS).map(
  (table) => table.name,
);

/** Table names in FK-safe clear/delete order (children first). */
export const BACKUP_TABLE_CLEAR_ORDER = [...BACKUP_TABLE_IMPORT_ORDER].reverse();

export const BACKUP_TABLE_NAMES = BACKUP_TABLE_DEFINITIONS.map((table) => table.name);

const tableDefinitionByName = new Map(
  BACKUP_TABLE_DEFINITIONS.map((table) => [table.name, table]),
);

export const getBackupTableDefinition = (tableName) =>
  tableDefinitionByName.get(tableName) ?? null;

export const isBackupTableName = (tableName) => tableDefinitionByName.has(tableName);
