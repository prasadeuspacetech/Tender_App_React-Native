// src/db/repositories/generalCorrespondenceRepository.js

import { getDB } from '../database';
import { formatDateForStorage } from '../../utils/dateFormat';

export const createGeneralCorrespondence = ({ subject = '', date = '' } = {}) => {
  const db = getDB();
  const subjectStored = String(subject ?? '').trim();
  const dateStored = formatDateForStorage(date);

  const result = db.runSync(
    `INSERT INTO general_correspondence (subject, date)
     VALUES (?, ?);`,
    [subjectStored, dateStored],
  );

  return result.lastInsertRowId;
};

export const getAllGeneralCorrespondence = () => {
  const db = getDB();

  return db.getAllSync(
    `SELECT id, subject, date, created_at
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
