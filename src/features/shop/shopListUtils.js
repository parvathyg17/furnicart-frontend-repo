export function wishlistedVariantForProduct(product, wishlistedVariantIds) {
  const saved = new Set((wishlistedVariantIds || []).map((id) => Number(id)));

  return product?.variants?.find((v) => saved.has(Number(v.id))) || null;
}

export function productIsWishlisted(product, wishlistedVariantIds) {
  return Boolean(wishlistedVariantForProduct(product, wishlistedVariantIds));
}

export function listableVariants(product) {
  const active = product?.variants?.filter((v) => v.is_active) || [];

  const inStock = active.filter((v) => (v.stock || 0) > 0);

  return inStock.length > 0 ? inStock : active;
}

function getFinalPrice(variant) {
  if (!variant) return 0;
  if (variant.discounted_price != null) {
    const sale = Number(variant.discounted_price);
    if (!Number.isNaN(sale)) return sale;
  }
  return Number(variant.price);
}

function cheapestVariant(variants) {
  if (!variants?.length) {
    return null;
  }

  return variants.reduce(
    (best, variant) => {
      if (!best) {
        return variant;
      }

      return getFinalPrice(variant) < getFinalPrice(best) ? variant : best;
    },

    null,
  );
}

function mostExpensiveVariant(variants) {
  if (!variants?.length) {
    return null;
  }

  return variants.reduce(
    (best, variant) => {
      if (!best) {
        return variant;
      }

      return getFinalPrice(variant) > getFinalPrice(best) ? variant : best;
    },

    null,
  );
}

function parseFilterPrice(value) {
  if (value === "" || value == null) {
    return null;
  }

  const n = Number(value);

  return Number.isNaN(n) ? null : n;
}

function variantsInPriceRange(variants, minPrice, maxPrice) {
  const min = parseFilterPrice(minPrice);

  const max = parseFilterPrice(maxPrice);

  if (min === null && max === null) {
    return variants;
  }

  return variants.filter((variant) => {
    const price = getFinalPrice(variant);

    if (min !== null && price < min) {
      return false;
    }

    if (max !== null && price > max) {
      return false;
    }

    return true;
  });
}

export function variantImageUrl(variant) {
  if (!variant) {
    return null;
  }

  const imgs = variant.images || [];

  const primary = imgs.find((img) => img.is_primary);

  const pick = primary || imgs[0];

  if (!pick) {
    return null;
  }

  return pick.image_url || pick.image || null;
}

export function variantDisplayLabel(variant) {
  if (!variant) {
    return "";
  }

  const parts = [variant.variant_name, variant.color, variant.size].filter(
    Boolean,
  );

  return parts.join(" · ");
}

export function catalogVariantForSort(product, sort = "latest", options = {}) {
  let list = listableVariants(product);

  if (options && (options.minPrice || options.maxPrice)) {
    list = variantsInPriceRange(list, options.minPrice, options.maxPrice);
  }

  if (!list.length) {
    return null;
  }

  if (sort === "price_high") {
    return mostExpensiveVariant(list);
  }

  return cheapestVariant(list);
}

export function firstListableVariant(product, sort = "latest", options = {}) {
  return catalogVariantForSort(product, sort, options);
}

export function displayPrice(product, sort = "latest", options = {}) {
  const variant = catalogVariantForSort(product, sort, options);

  if (!variant) {
    return null;
  }

  return Number(variant.price);
}

/**
 * @param {{ totalPages: number; currentPage: number }} pagination
 * @returns {number[]}
 */
export function buildShopPageNumbers(pagination) {
  const total = pagination.totalPages;

  const cur = pagination.currentPage;

  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set([1, total, cur, cur - 1, cur + 1]);

  return Array.from(pages)
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);
}
