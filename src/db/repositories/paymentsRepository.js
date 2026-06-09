// src/db/repositories/paymentsRepository.js
//
// Payments are a ledger: each Save & Continue on the Payment Status screen
// appends a new installment row. The screen displays SUM(amount_paid) as
// Amount Paid and lists rows as Payment History.
//
// DB schema (payments table):
//   id, work_id, paid, payment_date, amount_paid, payment_receipt_path
//
// Legacy single-row API (upsertPayment / getPaymentByWorkId) is retained for
// callers that pre-date the ledger model. New code uses
// appendPaymentInstallment + getPaymentInstallmentsForWork.

import { getDB } from '../database';
import { getFinalTenderAmountForWork } from './contractorRepository';
import { getTenderAmountByWorkId } from './tendersRepository';

/** INSERT a new installment row. Returns the new row id. */
export const appendPaymentInstallment = (workId, data = {}) => {
  if (!workId) throw new Error('appendPaymentInstallment: workId is required');

  const {
    amount_paid = null,
    payment_date = null,
    payment_receipt_path = null,
    payment_pdf_path = null,
  } = data;

  const amountValue = amount_paid
    ? parseFloat(String(amount_paid).replace(/[^0-9.]/g, ''))
    : null;

  if (!amountValue || amountValue <= 0) {
    throw new Error('appendPaymentInstallment: amount_paid must be positive');
  }

  const receiptPath = payment_receipt_path ?? payment_pdf_path ?? null;
  const db = getDB();

  const result = db.runSync(
    `INSERT INTO payments
       (work_id, paid, payment_date, amount_paid, payment_receipt_path)
     VALUES (?, 1, ?, ?, ?);`,
    [workId, payment_date || null, amountValue, receiptPath],
  );

  return result?.lastInsertRowId ?? null;
};

/**
 * All installment rows for a work, ordered by payment_date asc, then created_at.
 * Excludes empty seed rows (no amount_paid).
 */
export const getPaymentInstallmentsForWork = (workId) => {
  if (!workId) return [];

  const db = getDB();
  return db.getAllSync(
    `SELECT id, work_id, paid, payment_date, amount_paid, payment_receipt_path, created_at
     FROM payments
     WHERE work_id = ?
       AND amount_paid IS NOT NULL
       AND amount_paid > 0
     ORDER BY
       CASE
         WHEN payment_date LIKE '__/__/____'
         THEN substr(payment_date, 7, 4) || '-' ||
              substr(payment_date, 4, 2) || '-' ||
              substr(payment_date, 1, 2)
         ELSE payment_date
       END ASC,
       created_at ASC,
       id ASC;`,
    [workId],
  );
};

export const upsertPayment = (workId, data) => {
  if (!workId) throw new Error('upsertPayment: workId is required');

  const db = getDB();

  const existing = db.getFirstSync(
    'SELECT id FROM payments WHERE work_id = ? LIMIT 1;',
    [workId],
  );

  const {
    payment_released = false,
    amount_paid      = null,
    payment_date     = null,
    payment_pdf_path = null,
    payment_receipt_path: receiptFromData = null,
  } = data;

  const payment_receipt_path =
    receiptFromData ?? payment_pdf_path ?? null;

  const paidValue = payment_released ? 1 : 0;

  const amountValue = amount_paid
    ? parseFloat(String(amount_paid).replace(/[^0-9.]/g, ''))
    : null;

  const dateValue   = payment_released ? (payment_date   || null) : null;
  const amountFinal = payment_released ? amountValue              : null;

  if (existing) {
    db.runSync(
      `UPDATE payments SET
         paid                 = ?,
         payment_date         = ?,
         amount_paid          = ?,
         payment_receipt_path = ?
       WHERE work_id = ?;`,
      [paidValue, dateValue, amountFinal, payment_receipt_path, workId],
    );
  } else {
    db.runSync(
      `INSERT INTO payments
         (work_id, paid, payment_date, amount_paid, payment_receipt_path)
       VALUES (?, ?, ?, ?, ?);`,
      [workId, paidValue, dateValue, amountFinal, payment_receipt_path],
    );
  }

  return workId;
};

/** Sum of all amount_paid values across works (Payment screen entries). */
export const getTotalAmountPaidAll = () => {
  const db = getDB();
  const row = db.getFirstSync(
    `SELECT COALESCE(SUM(amount_paid), 0) AS total
     FROM payments
     WHERE amount_paid IS NOT NULL AND amount_paid > 0;`,
  );
  return Number(row?.total) || 0;
};

export const getPaymentByWorkId = (workId) => {
  if (!workId) return null;

  const db = getDB();

  const row = db.getFirstSync(
    `SELECT
       id, work_id, paid, payment_date, amount_paid, payment_receipt_path
     FROM payments
     WHERE work_id = ?
     LIMIT 1;`,
    [workId],
  );

  return row ?? null;
};

// Payment Status total bill = Final Tender Amount (then tender → work budget).
// Amount Paid = SUM(payment installments) only.
export const getPaymentSummaryForWork = (workId) => {
  if (!workId) {
    return { totalBill: 0, amountPaid: 0, pending: 0 };
  }

  const db = getDB();

  const work = db.getFirstSync(
    'SELECT budget FROM works WHERE id = ? LIMIT 1;',
    [workId],
  );
  const paidRow = db.getFirstSync(
    `SELECT COALESCE(SUM(amount_paid), 0) AS total_paid
     FROM payments
     WHERE work_id = ? AND amount_paid IS NOT NULL AND amount_paid > 0;`,
    [workId],
  );

  const finalTenderAmount = getFinalTenderAmountForWork(workId);
  const totalBill =
    finalTenderAmount ??
    getTenderAmountByWorkId(workId) ??
    work?.budget ??
    0;

  const amountPaid = Number(paidRow?.total_paid) || 0;
  const pending = Math.max(0, Number(totalBill) - amountPaid);

  return {
    totalBill: Number(totalBill) || 0,
    amountPaid,
    pending,
  };
};
