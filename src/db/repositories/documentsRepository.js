// Central documents registry (Technical Guide §6 — documents table)

import { getDB } from '../database';

export const upsertDocumentRecord = (workId, type, filePath, fileName = '') => {
  if (!workId || !type || !filePath) {
    throw new Error('upsertDocumentRecord: workId, type, and filePath are required');
  }

  const db = getDB();
  const now = new Date().toISOString();

  const existing = db.getFirstSync(
    'SELECT id FROM documents WHERE work_id = ? AND type = ? LIMIT 1;',
    [workId, type],
  );

  if (existing) {
    db.runSync(
      `UPDATE documents
       SET file_path = ?, file_name = ?, uploaded_at = ?
       WHERE id = ?;`,
      [filePath, fileName, now, existing.id],
    );
  } else {
    db.runSync(
      `INSERT INTO documents (work_id, type, file_path, file_name, uploaded_at)
       VALUES (?, ?, ?, ?, ?);`,
      [workId, type, filePath, fileName, now],
    );
  }
};

export const getDocumentRecord = (workId, type) => {
  if (!workId || !type) return null;
  const db = getDB();
  return (
    db.getFirstSync(
      'SELECT * FROM documents WHERE work_id = ? AND type = ? ORDER BY id DESC LIMIT 1;',
      [workId, type],
    ) ?? null
  );
};
