// src/db/repositories/approvalsRepository.js
//
// Pure functions for the `approvals` table.
// Finance dropdown status is stored in `finance_status` (TEXT), not finance_approved.

import { getDB } from '../database';
import { formatDateForStorage } from '../../utils/dateFormat';

const VALID_FINANCE_STATUSES = new Set(['Pending', 'Approved', 'Rejected']);

// ─── Map SQLite row → PMC Approval form ──────────────────────────────────────
export const mapApprovalRowToForm = (row) => {
  if (!row) return null;

  let finance_approval_status = row.finance_status ?? '';
  if (!finance_approval_status && row.finance_approved != null) {
    const legacy = row.finance_approved;
    if (typeof legacy === 'string' && VALID_FINANCE_STATUSES.has(legacy)) {
      finance_approval_status = legacy;
    }
  }

  return {
    letter_number: row.letter_number ?? '',
    letter_date: formatDateForStorage(row.letter_date),
    approval_date: formatDateForStorage(row.approval_date),
    finance_committee: !!row.finance_required,
    finance_approval_status,
    pmc_letter_path: row.pmc_letter_path ?? '',
  };
};

// ─── Get approval record by work_id ──────────────────────────────────────────
export const getApprovalByWorkId = (workId) => {
  const db = getDB();
  return db.getFirstSync(
    'SELECT * FROM approvals WHERE work_id = ? ORDER BY id DESC LIMIT 1;',
    [workId],
  );
};

// ─── Read-back verification after upsert (catches silent write failures) ───────
export const verifyApprovalPersisted = (workId, expected = {}) => {
  const row = getApprovalByWorkId(workId);
  if (!row) {
    throw new Error(`verifyApprovalPersisted: no approvals row for work_id=${workId}`);
  }

  const expRequired = expected.finance_required ? 1 : 0;
  const expStatus = expected.finance_status ?? '';
  const pairs = [
    ['letter_number', expected.letter_number ?? ''],
    ['letter_date', expected.letter_date ?? ''],
    ['approval_date', expected.approval_date ?? ''],
    ['pmc_letter_path', expected.pmc_letter_path ?? ''],
  ];

  for (const [col, exp] of pairs) {
    const actual = row[col] ?? '';
    if (String(actual) !== String(exp)) {
      throw new Error(
        `verifyApprovalPersisted: ${col} mismatch (expected "${exp}", got "${actual}")`,
      );
    }
  }

  const actualRequired = row.finance_required ? 1 : 0;
  if (actualRequired !== expRequired) {
    throw new Error(
      `verifyApprovalPersisted: finance_required mismatch (expected ${expRequired}, got ${actualRequired})`,
    );
  }

  const actualStatus = row.finance_status ?? '';
  if (String(actualStatus) !== String(expStatus)) {
    throw new Error(
      `verifyApprovalPersisted: finance_status mismatch (expected "${expStatus}", got "${actualStatus}")`,
    );
  }

  return row;
};

// ─── Upsert approval details for a work ──────────────────────────────────────
// Returns workId (useSaveAndContinue expects works.id, not approvals.id).
export const upsertApprovalDetails = (workId, data = {}) => {
  if (!workId) throw new Error('upsertApprovalDetails: workId is required');

  const db = getDB();
  const now = new Date().toISOString();

  const existing = getApprovalByWorkId(workId);

  const {
    letter_number = '',
    letter_date: rawLetterDate = '',
    approval_date: rawApprovalDate = '',
    finance_required = 0,
    finance_status = '',
    pmc_letter_path = '',
  } = data;

  const letter_date = formatDateForStorage(rawLetterDate);
  const approval_date = formatDateForStorage(rawApprovalDate);
  const financeRequiredInt = finance_required ? 1 : 0;

  if (!existing) {
    db.runSync(
      `INSERT INTO approvals
         (work_id, letter_number, letter_date, approval_date,
          finance_required, finance_status, pmc_letter_path, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        workId,
        letter_number,
        letter_date,
        approval_date,
        financeRequiredInt,
        finance_status,
        pmc_letter_path,
        now,
        now,
      ],
    );
  } else {
    db.runSync(
      `UPDATE approvals
       SET letter_number    = ?,
           letter_date      = ?,
           approval_date    = ?,
           finance_required = ?,
           finance_status   = ?,
           pmc_letter_path  = ?,
           updated_at       = ?
       WHERE id = ?;`,
      [
        letter_number,
        letter_date,
        approval_date,
        financeRequiredInt,
        finance_status,
        pmc_letter_path,
        now,
        existing.id,
      ],
    );
  }

  verifyApprovalPersisted(workId, {
    letter_number,
    letter_date,
    approval_date,
    finance_required: financeRequiredInt,
    finance_status,
    pmc_letter_path,
  });

  return workId;
};
