// Patch local document paths on workflow tables (entity columns per Technical Guide §6)

import { getDB } from '../database';
import { getApprovalByWorkId } from './approvalsRepository';
import { getContractorByWorkId } from './contractorRepository';
import { getEstimationByWorkId } from './estimationsRepository';
import { getTenderByWorkId } from './tendersRepository';
import { getSanctionByWorkId } from './sanctionsRepository';
import { getPaymentByWorkId } from './paymentsRepository';
import { getCompletionClosureByWorkId } from './completionClosureRepository';

const nowIso = () => new Date().toISOString();

const ensureApprovalRow = (workId) => {
  if (getApprovalByWorkId(workId)) return;
  const db = getDB();
  const now = nowIso();
  db.runSync(
    `INSERT INTO approvals (work_id, created_at, updated_at) VALUES (?, ?, ?);`,
    [workId, now, now],
  );
};

const ensureEstimationRow = (workId) => {
  if (getEstimationByWorkId(workId)) return;
  const db = getDB();
  db.runSync(
    `INSERT INTO estimations (work_id, estimate_done) VALUES (?, 0);`,
    [workId],
  );
};

const ensureTenderRow = (workId) => {
  if (getTenderByWorkId(workId)) return;
  const db = getDB();
  db.runSync(
    `INSERT INTO tenders (work_id, status) VALUES (?, 'closed');`,
    [workId],
  );
};

const ensureContractorRow = (workId) => {
  if (getContractorByWorkId(workId)) return;
  const db = getDB();
  const now = nowIso();
  db.runSync(
    `INSERT INTO contractors (work_id, tender_id, created_at, updated_at) VALUES (?, ?, ?, ?);`,
    [workId, workId, now, now],
  );
};

const ensureSanctionRow = (workId) => {
  if (getSanctionByWorkId(workId)) return;
  const db = getDB();
  db.runSync(`INSERT INTO sanctions (work_id) VALUES (?);`, [workId]);
};

const ensurePaymentRow = (workId) => {
  if (getPaymentByWorkId(workId)) return;
  const db = getDB();
  db.runSync(`INSERT INTO payments (work_id, paid) VALUES (?, 0);`, [workId]);
};

const ensureCompletionRow = (workId) => {
  if (getCompletionClosureByWorkId(workId)) return;
  const db = getDB();
  db.runSync(
    `INSERT INTO completion_closure (work_id, work_completed) VALUES (?, 'Pending');`,
    [workId],
  );
};

export const patchPmcLetterPath = (workId, filePath) => {
  ensureApprovalRow(workId);
  const db = getDB();
  db.runSync(
    `UPDATE approvals SET pmc_letter_path = ?, updated_at = ? WHERE work_id = ?;`,
    [filePath, nowIso(), workId],
  );
};

export const patchEstimationDocumentPath = (workId, filePath) => {
  ensureEstimationRow(workId);
  const db = getDB();
  db.runSync(`UPDATE estimations SET document_path = ? WHERE work_id = ?;`, [
    filePath,
    workId,
  ]);
};

export const patchTenderAdvertisementPath = (workId, filePath) => {
  ensureTenderRow(workId);
  const db = getDB();
  db.runSync(`UPDATE tenders SET advertisement_path = ? WHERE work_id = ?;`, [
    filePath,
    workId,
  ]);
};

export const patchTenderNoticePath = (workId, filePath) => {
  ensureTenderRow(workId);
  const db = getDB();
  db.runSync(`UPDATE tenders SET tender_notice_path = ? WHERE work_id = ?;`, [
    filePath,
    workId,
  ]);
};

export const patchContractorDocumentPath = (workId, filePath) => {
  ensureContractorRow(workId);
  const db = getDB();
  db.runSync(`UPDATE contractors SET document_path = ? WHERE work_id = ?;`, [
    filePath,
    workId,
  ]);
};

export const patchSanctionLetterPath = (workId, filePath) => {
  ensureSanctionRow(workId);
  const db = getDB();
  db.runSync(`UPDATE sanctions SET sanction_letter_path = ? WHERE work_id = ?;`, [
    filePath,
    workId,
  ]);
};

export const patchPaymentReceiptPath = (workId, filePath) => {
  ensurePaymentRow(workId);
  const db = getDB();
  db.runSync(`UPDATE payments SET payment_receipt_path = ? WHERE work_id = ?;`, [
    filePath,
    workId,
  ]);
};

export const patchCompletionCertificatePath = (workId, filePath) => {
  ensureCompletionRow(workId);
  const db = getDB();
  db.runSync(
    `UPDATE completion_closure SET completion_certificate_path = ? WHERE work_id = ?;`,
    [filePath, workId],
  );
};

export const patchSitePhotosPath = (workId, filePath) => {
  ensureCompletionRow(workId);
  const db = getDB();
  db.runSync(
    `UPDATE completion_closure SET site_photos_path = ? WHERE work_id = ?;`,
    [filePath, workId],
  );
};
