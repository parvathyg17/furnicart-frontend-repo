/**
 * Format a numeric amount for display (default: 2 decimal places).
 *
 * @param {unknown} value
 * @param {{ minFractionDigits?: number; maxFractionDigits?: number }} [options]
 * @returns {string}
 */
export function formatMoney(value, options = {}) {
  const { minFractionDigits = 2, maxFractionDigits = 2 } = options;

  if (value === null || value === undefined) {
    return "—";
  }

  const n = Number(value);

  if (Number.isNaN(n)) {
    return "—";
  }

  return n.toLocaleString(undefined, {
    minimumFractionDigits: minFractionDigits,
    maximumFractionDigits: maxFractionDigits,
  });
}
