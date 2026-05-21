// src/db/repositories/paymentsRepository.js
//
//   import { getDB } from '../database'
//   db.runSync() / db.getFirstSync()
//
// DB schema (payments table):
//   id, work_id, paid, payment_date, amount_paid

import { getDB } from '../database';

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

// Best available total for Payment Status summary (sanction → tender → work budget)
export const getPaymentSummaryForWork = (workId) => {
  if (!workId) {
    return { totalBill: 0, amountPaid: 0, pending: 0 };
  }

  const db = getDB();

  const work = db.getFirstSync(
    'SELECT budget FROM works WHERE id = ? LIMIT 1;',
    [workId],
  );
  const tender = db.getFirstSync(
    'SELECT tender_amount FROM tenders WHERE work_id = ? ORDER BY id DESC LIMIT 1;',
    [workId],
  );
  const sanction = db.getFirstSync(
    'SELECT sanction_amount FROM sanctions WHERE work_id = ? ORDER BY id DESC LIMIT 1;',
    [workId],
  );
  const payment = getPaymentByWorkId(workId);

  const totalBill =
    sanction?.sanction_amount ??
    tender?.tender_amount ??
    work?.budget ??
    0;

  const amountPaid = payment?.amount_paid ?? 0;
  const pending = Math.max(0, Number(totalBill) - Number(amountPaid));

  return {
    totalBill: Number(totalBill) || 0,
    amountPaid: Number(amountPaid) || 0,
    pending,
  };
};
