// src/db/repositories/generalCorrespondenceRepository.js

import { getDB } from '../database';
import { formatDateForStorage } from '../../utils/dateFormat';

export const createGeneralCorrespondence = ({
  subject = '',
  date = '',
  document_path = '',
} = {}) => {
  const db = getDB();
  const subjectStored = String(subject ?? '').trim();
  const dateStored = formatDateForStorage(date);
  const documentPathStored = String(document_path ?? '').trim();

  const result = db.runSync(
    `INSERT INTO general_correspondence (subject, date, document_path)
     VALUES (?, ?, ?);`,
    [subjectStored, dateStored, documentPathStored || null],
  );

  return result.lastInsertRowId;
};

export const getAllGeneralCorrespondence = () => {
  const db = getDB();

  return db.getAllSync(
    `SELECT id, subject, date, document_path, created_at
     FROM general_correspondence
     ORDER BY datetime(created_at) DESC, id DESC;`,
    [],
  );
};

export const deleteGeneralCorrespondence = (id) => {
  if (!id) return false;

  const db = getDB();
  db.runSync('DELETE FROM general_correspondence WHERE id = ?;', [id]);
  return true;
};
