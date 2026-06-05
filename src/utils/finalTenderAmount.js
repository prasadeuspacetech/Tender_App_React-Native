// Final Tender Amount = Tender Amount ± (Tender Amount × Percentage / 100)

const VALID_DIRECTIONS = new Set(['above', 'below']);

export const parseNumericAmount = (value) => {
  if (value == null || String(value).trim() === '') return null;
  const n = parseFloat(String(value).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : null;
};

const normalizeDirection = (value) => {
  const v = String(value ?? '').trim().toLowerCase();
  return VALID_DIRECTIONS.has(v) ? v : 'above';
};

/**
 * @param {number|string|null} tenderAmount — base from Tender Creation
 * @param {'above'|'below'|string} direction — Above / Below estimate
 * @param {number|string|null} percentageVariation — e.g. 10 for 10%
 * @returns {number|null}
 */
export const computeFinalTenderAmount = (
  tenderAmount,
  direction = 'above',
  percentageVariation = 0,
) => {
  const base = parseNumericAmount(tenderAmount);
  if (base == null || base <= 0) return null;

  const pct = parseNumericAmount(percentageVariation) ?? 0;
  const adjustment = (base * pct) / 100;
  const dir = normalizeDirection(direction);

  const result = dir === 'below' ? base - adjustment : base + adjustment;
  return Number.isFinite(result) ? result : null;
};
