// src/db/repositories/financialYearBudgetRepository.js
//
// User-configured budget totals per financial year (Settings).

import { getDB } from '../database';

const normalizeFinancialYear = (financialYear) =>
  financialYear == null ? '' : String(financialYear).trim();

const parseBudgetAmount = (value) => {
  if (value == null || value === '') return 0;
  const n = parseFloat(String(value).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

/** @returns {{ financial_year: string, budget_amount: number } | null} */
export const getFinancialYearBudget = (financialYear) => {
  const fy = normalizeFinancialYear(financialYear);
  if (!fy) return null;

  const db = getDB();
  const row = db.getFirstSync(
    `SELECT financial_year, budget_amount
     FROM financial_year_budgets
     WHERE financial_year = ?
     LIMIT 1;`,
    [fy],
  );

  if (!row) return null;

  return {
    financial_year: row.financial_year,
    budget_amount: Number(row.budget_amount) || 0,
  };
};

export const getAllFinancialYearBudgets = () => {
  const db = getDB();
  return db.getAllSync(
    `SELECT financial_year, budget_amount, updated_at
     FROM financial_year_budgets
     ORDER BY financial_year DESC;`,
    [],
  );
};

/** Insert or update budget for a financial year. */
export const upsertFinancialYearBudget = (financialYear, budgetAmount) => {
  const fy = normalizeFinancialYear(financialYear);
  if (!fy) throw new Error('upsertFinancialYearBudget: financial year is required');

  const amount = parseBudgetAmount(budgetAmount);
  const db = getDB();
  const now = new Date().toISOString();

  const existing = db.getFirstSync(
    'SELECT id FROM financial_year_budgets WHERE financial_year = ? LIMIT 1;',
    [fy],
  );

  if (existing?.id) {
    db.runSync(
      `UPDATE financial_year_budgets
       SET budget_amount = ?, updated_at = ?
       WHERE financial_year = ?;`,
      [amount, now, fy],
    );
    return existing.id;
  }

  const result = db.runSync(
    `INSERT INTO financial_year_budgets (financial_year, budget_amount, updated_at)
     VALUES (?, ?, ?);`,
    [fy, amount, now],
  );

  return result.lastInsertRowId;
};
