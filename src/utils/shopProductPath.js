/**
 * Builds `/shop/product/...` for PDP links. Prefers slug; falls back to id when slug is absent.
 *
 * @param {null|undefined|{ slug?: string; id?: number|string; product_slug?: string; product_id?: number|string }} ref
 * @returns {string|null}
 */
export function shopProductPathFrom(
  ref,
) {

  if (
    !ref ||
    typeof ref !==
      "object"
  ) {

    return null;
  }

  const slug =
    String(
      ref.slug ??
        ref.product_slug ??
        "",
    ).trim();

  if (slug) {

    return `/shop/product/${encodeURIComponent(
      slug,
    )}`;
  }

  const id =
    ref.id ??
    ref.product_id;

  if (
    id != null &&
    id !==
      ""
  ) {

    return `/shop/product/${encodeURIComponent(
      String(
        id,
      ),
    )}`;
  }

  return null;
}
