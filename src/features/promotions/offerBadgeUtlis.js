/**
 * Offer badge helpers for product cards and PDP.
 */

export function getProductOfferBadge(
  product,
) {

  return product?.offer_badge ?? null;
}


export function getProductOfferLabel(
  product,
) {

  return getProductOfferBadge(
    product,
  )?.label ?? null;
}
