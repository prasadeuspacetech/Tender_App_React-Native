// src/db/repositories/tendersRepository.js
//
// Matches worksRepository.js patterns exactly:
//   import { getDB } from '../database'      ← capital D+B
//   const db = getDB() inside each function  ← lazy, never at module level
//   db.runSync()                             ← for INSERT / UPDATE
//   db.getFirstSync()                        ← for SELECT single row

import { getDB } from '../database';

// ─────────────────────────────────────────────────────────────────────────────
// UPSERT — INSERT or UPDATE based on whether work_id already has a tender row
// Returns: workId  (useSaveAndContinue expects the workId back)
// ─────────────────────────────────────────────────────────────────────────────
export const upsertTender = (workId, data) => {
  if (!workId) throw new Error('upsertTender: workId is required');

  const db = getDB();

  // ── Check for existing record ─────────────────────────────────────────────
  const existing = db.getFirstSync(
    'SELECT id FROM tenders WHERE work_id = ? LIMIT 1;',
    [workId],
  );

  const {
    tender_name        = '',
    tender_number      = '',
    tender_date        = '',
    tender_amount      = null,
    status             = 'closed',
    a_packet_open      = false,
    b_packet_open      = false,
    advertisement_path = null,
    tender_notice_path = null,
  } = data;

  const aPacketOpen = a_packet_open ? 1 : 0;
  const bPacketOpen = b_packet_open ? 1 : 0;

  // Strip currency symbols / commas — store NULL if blank so SUM queries stay clean
  const amountValue = tender_amount
    ? parseFloat(String(tender_amount).replace(/[^0-9.]/g, ''))
    : null;

  if (existing) {
    // ── UPDATE ────────────────────────────────────────────────────────────
    db.runSync(
      `UPDATE tenders SET
         tender_name        = ?,
         tender_number      = ?,
         tender_date        = ?,
         tender_amount      = ?,
         status             = ?,
         a_packet_open      = ?,
         b_packet_open      = ?,
         advertisement_path = ?,
         tender_notice_path = ?
       WHERE work_id = ?;`,
      [
        tender_name, tender_number, tender_date,
        amountValue, status,
        aPacketOpen, bPacketOpen,
        advertisement_path, tender_notice_path,
        workId,
      ],
    );
  } else {
    // ── INSERT ────────────────────────────────────────────────────────────
    db.runSync(
      `INSERT INTO tenders
         (work_id, tender_name, tender_number, tender_date,
          tender_amount, status, a_packet_open, b_packet_open,
          advertisement_path, tender_notice_path)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        workId,
        tender_name, tender_number, tender_date,
        amountValue, status,
        aPacketOpen, bPacketOpen,
        advertisement_path, tender_notice_path,
      ],
    );
  }

  return workId;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET BY WORK ID — hydration query when screen is reopened
// Returns: tender row | null
// ─────────────────────────────────────────────────────────────────────────────
export const getTenderByWorkId = (workId) => {
  if (!workId) return null;

  const db = getDB();

  const row = db.getFirstSync(
    `SELECT
       id, work_id, tender_name, tender_number,
       tender_date, tender_amount, status,
       a_packet_open, b_packet_open,
       advertisement_path, tender_notice_path
     FROM tenders
     WHERE work_id = ?
     LIMIT 1;`,
    [workId],
  );

  return row ?? null;
};

/** Latest tender_amount for a work (Tender Creation base amount). */
export const getTenderAmountByWorkId = (workId) => {
  if (!workId) return null;

  const db = getDB();
  const row = db.getFirstSync(
    'SELECT tender_amount FROM tenders WHERE work_id = ? ORDER BY id DESC LIMIT 1;',
    [workId],
  );

  if (row?.tender_amount == null) return null;
  const n = Number(row.tender_amount);
  return Number.isFinite(n) ? n : null;
};