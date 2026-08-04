/**
 * @param {{ images?: Array<{ is_primary?: boolean; image_url?: string; image?: string }> } | null | undefined} variant
 * @returns {string | null}
 */
export function lineImageUrl(variant) {
  if (!variant) {
    return null;
  }

  const imgs = variant.images || [];

  const primary = imgs.find((i) => i.is_primary);

  const pick = primary || imgs[0];

  if (!pick) {
    return null;
  }

  return pick.image_url || pick.image || null;
}

/**
 * @param {string | number | null | undefined} gstRateStr
 * @returns {number | null}
 */
export function gstPercentLabel(gstRateStr) {
  const n = Number(gstRateStr);

  if (Number.isNaN(n) || n <= 0) {
    return null;
  }

  return Math.round(n * 100);
}
