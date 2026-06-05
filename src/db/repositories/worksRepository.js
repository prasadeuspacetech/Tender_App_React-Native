// src/db/repositories/worksRepository.js
//
// Pure async functions for the `works` table.
// No UI, no state, no hooks — input/output only.
// All screens access works data through this file via hooks.

import { WORKFLOW_ALL_COMPLETE_STEP } from '../../constants/WorkflowSteps';
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

/** One-time map from 9-step workflow_step to 12-step (payment/completion ids shifted). */
const LEGACY_WORKFLOW_STEP_MAP = {
  8: 10,
  9: 12,
  10: WORKFLOW_ALL_COMPLETE_STEP,
};

// ─── Migrate legacy workflow_step values (9-step → 12-step) ───────────────────
export const migrateLegacyWorkflowSteps = () => {
  const db = getDB();
  const rows = db.getAllSync('SELECT id, workflow_step FROM works;', []);
  const now = new Date().toISOString();

  for (const row of rows) {
    let mapped = LEGACY_WORKFLOW_STEP_MAP[row.workflow_step];
    // Pre-11-step apps used workflow_step 13 as all-complete after 12 steps.
    if (mapped == null && row.workflow_step >= 13) {
      mapped = WORKFLOW_ALL_COMPLETE_STEP;
    }
    if (mapped == null) continue;
    db.runSync(
      'UPDATE works SET workflow_step = ?, updated_at = ? WHERE id = ?;',
      [mapped, now, row.id],
    );
  }
};