import {
  Heart,
} from "lucide-react";

import {
  formatMoney,
} from "../../../utils/currency.js";

import StarRating from "../../catalog/reviews/components/StarRating.jsx";

import OfferBadge from "../../promotions/components/OfferBadge.jsx";

export default function ProductDetailBuyBox(
  {
    product,
    selectedVariant,
    displayPrice,
    stockLabel,
    isOutOfStock,
    selectedVariantId,
    onSelectVariant,
    qty,
    onQtyChange,
    variantIsWishlisted,
    onAddToCart,
    onWishlistToggle,
  },
) {

  const pdpBadges = [];

  if ((product.brand || "").trim()) {

    pdpBadges.push({
      key: "brand",
      label: String(product.brand).trim(),
    });
  }

  (product.room_types || [])
    .slice(
      0,
      2,
    )
    .forEach(
      (rt) => {

        pdpBadges.push({
          key: `room-${rt.id}`,
          label: rt.name,
        });
      }
    );

  if (
    product.is_featured &&
    pdpBadges.length < 3
  ) {

    pdpBadges.push({
      key: "featured",
      label: "Featured",
    });
  }

  return (

    <div>

      {
        pdpBadges.length > 0 && (

          <div
            className="pd-user-pdp-badges"
            aria-label="Product highlights"
          >

            {
              pdpBadges.map(
                (b) => (

                  <span
                    key={b.key}
                    className="pd-user-pdp-badge"
                  >
                    {b.label}
                  </span>
                )
              )
            }
          </div>
        )
      }

      <h1 className="pd-user-title artisan-font-serif pd-user-pdp-title">
        {product.name}
      </h1>

      {
        (product.review_count || 0) > 0 && (

          <div className="pd-rating fc-reviews-summary">

            <StarRating
              value={product.average_rating}
              size={16}
            />

            <span>
              {product.average_rating}
              {" "}
              ·
              {" "}
              {product.review_count}
              {" "}
              review
              {product.review_count === 1
                ? ""
                : "s"}
            </span>
          </div>
        )
      }

      {
        displayPrice !== null && (

          <div className="pd-user-pdp-price-row">

            <p className="pd-user-price artisan-font-serif pd-user-pdp-price">
              ₹
              {formatMoney(displayPrice)}
            </p>

            <OfferBadge
              product={product}
              className="fc-offer-badge--inline"
            />
          </div>
        )
      }

      {
        product.description && (

          <p className="pd-user-desc pd-user-pdp-desc">
            {product.description}
          </p>
        )
      }

      {
        stockLabel && (

          <p className="pd-user-pdp-stock">

            <span
              className={
                isOutOfStock

                  ? "is-out"

                  : ""
              }
            >
              {stockLabel.replace(
                /_/g,
                " "
              )}
            </span>
          </p>
        )
      }

      <section
        className="pd-user-pdp-options"
        aria-label="Product variants"
      >

        <p className="pd-user-pdp-field-label">
          Select variant
        </p>

        <div className="pd-user-variant-pills">

          {
            product.variants?.map(
              (v) => {

                const variantSoldOut =
                  !v.is_active ||
                  (v.stock || 0) < 1;

                const isSelected =
                  v.id ===
                  selectedVariantId;

                return (

                  <button
                    key={v.id}
                    type="button"
                    className={
                      [

                        "pd-user-variant-pill",

                        isSelected
                          ? "is-selected"
                          : "",

                        variantSoldOut
                          ? "is-soldout"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")
                    }
                    onClick={() => {

                      onSelectVariant(
                        v.id,
                      );
                    }}
                  >

                    <span className="pd-user-variant-pill-name">
                      {v.variant_name}
                    </span>

                    <span className="pd-user-variant-pill-meta">
                      ₹
                      {formatMoney(v.price)}

                      {variantSoldOut && (
                        <>
                          {" "}
                          · Sold out
                        </>
                      )}
                    </span>
                  </button>
                );
              }
            )
          }
        </div>
      </section>

      {
        isOutOfStock && (

          <div
            className="artisan-banner error pd-user-pdp-banner"
            role="status"
          >
            This option is sold out or unavailable.
          </div>
        )
      }

      <div className="pd-user-qty-row pd-user-pdp-qty">

        <label className="pd-user-qty">

          <span>
            Quantity
          </span>

          <input
            type="number"
            min={1}
            max={
              selectedVariant?.stock || 1
            }
            value={qty}
            disabled={isOutOfStock}
            onChange={onQtyChange}
          />
        </label>
      </div>

      <div className="pd-user-actions pd-user-pdp-actions">

        <button
          type="button"
          className="pd-user-btn-cart"
          disabled={isOutOfStock}
          onClick={onAddToCart}
        >
          Add to Cart
        </button>

        <button
          type="button"
          className={
            variantIsWishlisted
              ? "pd-user-btn-wish is-wishlisted"
              : "pd-user-btn-wish"
          }
          aria-label={
            variantIsWishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          onClick={onWishlistToggle}
        >

          <Heart
            size={18}
            fill={
              variantIsWishlisted
                ? "currentColor"
                : "none"
            }
            strokeWidth={
              variantIsWishlisted
                ? 1.5
                : 2
            }
          />
        </button>
      </div>
    </div>
  );
}
