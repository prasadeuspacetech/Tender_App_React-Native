// src/db/repositories/contractorRepository.js
//
// Pure functions for the `contractors` table.

import { getDB } from '../database';

const VALID_ESTIMATE_TYPES = new Set(['above', 'below']);

export const normalizeEstimateType = (value) => {
  const v = String(value ?? '').trim().toLowerCase();
  return VALID_ESTIMATE_TYPES.has(v) ? v : 'above';
};

const parseAmount = (value) => {
  if (value == null || String(value).trim() === '') return null;
  const n = parseFloat(String(value).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : null;
};

// ─── Map SQLite row → Contractor Assignment form ─────────────────────────────
export const mapContractorRowToForm = (row, baseForm = {}) => {
  if (!row) return null;

  return {
    ...baseForm,
    contractor_name: row.contractor_name ?? '',
    contractor_contact: row.contractor_contact ?? '',
    percentage_above_below: normalizeEstimateType(row.percentage_above_below),
    percentage_variation:
      row.percentage_variation != null ? String(row.percentage_variation) : '',
    final_tender_amount:
      row.final_tender_amount != null ? String(row.final_tender_amount) : '',
    contractor_doc_path: row.document_path ?? '',
  };
};

// ─── Get contractor record by work_id ─────────────────────────────────────────
export const getContractorByWorkId = (workId) => {
  const db = getDB();
  return db.getFirstSync(
    'SELECT * FROM contractors WHERE work_id = ? ORDER BY id DESC LIMIT 1;',
    [workId],
  );
};

// ─── Upsert contractor assignment for a work ──────────────────────────────────
// Returns workId (useSaveAndContinue expects works.id, not contractors.id).
export const upsertContractorAssignment = (workId, data = {}) => {
  if (!workId) throw new Error('upsertContractorAssignment: workId is required');

  const db = getDB();
  const now = new Date().toISOString();

  const existing = getContractorByWorkId(workId);

  const {
    contractor_name = '',
    contractor_contact = '',
    percentage_above_below: rawEstimateType = 'above',
    percentage_variation = 0,
    final_tender_amount = null,
    contractor_doc_path = null,
    document_path: documentPathFromData = null,
  } = data;

  const document_path =
    documentPathFromData ?? contractor_doc_path ?? null;

  const percentage_above_below = normalizeEstimateType(rawEstimateType);

  const variationValue =
    percentage_variation != null && percentage_variation !== ''
      ? parseFloat(percentage_variation)
      : 0;

  const finalAmountValue = parseAmount(final_tender_amount);

  if (!existing) {
    db.runSync(
      `INSERT INTO contractors
         (work_id, tender_id, contractor_name, contractor_contact,
          percentage_above_below, percentage_variation, final_tender_amount,
          document_path, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        workId,
        workId,
        contractor_name,
        contractor_contact,
        percentage_above_below,
        variationValue,
        finalAmountValue,
        document_path,
        now,
        now,
      ],
    );
  } else {
    db.runSync(
      `UPDATE contractors
          SET contractor_name        = ?,
              contractor_contact     = ?,
              percentage_above_below = ?,
              percentage_variation   = ?,
              final_tender_amount    = ?,
              document_path          = ?,
              updated_at             = ?
        WHERE id = ?;`,
      [
        contractor_name,
        contractor_contact,
        percentage_above_below,
        variationValue,
        finalAmountValue,
        document_path,
        now,
        existing.id,
      ],
    );
  }

  return workId;
};
