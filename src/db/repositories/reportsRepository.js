// src/db/repositories/reportsRepository.js
//
// Read-only aggregations for Reports screen. Does not modify workflow data.

import { formatRupeesCompact } from '../../utils/currencyFormat';
import { computeFinalTenderAmount } from '../../utils/finalTenderAmount';
import { getDB } from '../database';
import { getPaymentSummaryForWork } from './paymentsRepository';

const toPositiveAmount = (value) => {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
};

/**
 * Per-work effective budget (Final Tender Amount first).
 * @see getPaymentSummaryForWork in paymentsRepository.js
 */
export const getEffectiveBudgetForRow = (row) => {
  const computedFinal = computeFinalTenderAmount(
    row.tender_amount,
    row.percentage_above_below,
    row.percentage_variation,
  );
  if (computedFinal != null && computedFinal > 0) return computedFinal;

  const contractor = toPositiveAmount(row.final_tender_amount);
  if (contractor != null) return contractor;

  if (Number(row.enable_retender) === 1) {
    const retenderAmt = toPositiveAmount(row.new_tender_amount);
    if (retenderAmt != null) return retenderAmt;
  }

  const tender = toPositiveAmount(row.tender_amount);
  if (tender != null) return tender;

  const estimation = toPositiveAmount(row.estimated_cost);
  if (estimation != null) return estimation;

  const workBudget = toPositiveAmount(row.work_budget);
  if (workBudget != null) return workBudget;

  return 0;
};

const WORK_BUDGET_ROWS_SQL = `
  SELECT
    w.id AS work_id,
    w.budget AS work_budget,
    w.financial_year,
    (
      SELECT COALESCE(SUM(amount_paid), 0)
      FROM payments
      WHERE work_id = w.id
        AND amount_paid IS NOT NULL
        AND amount_paid > 0
    ) AS amount_paid,
    est.estimated_cost,
    tend.tender_amount,
    cont.final_tender_amount,
    cont.percentage_above_below,
    cont.percentage_variation,
    ret.enable_retender,
    ret.new_tender_amount
  FROM works w
  LEFT JOIN estimations est ON est.work_id = w.id
  LEFT JOIN retenders ret ON ret.work_id = w.id
  LEFT JOIN tenders tend ON tend.id = (
    SELECT id FROM tenders WHERE work_id = w.id ORDER BY id DESC LIMIT 1
  )
  LEFT JOIN contractors cont ON cont.id = (
    SELECT id FROM contractors WHERE work_id = w.id ORDER BY id DESC LIMIT 1
  )
  WHERE w.financial_year = ?;
`;

/**
 * Budget summary filtered by financial year (e.g. '2025-26').
 * @param {{ useTotalAmountPaid?: boolean }} [options]
 *   When true (Reports budget card), "used" sums Payment Status Total Amount Paid
 *   per work via getPaymentSummaryForWork. Default false keeps payment-installment sum.
 */
export const getReportsBudgetSummary = (financialYear, options = {}) => {
  const { useTotalAmountPaid = false } = options;
  const fy = financialYear == null ? '' : String(financialYear).trim();
  if (!fy) {
    return emptyBudgetSummary();
  }

  const db = getDB();
  const rows = db.getAllSync(WORK_BUDGET_ROWS_SQL, [fy]);

  let totalBudget = 0;
  let budgetUsed = 0;

  rows.forEach((row) => {
    totalBudget += getEffectiveBudgetForRow(row);
    if (useTotalAmountPaid) {
      budgetUsed += getPaymentSummaryForWork(row.work_id).amountPaid;
    } else {
      budgetUsed += toPositiveAmount(row.amount_paid) ?? 0;
    }
  });

  const remaining = Math.max(0, totalBudget - budgetUsed);
  const percent =
    totalBudget > 0
      ? Math.min(100, Math.round((budgetUsed / totalBudget) * 100))
      : 0;

  const usedCompact = formatRupeesCompact(budgetUsed);
  const totalCompact = formatRupeesCompact(totalBudget);
  const remainingCompact = formatRupeesCompact(remaining);

  return {
    financialYear: fy,
    workCount: rows.length,
    totalBudget,
    budgetUsed,
    remaining,
    percent,
    usedCompact,
    totalCompact,
    remainingCompact,
    bannerText: `${usedCompact} of ${totalCompact} total budget used (${percent}%).`,
    barPrimaryLabel: `${usedCompact} of ${totalCompact}`,
    barRemainingLabel: `${remainingCompact} remaining`,
    totalBudgetDetail: `→ ${formatRupeesLakhsDetail(totalBudget)}`,
    totalUsedDetail: `→ ${formatRupeesLakhsDetail(budgetUsed)} (${percent}%)`,
  };
};

const formatRupeesLakhsDetail = (amount) => {
  const n = Number(amount) || 0;
  if (n === 0) return '₹0';
  const lakhs = n / 1_00_000;
  const value =
    lakhs >= 100
      ? lakhs.toFixed(0)
      : lakhs % 1 === 0
        ? lakhs.toFixed(0)
        : lakhs.toFixed(1);
  return `₹${value} Lakhs`;
};

export const emptyBudgetSummary = () => ({
  financialYear: '',
  workCount: 0,
  totalBudget: 0,
  budgetUsed: 0,
  remaining: 0,
  percent: 0,
  usedCompact: '₹0',
  totalCompact: '₹0',
  remainingCompact: '₹0',
  bannerText: '₹0 of ₹0 total budget used (0%).',
  barPrimaryLabel: '₹0 of ₹0',
  barRemainingLabel: '₹0 remaining',
  totalBudgetDetail: '→ ₹0',
  totalUsedDetail: '→ ₹0 (0%)',
});
