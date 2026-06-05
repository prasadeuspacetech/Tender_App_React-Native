// src/db/repositories/workOrdersRepository.js

import { getDB } from '../database';
import { formatDateForStorage } from '../../utils/dateFormat';
import {
  parseSitePhotosJson,
  serializeSitePhotos,
  MAX_SITE_PHOTOS,
} from './workProgressRepository';

export const MAX_INAUGURATION_PHOTOS = MAX_SITE_PHOTOS;

export const upsertWorkOrder = (workId, data) => {
  if (!workId) throw new Error('upsertWorkOrder: workId is required');

  const db = getDB();

  const existing = db.getFirstSync(
    'SELECT id FROM work_orders WHERE work_id = ? LIMIT 1;',
    [workId],
  );

  const {
    work_order_number = '',
    work_start_date = '',
    expected_completion_date = '',
    notes = '',
    inauguration_photos = [],
    work_order_document_path = null,
  } = data;

  const startStored = formatDateForStorage(work_start_date);
  const completionStored = formatDateForStorage(expected_completion_date);
  const photos = Array.isArray(inauguration_photos)
    ? inauguration_photos.slice(0, MAX_INAUGURATION_PHOTOS)
    : [];
  const inaugurationPhotosJson = serializeSitePhotos(photos);

  if (existing) {
    db.runSync(
      `UPDATE work_orders SET
         work_order_number        = ?,
         work_start_date          = ?,
         expected_completion_date = ?,
         notes                    = ?,
         inauguration_photos      = ?,
         work_order_document_path = ?,
         updated_at               = datetime('now')
       WHERE work_id = ?;`,
      [
        work_order_number,
        startStored,
        completionStored,
        notes,
        inaugurationPhotosJson,
        work_order_document_path,
        workId,
      ],
    );
  } else {
    db.runSync(
      `INSERT INTO work_orders
         (work_id, work_order_number, work_start_date, expected_completion_date,
          notes, inauguration_photos, work_order_document_path)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [
        workId,
        work_order_number,
        startStored,
        completionStored,
        notes,
        inaugurationPhotosJson,
        work_order_document_path,
      ],
    );
  }

  return workId;
};

export const mapWorkOrderRowToForm = (row) => {
  if (!row) return null;

  return {
    work_order_number: row.work_order_number ?? '',
    work_start_date: formatDateForStorage(row.work_start_date),
    expected_completion_date: formatDateForStorage(row.expected_completion_date),
    notes: row.notes ?? '',
    inauguration_photos: parseSitePhotosJson(row.inauguration_photos),
    work_order_document_path: row.work_order_document_path ?? '',
  };
};

export const getWorkOrderByWorkId = (workId) => {
  if (!workId) return null;

  const db = getDB();

  return (
    db.getFirstSync(
      `SELECT
         id, work_id,
         work_order_number,
         work_start_date,
         expected_completion_date,
         notes,
         inauguration_photos,
         work_order_document_path
       FROM work_orders
       WHERE work_id = ?
       LIMIT 1;`,
      [workId],
    ) ?? null
  );
};
