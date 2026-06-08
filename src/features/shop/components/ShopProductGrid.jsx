import {
  Heart,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  formatMoney,
} from "../../../utils/currency.js";

import Pagination from "../../../components/common/Pagination.jsx";

import EmptyState from "../../../components/common/EmptyState.jsx";

import {
  displayPrice,
  firstListableVariant,
} from "../shopListUtils.js";

import {
  shopProductPathFrom,
} from "../../../utils/shopProductPath.js";

export default function ShopProductGrid(
  {
    loading,
    products,
    pagination,
    pageNumbers,
    onPageChange,
    onAddToCart,
    onWishlist,
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

              const price =
                displayPrice(p);

              const roomTag =
                p.room_types?.[0]
                  ?.name;

              const catTag =
                p.category_name ||
                "Furniture";

              const variant =
                firstListableVariant(
                  p,
                );

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

                    {
                      p.thumbnail ? (

                        <img
                          src={p.thumbnail}
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
                      price !== null && (

                        <p className="artisan-card-price">
                          ₹
                          {formatMoney(
                            price,
                            {
                              minFractionDigits: 0,
                              maxFractionDigits: 2,
                            },
                          )}
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
                        className="artisan-btn-wish"
                        aria-label="Add to wishlist"
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
