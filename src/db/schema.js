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

const CREATE_WORK_ORDERS = `
  CREATE TABLE IF NOT EXISTS work_orders (
    id                         INTEGER PRIMARY KEY AUTOINCREMENT,
    work_id                    INTEGER NOT NULL,
    work_order_number          TEXT,
    work_start_date            TEXT,
    expected_completion_date   TEXT,
    work_order_document_path   TEXT,
    created_at                 TEXT DEFAULT (datetime('now')),
    updated_at                 TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE
  );
`;

const CREATE_WORK_PROGRESS = `
  CREATE TABLE IF NOT EXISTS work_progress (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    work_id      INTEGER NOT NULL,
    site_notes   TEXT,
    site_photos  TEXT,
    created_at   TEXT DEFAULT (datetime('now')),
    updated_at   TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE
  );
`;

const CREATE_BILL_SUBMISSIONS = `
  CREATE TABLE IF NOT EXISTS bill_submissions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    work_id         INTEGER NOT NULL,
    bill_submitted  INTEGER DEFAULT 0,
    bill_number     TEXT,
    bill_date       TEXT,
    bill_document   TEXT,
    created_at      TEXT DEFAULT (datetime('now')),
    updated_at      TEXT DEFAULT (datetime('now')),
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

const CREATE_GENERAL_CORRESPONDENCE = `
  CREATE TABLE IF NOT EXISTS general_correspondence (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    subject    TEXT,
    date       TEXT,
    created_at TEXT DEFAULT (datetime('now'))
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
  CREATE_WORK_ORDERS,
  CREATE_WORK_PROGRESS,
  CREATE_BILL_SUBMISSIONS,
  CREATE_COMPLETION_CLOSURE,
  CREATE_GENERAL_CORRESPONDENCE,
];

// ─── Additive column migrations (run after table creation) ────────────────────
// Each ALTER is gated on a PRAGMA table_info() check so SQLite never emits a
// "duplicate column" error to the iOS native log on subsequent launches.
// End-state schema, ordering, and behaviour are identical to before.
// ORDER MATTERS: never remove or reorder existing entries.
const runColumnMigrations = (db) => {
  const addColumnIfMissing = (table, column, definition) => {
    try {
      const rows = db.getAllSync(`PRAGMA table_info(${table});`);
      const exists = Array.isArray(rows) && rows.some((row) => row && row.name === column);
      if (!exists) {
        db.runSync(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition};`);
      }
    } catch (_) {
      // Defensive — never block startup if PRAGMA or ALTER unexpectedly fails.
    }
  };

  // v1 — existing
  addColumnIfMissing('estimations', 'estimation_date', 'TEXT');
  addColumnIfMissing('sanctions', 'sanction_amount', 'REAL');
  addColumnIfMissing('sanctions', 'sanction_letter_path', 'TEXT');
  // v2 — PMC finance dropdown (was incorrectly written to finance_approved INTEGER)
  addColumnIfMissing('approvals', 'finance_status', 'TEXT');
  // v3 — Contractor % above/below estimate direction
  addColumnIfMissing('contractors', 'percentage_above_below', 'TEXT');
  // v4 — Contractor contact + final tender amount
  addColumnIfMissing('contractors', 'contractor_contact', 'TEXT');
  addColumnIfMissing('contractors', 'final_tender_amount', 'REAL');
  // v5 — Payment Status document path
  addColumnIfMissing('payments', 'payment_receipt_path', 'TEXT');
  // v7 — Tender Creation A/B packet open flags
  addColumnIfMissing('tenders', 'a_packet_open', 'INTEGER DEFAULT 0');
  addColumnIfMissing('tenders', 'b_packet_open', 'INTEGER DEFAULT 0');
  // v8 — Sanction Approval authority
  addColumnIfMissing('sanctions', 'sanction_authority', 'TEXT');
  // v9 — Work Order notes + inauguration photos
  addColumnIfMissing('work_orders', 'notes', 'TEXT');
  addColumnIfMissing('work_orders', 'inauguration_photos', 'TEXT');
  // v10 — Work Progress completion flag
  addColumnIfMissing('work_progress', 'work_completion', 'INTEGER DEFAULT 0');

  // v6 — UNIQUE indexes (IF NOT EXISTS keeps these silent on every launch).
  const indexStatements = [
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_retenders_work_id ON retenders(work_id);`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_work_orders_work_id ON work_orders(work_id);`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_work_progress_work_id ON work_progress(work_id);`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_bill_submissions_work_id ON bill_submissions(work_id);`,
  ];

  indexStatements.forEach((sql) => {
    try {
      db.runSync(sql);
    } catch (_) {
      // Should never trigger — IF NOT EXISTS guards each statement.
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