// src/db/repositories/completionClosureRepository.js
//
// Follows paymentsRepository.js / tendersRepository.js pattern exactly.
//   import { getDB } from '../database'     ← lazy db access
//   db.runSync()                            ← INSERT / UPDATE
//   db.getFirstSync()                       ← SELECT single row
//
// DB schema (completion_closure table):
//   id, work_id, work_completed,
//   completion_certificate_path, site_photos_path

import { getDB } from '../database';

// ─────────────────────────────────────────────────────────────────────────────
// UPSERT — INSERT or UPDATE based on whether work_id already has a row
// Returns: workId  (useSaveAndContinue expects the workId back)
// ─────────────────────────────────────────────────────────────────────────────
export const upsertCompletionClosure = (workId, data) => {
  if (!workId) throw new Error('upsertCompletionClosure: workId is required');

  const db = getDB();

  const existing = db.getFirstSync(
    'SELECT id FROM completion_closure WHERE work_id = ? LIMIT 1;',
    [workId],
  );

  const {
    work_completed               = 'Pending',
    completion_certificate_path  = null,
    site_photos_path             = null,
  } = data;

  if (existing) {
    db.runSync(
      `UPDATE completion_closure SET
         work_completed              = ?,
         completion_certificate_path = ?,
         site_photos_path            = ?,
         updated_at                  = datetime('now')
       WHERE work_id = ?;`,
      [work_completed, completion_certificate_path, site_photos_path, workId],
    );
  } else {
    db.runSync(
      `INSERT INTO completion_closure
         (work_id, work_completed, completion_certificate_path, site_photos_path)
       VALUES (?, ?, ?, ?);`,
      [workId, work_completed, completion_certificate_path, site_photos_path],
    );
  }

  return workId;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET BY WORK ID — hydration query when screen is reopened
// Returns: completion_closure row | null
// Also used by Dashboard + Reports to read work_completed status.
// ─────────────────────────────────────────────────────────────────────────────
export const getCompletionClosureByWorkId = (workId) => {
  if (!workId) return null;

  const db = getDB();

  const row = db.getFirstSync(
    `SELECT
       id, work_id, work_completed,
       completion_certificate_path, site_photos_path
     FROM completion_closure
     WHERE work_id = ?
     LIMIT 1;`,
    [workId],
  );

  return row ?? null;
};