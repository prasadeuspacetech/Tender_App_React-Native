/** Full INR display with grouping (e.g. ₹50,00,000). */
export const formatRupeesFull = (amount) => {
  const n = Number(amount) || 0;
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

/** Compact INR display for dashboard/reports (Lakhs / Crore). */
export const formatRupeesCompact = (amount) => {
  const n = Number(amount) || 0;
  if (n === 0) return '₹0';
  if (n >= 1_00_00_000) {
    const cr = n / 1_00_00_000;
    return `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2)}Cr`;
  }
  if (n >= 1_00_000) {
    const lakhs = n / 1_00_000;
    return `₹${lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(1)}L`;
  }
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

/** Label with "Lakhs" suffix for detail rows (e.g. → ₹160 Lakhs). */
export const formatRupeesLakhsLabel = (amount) => {
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
