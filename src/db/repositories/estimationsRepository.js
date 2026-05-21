// src/db/repositories/estimationsRepository.js
//
// Sync API — matches paymentsRepository / tendersRepository pattern.
// Keyed by work_id — one row per work.

import { getDB } from '../database';
import { formatDateForStorage } from '../../utils/dateFormat';

export const upsertEstimation = (workId, data = {}) => {
  if (!workId) throw new Error('upsertEstimation: workId is required');

  const db = getDB();

  const existing = db.getFirstSync(
    'SELECT id FROM estimations WHERE work_id = ? LIMIT 1;',
    [workId],
  );

  const {
    estimate_done = false,
    estimation_date = null,
    estimated_cost = null,
    notes = null,
    estimation_file_path = null,
    document_path: documentPathFromData = null,
  } = data;

  const document_path =
    documentPathFromData ?? estimation_file_path ?? null;

  const doneValue = estimate_done ? 1 : 0;

  const costValue = estimated_cost != null && String(estimated_cost).trim() !== ''
    ? parseFloat(String(estimated_cost).replace(/[^0-9.]/g, ''))
    : null;

  const dateStored = formatDateForStorage(estimation_date);
  const dateValue = estimate_done ? (dateStored || null) : null;
  const costFinal = estimate_done ? costValue : null;
  const notesFinal = estimate_done ? (notes || null) : null;

  if (existing) {
    db.runSync(
      `UPDATE estimations SET
         estimate_done   = ?,
         estimation_date = ?,
         estimated_cost  = ?,
         notes           = ?,
         document_path   = ?
       WHERE work_id = ?;`,
      [doneValue, dateValue, costFinal, notesFinal, document_path, workId],
    );
  } else {
    db.runSync(
      `INSERT INTO estimations
         (work_id, estimate_done, estimation_date, estimated_cost, notes, document_path)
       VALUES (?, ?, ?, ?, ?, ?);`,
      [workId, doneValue, dateValue, costFinal, notesFinal, document_path],
    );
  }

  return workId;
};

export const getEstimationByWorkId = (workId) => {
  if (!workId) return null;

  const db = getDB();

  const row = db.getFirstSync(
    `SELECT
       id, work_id, estimate_done, estimation_date,
       estimated_cost, notes, document_path
     FROM estimations
     WHERE work_id = ?
     LIMIT 1;`,
    [workId],
  );

  return row ?? null;
};

export const mapEstimationRowToForm = (row) => {
  if (!row) return null;

  return {
    estimate_done: !!row.estimate_done,
    estimation_date: formatDateForStorage(row.estimation_date),
    estimated_cost: row.estimated_cost != null ? String(row.estimated_cost) : '',
    notes: row.notes ?? '',
    estimation_file_path: row.document_path ?? '',
  };
};
