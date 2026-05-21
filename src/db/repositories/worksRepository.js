// src/db/repositories/worksRepository.js
//
// Pure async functions for the `works` table.
// No UI, no state, no hooks — input/output only.
// All screens access works data through this file via hooks.

import { getDB } from '../database';

// ─── Create a new work record ─────────────────────────────────────────────────
export const createWork = (data = {}) => {
  const db = getDB();
  const {
    work_code = '',
    work_name = '',
    financial_year = '',
    ward = '',
    department = '',
    sub_department = '',
    officer = '',
    budget = 0,
    workflow_step = 1,
  } = data;

  const result = db.runSync(
    `INSERT INTO works
      (work_code, work_name, financial_year, ward, department,
       sub_department, officer, budget, workflow_step)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [work_code, work_name, financial_year, ward, department,
     sub_department, officer, budget, workflow_step],
  );

  return result.lastInsertRowId;
};

// ─── Get single work by id ────────────────────────────────────────────────────
export const getWorkById = (id) => {
  const db = getDB();
  return db.getFirstSync(
    'SELECT * FROM works WHERE id = ?;',
    [id],
  );
};

// ─── Get all works (raw works rows) ───────────────────────────────────────────
export const getAllWorks = () => {
  const db = getDB();
  return db.getAllSync(
    'SELECT * FROM works ORDER BY created_at DESC;',
  );
};

// ─── Works list: includes completion status (NOT workflow_step) ───────────────
// work_completed from completion_closure.work_completed; default Pending if no row.
export const getAllWorksForList = () => {
  const db = getDB();
  return db.getAllSync(
    `SELECT
       w.*,
       COALESCE(cc.work_completed, 'Pending') AS work_completed
     FROM works w
     LEFT JOIN completion_closure cc ON cc.work_id = w.id
     ORDER BY w.created_at DESC;`,
  );
};

// ─── Update work fields ───────────────────────────────────────────────────────
export const updateWork = (id, data = {}) => {
  const db = getDB();
  const now = new Date().toISOString();

  const fields = { ...data, updated_at: now };
  const keys = Object.keys(fields);
  const setClause = keys.map((k) => `${k} = ?`).join(', ');
  const values = [...Object.values(fields), id];

  db.runSync(
    `UPDATE works SET ${setClause} WHERE id = ?;`,
    values,
  );
};

// ─── Advance workflow step ────────────────────────────────────────────────────
// Called after each successful Save & Continue
export const advanceWorkflowStep = (workId, completedStep) => {
  const db = getDB();
  const now = new Date().toISOString();

  db.runSync(
    `UPDATE works
     SET workflow_step = MAX(workflow_step, ?), updated_at = ?
     WHERE id = ?;`,
    [completedStep + 1, now, workId],
  );
};

// ─── Upsert work details (WorkDetails screen) ─────────────────────────────────
// Creates a new record if workId is null; updates if it exists.
// Returns the work id (new or existing).
export const upsertWorkDetails = (workId, data) => {
  if (!workId) {
    return createWork({ ...data, workflow_step: 1 });
  }
  updateWork(workId, data);
  return workId;
};

// ─── Delete work (and cascaded child records) ─────────────────────────────────
export const deleteWork = (id) => {
  const db = getDB();
  db.runSync('DELETE FROM works WHERE id = ?;', [id]);
};