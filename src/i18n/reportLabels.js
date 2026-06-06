// Translates report budget summary display strings (amounts stay as computed).

import i18n from './index';

/** @param {ReturnType<import('../db/repositories/reportsRepository').emptyBudgetSummary>} summary */
export const translateBudgetSummary = (summary) => ({
  ...summary,
  bannerText: i18n.t('reports:budget.banner', {
    used: summary?.usedCompact ?? '₹0',
    total: summary?.totalCompact ?? '₹0',
    percent: summary?.percent ?? 0,
  }),
  barPrimaryLabel: i18n.t('reports:budget.barPrimary', {
    used: summary?.usedCompact ?? '₹0',
    total: summary?.totalCompact ?? '₹0',
  }),
  barRemainingLabel: i18n.t('reports:budget.barRemaining', {
    remaining: summary?.remainingCompact ?? '₹0',
  }),
});
