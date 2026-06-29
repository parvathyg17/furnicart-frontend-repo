export const ZOOM_SCALE_MIN = 1;

export const ZOOM_SCALE_MAX = 4;

export function clampPanForScale(
  scale,
  panX,
  panY,
  viewW,
  viewH,
) {

  if (
    scale <= ZOOM_SCALE_MIN ||
    !viewW ||
    !viewH
  ) {

    return {
      panX: 0,
      panY: 0,
    };
  }

  const marginX =
    ((scale - ZOOM_SCALE_MIN) * viewW) / 2;

  const marginY =
    ((scale - ZOOM_SCALE_MIN) * viewH) / 2;

  return {
    panX: Math.max(
      -marginX,
      Math.min(
        marginX,
        panX,
      ),
    ),
    panY: Math.max(
      -marginY,
      Math.min(
        marginY,
        panY,
      ),
    ),
  };
}

export function isProductCardSoldOut(p) {

  const variants =
    p?.variants || [];

  if (!variants.length) {

    return (
      p?.stock_status ===
      "out_of_stock"
    );
  }

  return !variants.some(
    (v) =>
      v.is_active &&
      (v.stock || 0) > 0
  );
}

export function relatedDisplayVariant(
  product,
) {

  const list =
    product?.variants?.filter(
      (v) =>
        v.is_active,
    ) || [];

  const inStock =
    list.find(
      (v) =>
        (v.stock || 0) > 0,
    );

  return (
    inStock ||
    list[0] ||
    product?.variants?.[0] ||
    null
  );
}

export function relatedDisplayPrice(
  product,
) {

  const v =
    relatedDisplayVariant(
      product,
    );

  if (
    !v
  ) {

    return null;
  }

  return Number(
    v.price,
  );
}
