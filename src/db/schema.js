// src/db/schema.js
//
// All CREATE TABLE IF NOT EXISTS statements.
// Safe to run on every app launch — idempotent by design.
//
// Migration strategy (v1):
//   Single migration block. When columns need to be added in future,
//   add a new migration entry with a version number check.

// ─── Table definitions ────────────────────────────────────────────────────────
const CREATE_WORKS = `
  CREATE TABLE IF NOT EXISTS works (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    work_code        TEXT,
    work_name        TEXT,
    financial_year   TEXT,
    ward             TEXT,
    department       TEXT,
    sub_department   TEXT,
    officer          TEXT,
    budget           REAL,
    workflow_step    INTEGER DEFAULT 1,
    created_at       TEXT DEFAULT (datetime('now')),
    updated_at       TEXT DEFAULT (datetime('now'))
  );
`;

const CREATE_APPROVALS = `
  CREATE TABLE IF NOT EXISTS approvals (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    work_id           INTEGER NOT NULL,
    pmc_letter_path   TEXT,
    letter_number     TEXT,
    letter_date       TEXT,
    approval_date     TEXT,
    finance_required  INTEGER DEFAULT 0,
    finance_approved  INTEGER DEFAULT 0,
    finance_committee TEXT,
    finance_status    TEXT,
    created_at        TEXT DEFAULT (datetime('now')),
    updated_at        TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE
  );
`;

const CREATE_ESTIMATIONS = `
  CREATE TABLE IF NOT EXISTS estimations (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    work_id          INTEGER NOT NULL,
    estimate_done    INTEGER DEFAULT 0,
    estimation_date  TEXT,
    estimated_cost   REAL,
    notes            TEXT,
    document_path    TEXT,
    created_at       TEXT DEFAULT (datetime('now')),
    updated_at       TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE
  );
`;

const CREATE_TENDERS = `
  CREATE TABLE IF NOT EXISTS tenders (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    work_id               INTEGER NOT NULL,
    parent_tender_id      INTEGER,
    tender_name           TEXT,
    tender_number         TEXT,
    tender_date           TEXT,
    tender_amount         REAL,
    advertisement_path    TEXT,
    tender_notice_path    TEXT,
    status                TEXT DEFAULT 'Closed',
    is_retender           INTEGER DEFAULT 0,
    created_at            TEXT DEFAULT (datetime('now')),
    updated_at            TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE
  );
`;

const CREATE_CONTRACTORS = `
  CREATE TABLE IF NOT EXISTS contractors (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    tender_id             INTEGER NOT NULL,
    work_id               INTEGER NOT NULL,
    contractor_name       TEXT,
    contractor_contact    TEXT,
    percentage_above_below TEXT,
    percentage_variation  REAL,
    final_tender_amount   REAL,
    document_path         TEXT,
    created_at            TEXT DEFAULT (datetime('now')),
    updated_at            TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (tender_id) REFERENCES tenders(id) ON DELETE CASCADE,
    FOREIGN KEY (work_id)   REFERENCES works(id)   ON DELETE CASCADE
  );
`;

// ── sanctions — includes sanction_amount + sanction_letter_path ───────────────
// Fresh installs get the full table.
// Existing installs get the two new columns via runColumnMigrations below.
const CREATE_SANCTIONS = `
  CREATE TABLE IF NOT EXISTS sanctions (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    work_id               INTEGER NOT NULL,
    docket_number         TEXT,
    sanction_amount       REAL,
    sanction_date         TEXT,
    sanction_letter_path  TEXT,
    notes                 TEXT,
    created_at            TEXT DEFAULT (datetime('now')),
    updated_at            TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE
  );
`;

const CREATE_PAYMENTS = `
  CREATE TABLE IF NOT EXISTS payments (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    work_id       INTEGER NOT NULL,
    paid          INTEGER DEFAULT 0,
    payment_date  TEXT,
    amount_paid   REAL,
    created_at    TEXT DEFAULT (datetime('now')),
    updated_at    TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE
  );
`;

const CREATE_DOCUMENTS = `
  CREATE TABLE IF NOT EXISTS documents (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    work_id     INTEGER NOT NULL,
    type        TEXT NOT NULL,
    file_path   TEXT NOT NULL,
    file_name   TEXT,
    uploaded_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE
  );
`;

const CREATE_RETENDERS = `
  CREATE TABLE IF NOT EXISTS retenders (
    id                        INTEGER PRIMARY KEY AUTOINCREMENT,
    work_id                   INTEGER NOT NULL,
    enable_retender           INTEGER DEFAULT 0,
    previous_tender_reference TEXT,
    new_tender_date           TEXT,
    new_tender_amount         REAL,
    retender_reason           TEXT,
    created_at                TEXT DEFAULT (datetime('now')),
    updated_at                TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE
  );
`;

const CREATE_COMPLETION_CLOSURE = `
  CREATE TABLE IF NOT EXISTS completion_closure (
    id                           INTEGER PRIMARY KEY AUTOINCREMENT,
    work_id                      INTEGER NOT NULL,
    work_completed               TEXT DEFAULT 'Pending',
    completion_certificate_path  TEXT,
    site_photos_path             TEXT,
    created_at                   TEXT DEFAULT (datetime('now')),
    updated_at                   TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE
  );
`;

// ─── All migrations in order ──────────────────────────────────────────────────
// Each entry runs once. To add columns in future: add a new ALTER TABLE entry.
const MIGRATIONS = [
  CREATE_WORKS,
  CREATE_APPROVALS,
  CREATE_ESTIMATIONS,
  CREATE_TENDERS,
  CREATE_CONTRACTORS,
  CREATE_SANCTIONS,
  CREATE_PAYMENTS,
  CREATE_DOCUMENTS,
  CREATE_RETENDERS,
  CREATE_COMPLETION_CLOSURE, 
];

// ─── Additive column migrations (run after table creation) ────────────────────
// Each entry is wrapped in its own try/catch — SQLite throws if column already
// exists, which is the normal case for users who reinstall or re-run migrations.
// ORDER MATTERS: never remove or reorder existing entries.
const runColumnMigrations = (db) => {
  const columnMigrations = [
    // v1 — existing
    `ALTER TABLE estimations ADD COLUMN estimation_date TEXT;`,
    `ALTER TABLE sanctions ADD COLUMN sanction_amount      REAL;`,
    `ALTER TABLE sanctions ADD COLUMN sanction_letter_path TEXT;`,
    // v2 — PMC finance dropdown (was incorrectly written to finance_approved INTEGER)
    `ALTER TABLE approvals ADD COLUMN finance_status TEXT;`,
    // v3 — Contractor % above/below estimate direction
    `ALTER TABLE contractors ADD COLUMN percentage_above_below TEXT;`,
    // v4 — Contractor contact + final tender amount
    `ALTER TABLE contractors ADD COLUMN contractor_contact TEXT;`,
    `ALTER TABLE contractors ADD COLUMN final_tender_amount REAL;`,
    // v5 — Payment Status document path
    `ALTER TABLE payments ADD COLUMN payment_receipt_path TEXT;`,
    // v6 — one retenders row per work
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_retenders_work_id ON retenders(work_id);`,
  ];

  columnMigrations.forEach((sql) => {
    try {
      db.runSync(sql);
    } catch (_) {
      // Column already exists on this device — expected, safe to ignore
    }
  });
};

// ─── Migration runner ─────────────────────────────────────────────────────────
export const runMigrations = (db) => {
  return new Promise((resolve, reject) => {
    try {
      db.withTransactionSync(() => {
        MIGRATIONS.forEach((sql) => {
          db.runSync(sql);
        });
      });
      // Column migrations run outside the main transaction —
      // ALTER TABLE cannot run inside a transaction in SQLite
      runColumnMigrations(db);
      resolve();
    } catch (error) {
      console.error('[Schema] Migration failed:', error);
      reject(error);
    }
  });
};