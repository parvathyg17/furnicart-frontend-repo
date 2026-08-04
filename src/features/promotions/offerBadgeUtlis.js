/**
 * Offer badge and discounted price helpers for product cards and PDP.
 */

export function getProductOfferBadge(product) {
  return product?.offer_badge ?? null;
}

export function getProductOfferLabel(product) {
  return getProductOfferBadge(product)?.label ?? null;
}

function parseMoney(value) {
  const n = Number(value);

  return Number.isNaN(n) ? null : n;
}

function saleFromBadge(original, badge) {
  if (!badge || original == null) {
    return original;
  }

  const discountValue = parseMoney(badge.discount_value);

  if (discountValue == null) {
    return original;
  }

  let discount = 0;

  if (badge.discount_type === "percent") {
    discount = (original * discountValue) / 100;
  } else {
    discount = Math.min(discountValue, original);
  }

  return Math.max(0, original - discount);
}

/**
 * @returns {{
 *   original: number | null;
 *   sale: number | null;
 *   hasDiscount: boolean;
 * }}
 */
export function resolveVariantPrices(variant, product) {
  const original = parseMoney(variant?.price);

  if (original == null) {
    return {
      original: null,
      sale: null,
      hasDiscount: false,
    };
  }

  let sale = parseMoney(variant?.discounted_price);

  if (sale == null) {
    sale = saleFromBadge(original, product?.offer_badge);
  }

  if (sale == null) {
    sale = original;
  }

  const hasDiscount = sale < original - 0.009;

  return {
    original,
    sale: hasDiscount ? sale : original,
    hasDiscount,
  };
}

export function lowestSalePriceForProduct(product) {
  const variants = (product?.variants || []).filter((v) => v.is_active);

  if (!variants.length) {
    return resolveVariantPrices(null, product);
  }

  let best = null;

  variants.forEach((variant) => {
    const prices = resolveVariantPrices(variant, product);

    if (prices.sale == null) {
      return;
    }

    if (!best || prices.sale < best.sale) {
      best = prices;
    }
  });

  return (
    best || {
      original: null,
      sale: null,
      hasDiscount: false,
    }
  );
}
