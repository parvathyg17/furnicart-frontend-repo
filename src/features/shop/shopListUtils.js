export function firstListableVariant(product) {

  const list =
    product?.variants?.filter(
      (v) =>
        v.is_active
    ) || [];

  const inStock =
    list.find(
      (v) =>
        (v.stock || 0) > 0
    );

  return (
    inStock ||
    list[0] ||
    null
  );
}

export function displayPrice(product) {

  const v =
    firstListableVariant(product);

  if (
    !v &&
    product?.variants?.length
  ) {

    const prices =
      product.variants.map(
        (x) =>
          Number(x.price)
      );

    const min =
      Math.min(...prices);

    return min;
  }

  if (v)
    return Number(v.price);

  return null;
}

/**
 * @param {{ totalPages: number; currentPage: number }} pagination
 * @returns {number[]}
 */
export function buildShopPageNumbers(
  pagination,
) {

  const total =
    pagination.totalPages;

  const cur =
    pagination.currentPage;

  if (total <= 7) {

    return Array.from(
      { length: total },
      (_, i) =>
        i + 1
    );
  }

  const pages =
    new Set([
      1,
      total,
      cur,
      cur - 1,
      cur + 1,
    ]);

  return Array.from(pages)
    .filter(
      (n) =>
        n >= 1 && n <= total
    )
    .sort(
      (a, b) =>
        a - b
    );
}
