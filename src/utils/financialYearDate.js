import { parseStoredDate } from './dateFormat';

/**
 * Indian financial year bounds from label "2025-26" → 1 Apr 2025 – 31 Mar 2026.
 * @returns {{ start: Date, end: Date } | null}
 */
export const parseFinancialYearBounds = (financialYear) => {
  const match = String(financialYear ?? '').trim().match(/^(\d{4})-(\d{2})$/);
  if (!match) return null;

  const startYear = Number(match[1]);
  const endSuffix = Number(match[2]);
  const century = Math.floor(startYear / 100) * 100;
  const endYear = century + endSuffix;
  if (!Number.isFinite(startYear) || endYear !== startYear + 1) return null;

  return {
    start: new Date(startYear, 3, 1),
    end: new Date(endYear, 2, 31, 23, 59, 59, 999),
  };
};

/** True when a stored date (DD/MM/YYYY) falls inside the FY window. */
export const isDateInFinancialYear = (dateValue, financialYear) => {
  const bounds = parseFinancialYearBounds(financialYear);
  if (!bounds) return false;

  const date = parseStoredDate(dateValue);
  if (!date) return false;

  return date >= bounds.start && date <= bounds.end;
};

/** Filter correspondence / dated records to a financial year. Rows without dates are excluded. */
export const filterRecordsByFinancialYear = (records, financialYear, dateKey = 'date') => {
  const fy = String(financialYear ?? '').trim();
  if (!fy) return [];

  return (records ?? []).filter((row) =>
    isDateInFinancialYear(row?.[dateKey], fy),
  );
};
