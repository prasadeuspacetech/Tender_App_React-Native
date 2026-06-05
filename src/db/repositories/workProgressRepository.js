// src/db/repositories/workProgressRepository.js

import { getDB } from '../database';

export const MAX_SITE_PHOTOS = 10;
export const MAX_SITE_NOTES_LENGTH = 300;

export const parseSitePhotosJson = (raw) => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((uri) => typeof uri === 'string' && uri) : [];
  } catch {
    return [];
  }
};

export const serializeSitePhotos = (photos) => JSON.stringify(Array.isArray(photos) ? photos : []);

/** Maps Work Progress toggle to work list / dashboard status strings. */
export const workCompletionToWorkCompletedStatus = (workCompletion) =>
  workCompletion ? 'Completed' : 'In Progress';

const syncWorkCompletedStatus = (db, workId, workCompletion) => {
  const workCompleted = workCompletionToWorkCompletedStatus(!!workCompletion);
  const existing = db.getFirstSync(
    'SELECT id FROM completion_closure WHERE work_id = ? LIMIT 1;',
    [workId],
  );

  if (existing) {
    db.runSync(
      `UPDATE completion_closure SET
         work_completed = ?,
         updated_at     = datetime('now')
       WHERE work_id = ?;`,
      [workCompleted, workId],
    );
    return;
  }

  db.runSync(
    `INSERT INTO completion_closure (work_id, work_completed)
     VALUES (?, ?);`,
    [workId, workCompleted],
  );
};

export const mapWorkProgressRowToForm = (row) => {
  if (!row) return null;

  return {
    work_completion: !!row.work_completion,
    site_notes: row.site_notes ?? '',
    site_photos: parseSitePhotosJson(row.site_photos),
  };
};

export const upsertWorkProgress = (workId, data) => {
  if (!workId) throw new Error('upsertWorkProgress: workId is required');

  const db = getDB();

  const existing = db.getFirstSync(
    'SELECT id FROM work_progress WHERE work_id = ? LIMIT 1;',
    [workId],
  );

  const workCompletion = data.work_completion ? 1 : 0;
  const siteNotes = String(data.site_notes ?? '').slice(0, MAX_SITE_NOTES_LENGTH);
  const photos = Array.isArray(data.site_photos) ? data.site_photos.slice(0, MAX_SITE_PHOTOS) : [];
  const sitePhotosJson = serializeSitePhotos(photos);

  if (existing) {
    db.runSync(
      `UPDATE work_progress SET
         work_completion = ?,
         site_notes      = ?,
         site_photos     = ?,
         updated_at      = datetime('now')
       WHERE work_id = ?;`,
      [workCompletion, siteNotes, sitePhotosJson, workId],
    );
  } else {
    db.runSync(
      `INSERT INTO work_progress (work_id, work_completion, site_notes, site_photos)
       VALUES (?, ?, ?, ?);`,
      [workId, workCompletion, siteNotes, sitePhotosJson],
    );
  }

  syncWorkCompletedStatus(db, workId, !!data.work_completion);

  return workId;
};

export const getWorkProgressByWorkId = (workId) => {
  if (!workId) return null;

  const db = getDB();

  return (
    db.getFirstSync(
      `SELECT id, work_id, work_completion, site_notes, site_photos
       FROM work_progress
       WHERE work_id = ?
       LIMIT 1;`,
      [workId],
    ) ?? null
  );
};
