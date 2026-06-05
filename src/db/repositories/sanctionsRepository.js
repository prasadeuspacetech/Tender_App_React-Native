// src/db/repositories/sanctionsRepository.js
//
// Follows tendersRepository.js pattern exactly:
//   import { getDB } from '../database'      ← capital D+B
//   const db = getDB() inside each function  ← lazy, never at module level
//   db.runSync()                             ← for INSERT / UPDATE
//   db.getFirstSync()                        ← for SELECT single row
//
// ─── IMPORTANT: Migration required ───────────────────────────────────────────
// The base `sanctions` table only has: id, work_id, docket_number, sanction_date
// Two columns were added via migration (see schema.js addColumn block):
//   sanction_amount      REAL     — stores numeric rupee amount, NULL if blank
//   sanction_letter_path TEXT     — local file URI after upload
// ─────────────────────────────────────────────────────────────────────────────

import { getDB } from '../database';
import { formatDateForStorage } from '../../utils/dateFormat';

// ─────────────────────────────────────────────────────────────────────────────
// UPSERT — INSERT or UPDATE based on whether work_id already has a sanction row
// Returns: workId  (useSaveAndContinue expects the workId back)
// ─────────────────────────────────────────────────────────────────────────────
export const upsertSanction = (workId, data) => {
  if (!workId) throw new Error('upsertSanction: workId is required');

  const db = getDB();

  // ── Check for existing record ─────────────────────────────────────────────
  const existing = db.getFirstSync(
    'SELECT id FROM sanctions WHERE work_id = ? LIMIT 1;',
    [workId],
  );

  const {
    docket_number        = '',
    sanction_amount      = null,
    sanction_date        = '',
    sanction_authority   = '',
    sanction_letter_path = null,
  } = data;

  // Strip currency symbols / commas — store NULL if blank so SUM queries stay clean
  const amountValue = sanction_amount
    ? parseFloat(String(sanction_amount).replace(/[^0-9.]/g, ''))
    : null;

  const sanctionDateStored = formatDateForStorage(sanction_date);

  if (existing) {
    // ── UPDATE ────────────────────────────────────────────────────────────
    db.runSync(
      `UPDATE sanctions SET
         docket_number        = ?,
         sanction_amount      = ?,
         sanction_date        = ?,
         sanction_authority   = ?,
         sanction_letter_path = ?
       WHERE work_id = ?;`,
      [
        docket_number,
        amountValue,
        sanctionDateStored,
        sanction_authority,
        sanction_letter_path,
        workId,
      ],
    );
  } else {
    // ── INSERT ────────────────────────────────────────────────────────────
    db.runSync(
      `INSERT INTO sanctions
         (work_id, docket_number, sanction_amount, sanction_date,
          sanction_authority, sanction_letter_path)
       VALUES (?, ?, ?, ?, ?, ?);`,
      [
        workId,
        docket_number,
        amountValue,
        sanctionDateStored,
        sanction_authority,
        sanction_letter_path,
      ],
    );
  }

  return workId;
};

export const mapSanctionRowToForm = (row) => {
  if (!row) return null;

  return {
    docket_number: row.docket_number ?? '',
    sanction_amount: row.sanction_amount != null ? String(row.sanction_amount) : '',
    sanction_date: formatDateForStorage(row.sanction_date),
    sanction_authority: row.sanction_authority ?? '',
    sanction_letter_path: row.sanction_letter_path ?? '',
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// GET BY WORK ID — hydration query when screen is reopened
// Returns: sanction row | null
// ─────────────────────────────────────────────────────────────────────────────
export const getSanctionByWorkId = (workId) => {
  if (!workId) return null;

  const db = getDB();

  const row = db.getFirstSync(
    `SELECT
       id, work_id,
       docket_number,
       sanction_amount,
       sanction_date,
       sanction_authority,
       sanction_letter_path
     FROM sanctions
     WHERE work_id = ?
     LIMIT 1;`,
    [workId],
  );

  return row ?? null;
};