import {
  Heart,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import OfferBadge, {
  ProductPriceDisplay,
} from "../../promotions/components/OfferBadge.jsx";

import Pagination from "../../../components/common/Pagination.jsx";

import EmptyState from "../../../components/common/EmptyState.jsx";

import {
  catalogVariantForSort,
  productIsWishlisted,
  variantDisplayLabel,
  variantImageUrl,
} from "../shopListUtils.js";

import {
  shopProductPathFrom,
} from "../../../utils/shopProductPath.js";

import StarRating from "../../catalog/reviews/components/StarRating.jsx";

export default function ShopProductGrid(
  {
    loading,
    products,
    pagination,
    pageNumbers,
    sort = "latest",
    minPrice = "",
    maxPrice = "",
    onPageChange,
    onAddToCart,
    onWishlist,
    wishlistedVariantIds = [],
  },
) {

  if (loading) {

    return (

      <p className="artisan-muted">
        Loading pieces…
      </p>
    );
  }

  if (products.length === 0) {

    return (

      <EmptyState
        description="No products match your filters."
        className="artisan-muted"
      />
    );
  }

  return (

    <>

      <div className="artisan-grid">

        {
          products.map(
            (p) => {

              const variantOptions =
                {
                  minPrice,
                  maxPrice,
                };

              const variant =
                catalogVariantForSort(
                  p,
                  sort,
                  variantOptions,
                );

              const variantLabel =
                variantDisplayLabel(
                  variant,
                );

              const cardImage =
                variantImageUrl(
                  variant,
                ) ||
                p.thumbnail;

              const roomTag =
                p.room_types?.[0]
                  ?.name;

              const catTag =
                p.category_name ||
                "Furniture";

              const canBuy =
                variant &&
                (variant.stock || 0) > 0;

              const showSoldOut =
                (p.variants?.length || 0) >
                  0 &&
                (!canBuy ||
                  p.stock_status ===
                    "out_of_stock");

              const productPath =
                shopProductPathFrom(
                  p,
                );

              const isWishlisted =
                productIsWishlisted(
                  p,
                  wishlistedVariantIds,
                );

              return (

                <article
                  key={p.id}
                  className="artisan-card"
                >

                  <Link
                    className="artisan-card-media"
                    to={
                      productPath ||
                      "/shop"
                    }
                  >

                    {
                      showSoldOut && (

                        <span className="fc-sold-out-badge">
                          Sold out
                        </span>
                      )
                    }

                    <OfferBadge
                      product={p}
                    />

                    {
                      cardImage ? (

                        <img
                          src={cardImage}
                          alt=""
                        />
                      ) : (

                        <div className="artisan-card-ph">
                          No image
                        </div>
                      )
                    }
                  </Link>

                  <div className="artisan-card-body">

                    <div className="artisan-card-tags">

                      <span className="artisan-tag sage">
                        {(catTag || "").toUpperCase()}
                      </span>

                      {
                        roomTag && (

                          <span className="artisan-tag outline">
                            {roomTag.toUpperCase()}
                          </span>
                        )
                      }
                    </div>

                    <Link
                      className="artisan-card-title artisan-font-serif"
                      to={
                        productPath ||
                        "/shop"
                      }
                    >
                      {p.name}
                    </Link>

                    {
                      (p.review_count || 0) > 0 && (

                        <div className="fc-shop-card-rating">

                          <StarRating
                            value={p.average_rating}
                            size={13}
                          />

                          <span>
                            (
                            {p.review_count}
                            )
                          </span>
                        </div>
                      )
                    }

                    <ProductPriceDisplay
                      variant={variant}
                      product={p}
                      className="artisan-card-price"
                      priceClassName="artisan-card-price-value"
                    />

                    {
                      variantLabel && (

                        <p className="artisan-card-variant">
                          {variantLabel}
                        </p>
                      )
                    }

                    <div className="artisan-card-actions">

                      <button
                        type="button"
                        className="artisan-btn-cart"
                        disabled={!canBuy}
                        onClick={(e) => {

                          onAddToCart(
                            e,
                            p,
                          );
                        }}
                      >
                        ADD TO CART
                      </button>

                      <button
                        type="button"
                        className={
                          isWishlisted
                            ? "artisan-btn-wish is-wishlisted"
                            : "artisan-btn-wish"
                        }
                        aria-label={
                          isWishlisted
                            ? "Remove from wishlist"
                            : "Add to wishlist"
                        }
                        aria-pressed={
                          isWishlisted
                        }
                        onClick={(e) => {

                          onWishlist(
                            e,
                            p,
                          );
                        }}
                      >

                        <Heart size={18} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            },
          )
        }
      </div>

      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        pageNumbers={pageNumbers}
        hasPrevious={Boolean(pagination.previous)}
        hasNext={Boolean(pagination.next)}
        onPageChange={onPageChange}
      />
    </>
  );
}
