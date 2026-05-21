// src/db/repositories/retendersRepository.js
//
// One row per work. Stores Re-Tender toggle + 4 conditional fields.
// Pattern mirrors estimationsRepository / paymentsRepository.

import { getDB } from '../database';
import { formatDateForStorage } from '../../utils/dateFormat';

const toAmount = (value) => {
  if (value == null || String(value).trim() === '') return null;
  const n = parseFloat(String(value).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : null;
};

const trimOrNull = (value) => {
  const s = value == null ? '' : String(value).trim();
  return s ? s : null;
};

const normalizeWorkId = (workId) => {
  const id = Number(workId);
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error('upsertReTender: valid workId is required');
  }
  return id;
};

export const upsertReTender = (workId, data = {}) => {
  const id = normalizeWorkId(workId);
  const db = getDB();

  const existing = db.getFirstSync(
    'SELECT id FROM retenders WHERE work_id = ? LIMIT 1;',
    [id],
  );

  const {
    enable_retender = false,
    previous_tender_reference = null,
    new_tender_date = null,
    new_tender_amount = null,
    retender_reason = null,
  } = data;

  const isEnabled = enable_retender ? 1 : 0;

  const refValue = isEnabled ? trimOrNull(previous_tender_reference) : null;
  const dateStored = formatDateForStorage(new_tender_date);
  const dateValue = isEnabled ? (dateStored || null) : null;
  const amountValue = isEnabled ? toAmount(new_tender_amount) : null;
  const reasonValue = isEnabled ? trimOrNull(retender_reason) : null;

  if (existing) {
    db.runSync(
      `UPDATE retenders SET
         enable_retender           = ?,
         previous_tender_reference = ?,
         new_tender_date           = ?,
         new_tender_amount         = ?,
         retender_reason           = ?,
         updated_at                = datetime('now')
       WHERE work_id = ?;`,
      [isEnabled, refValue, dateValue, amountValue, reasonValue, id],
    );
  } else {
    db.runSync(
      `INSERT INTO retenders
         (work_id, enable_retender, previous_tender_reference,
          new_tender_date, new_tender_amount, retender_reason)
       VALUES (?, ?, ?, ?, ?, ?);`,
      [id, isEnabled, refValue, dateValue, amountValue, reasonValue],
    );
  }

  return id;
};

export const getReTenderByWorkId = (workId) => {
  const id = Number(workId);
  if (!Number.isFinite(id) || id <= 0) return null;

  const db = getDB();

  const row = db.getFirstSync(
    `SELECT
       id, work_id, enable_retender, previous_tender_reference,
       new_tender_date, new_tender_amount, retender_reason
     FROM retenders
     WHERE work_id = ?
     ORDER BY id DESC
     LIMIT 1;`,
    [id],
  );

  return row ?? null;
};

export const mapReTenderRowToForm = (row) => {
  if (!row) return null;

  return {
    enable_retender: !!row.enable_retender,
    previous_tender_reference: row.previous_tender_reference ?? '',
    new_tender_date: formatDateForStorage(row.new_tender_date),
    new_tender_amount:
      row.new_tender_amount != null ? String(row.new_tender_amount) : '',
    retender_reason: row.retender_reason ?? '',
  };
};
