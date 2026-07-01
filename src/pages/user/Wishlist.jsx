import "../../styles/home.css";
import "../../styles/shop.css";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import Pagination from "../../components/common/Pagination.jsx";

import {
  buildShopPageNumbers,
} from "../../features/shop/shopListUtils.js";

import {
  fetchWishlist,
  toggleWishlistApi,
} from "../../features/wishlist/wishlistAPI.js";

import {
  addToCartApi,
} from "../../features/cart/cartAPI";

import {
  setCartItemCount,
} from "../../features/cart/cartSlice";

import {
  lineImageUrl,
} from "../../features/checkout/checkoutUtils.js";

import {
  ProductPriceDisplay,
} from "../../features/promotions/components/OfferBadge.jsx";

import {
  useBackgroundServerSync,
} from "../../hooks/useBackgroundServerSync.js";

import PublicNavbar from "../../components/common/PublicNavbar.jsx";

import {
  formatProductApiError,
} from "../../utils/productApiErrors.js";

import {
  shopProductPathFrom,
} from "../../utils/shopProductPath.js";

import {
  stableStringify,
} from "../../utils/stableStringify.js";

function wishlistVariantCanAddToBag(
  variant,
) {

  if (
    !variant ||
    !variant.is_active
  ) {

    return false;
  }

  return (
    (Number(variant.stock) || 0) >= 1
  );
}

function wishlistVariantSubtitle(
  variant,
) {

  if (
    !variant
  ) {

    return "";
  }

  const parts =
    [
      variant.material,
      variant.color,
      variant.size,
    ]
      .map(
        (s) =>
          (s || "").trim(),
      )
      .filter(Boolean);

  if (
    parts.length
  ) {

    return parts.join(" / ");
  }

  return (
    variant.variant_name || ""
  ).trim();
}

const PAGE_SIZE = 5;

export default function Wishlist() {

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    checkingAuth,
  } = useSelector(
    (state) => state.auth,
  );

  const [
    items,
    setItems,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState(null);

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    pagination,
    setPagination,
  ] = useState({

    count: 0,

    totalPages: 1,

    currentPage: 1,

    next: null,

    previous: null,
  });

  const lastWishlistSigRef =
    useRef(null);

  const pageRef = useRef(page);

  pageRef.current = page;

  const load = useCallback(
    async (
      {
        silent = false,
        pageNum = pageRef.current,
      } = {},
    ) => {

      if (
        !silent
      ) {

        setLoading(true);
        setError(null);
      }

      try {

        const res =
          await fetchWishlist(
            {
              page: pageNum,
              pageSize: PAGE_SIZE,
            },
          );

        const rows =
          res.results || [];

        const nextPagination =
          {

            count:
              res.count ?? 0,

            totalPages:
              res.total_pages || 1,

            currentPage:
              res.current_page || pageNum,

            next:
              res.next,

            previous:
              res.previous,
          };

        const snap =
          stableStringify(
            {
              results: rows,
              pagination: nextPagination,
            },
          );

        if (
          silent &&
          lastWishlistSigRef.current === snap
        ) {

          return;
        }

        lastWishlistSigRef.current =
          snap;

        setItems(rows);
        setPagination(
          nextPagination,
        );
      } catch (err) {

        if (
          err.response?.status === 401
        ) {

          navigate("/login");
          return;
        }

        if (
          !silent
        ) {

          setError(
            formatProductApiError(
              err.response?.data,
            ) ||
              "Could not load wishlist.",
          );
        }
      } finally {

        if (
          !silent
        ) {

          setLoading(false);
        }
      }
    },

    [navigate],
  );

  useEffect(
    () => {

      load(
        {
          pageNum: page,
        },
      );
    },

    [page, load],
  );

  useBackgroundServerSync(
    {
      enabled: true,
      pollIntervalMs: 90_000,
      onRefresh: () =>
        load(
          {
            silent: true,
            pageNum: pageRef.current,
          },
        ),
    },
  );

  const reloadAfterChange = async () => {

    const nextPage =
      items.length === 1 &&
      page > 1
        ? page - 1
        : page;

    if (
      nextPage !== page
    ) {

      setPage(nextPage);
      return;
    }

    await load(
      {
        pageNum: page,
      },
    );
  };

  const remove = async (
    variantId,
  ) => {

    try {

      await toggleWishlistApi(
        variantId,
      );

      await reloadAfterChange();
    } catch (err) {

      setError(
        formatProductApiError(
          err.response?.data,
        ) ||
          "Could not update wishlist.",
      );
    }
  };

  const moveToCart = async (
    variantId,
  ) => {

    setError(null);

    try {

      const res =
        await addToCartApi({
          variantId,
          quantity: 1,
        });

      dispatch(
        setCartItemCount(
          res.item_count,
        ),
      );

      await toggleWishlistApi(
        variantId,
      );

      await reloadAfterChange();
    } catch (err) {

      setError(
        formatProductApiError(
          err.response?.data,
        ) ||
          "Could not add to cart.",
      );
    }
  };

  
  

  const pageNumbers =
    buildShopPageNumbers(
      {
        totalPages: pagination.totalPages,
        currentPage: pagination.currentPage,
      },
    );

  if (
    checkingAuth
  ) {

    return (

      <div className="home-loading">
        Loading...
      </div>
    );
  }

  const count =
    pagination.count;

  const countLabel =
    count === 1
      ? "1 item"
      : `${count} items`;

  return (

    <div className="home-page wishlist-page">

      <PublicNavbar />

      <main className="wishlist-main">

        <nav
          className="wishlist-bc"
          aria-label="Breadcrumb"
        >

          <Link to="/">
            Home
          </Link>

          <span
            className="wishlist-bc-sep"
            aria-hidden="true"
          >
            ›
          </span>

          <Link to="/profile">
            My Account
          </Link>

          <span
            className="wishlist-bc-sep"
            aria-hidden="true"
          >
            ›
          </span>

          <span
            className="wishlist-bc-current"
            aria-current="page"
          >
            Wishlist
          </span>
        </nav>

        <h1 className="wishlist-title">
          My Wishlist
        </h1>

        {
          !loading && (

            <p className="wishlist-lead">
              {
                count === 0
                  ? "Save pieces you love — they will appear here."
                  : `You have ${countLabel} curated for your home.`
              }
            </p>
          )
        }

        {
          error && (

            <div
              className="shop-banner error wishlist-banner"
              role="alert"
            >
              {error}
            </div>
          )
        }

        {
          loading ? (

            <p className="wishlist-muted">
              Loading…
            </p>
          ) : count === 0 ? (

            <div className="wishlist-empty">

              <p className="wishlist-muted">
                Your wishlist is empty.
              </p>

              <Link
                className="wishlist-empty-cta"
                to="/shop"
              >
                Browse shop
              </Link>
            </div>
          ) : (

            <>

            <ul className="wishlist-grid">

              {
                items.map(
                  (row) => {

                    const variant =
                      row.variant;

                    const product =
                      variant?.product;

                    const imgUrl =
                      lineImageUrl(
                        variant,
                      );

                    const subtitle =
                      wishlistVariantSubtitle(
                        variant,
                      );

                    const productPath =
                      shopProductPathFrom(
                        product,
                      );

                    const canMoveToBag =
                      wishlistVariantCanAddToBag(
                        variant,
                      );

                    return (

                      <li
                        key={row.id}
                        className="wishlist-card"
                      >

                        <Link
                          className="wishlist-card-media"
                          to={
                            productPath ||
                            "/shop"
                          }
                        >

                          {
                            imgUrl ? (

                              <img
                                src={imgUrl}
                                alt=""
                              />
                            ) : (

                              <div
                                className="wishlist-card-ph"
                                aria-hidden="true"
                              />
                            )
                          }

                          {
                            !canMoveToBag && (

                              <span
                                className="wishlist-card-media-badge"
                                role="status"
                              >
                                {
                                  variant?.is_active === false
                                    ? "Unavailable"
                                    : "Out of stock"
                                }
                              </span>
                            )
                          }
                        </Link>

                        <div className="wishlist-card-body">

                          <Link
                            className="wishlist-card-title-link"
                            to={
                              productPath ||
                              "/shop"
                            }
                          >

                            <h2 className="wishlist-card-title">
                              {
                                product?.name ||
                                "Product"
                              }
                            </h2>
                          </Link>

                          {
                            subtitle && (

                              <p className="wishlist-card-meta">
                                {subtitle}
                              </p>
                            )
                          }

                          <ProductPriceDisplay
                            variant={variant}
                            product={product}
                            className="wishlist-card-price"
                          />

                          {
                            !canMoveToBag && (

                              <p
                                className="wishlist-card-stock-note"
                                role="status"
                              >
                                {
                                  variant?.is_active === false
                                    ? (
                                      "This option is no longer available. "
                                      + "Remove it or pick another variant on the product page."
                                    )
                                    : (
                                      "This item is out of stock. "
                                      + "You can keep it here and try again later."
                                    )
                                }
                              </p>
                            )
                          }

                          <button
                            type="button"
                            className="wishlist-move-btn"
                            disabled={!canMoveToBag}
                            aria-label={
                              canMoveToBag
                                ? "Move to bag"
                                : (
                                  variant?.is_active === false
                                    ? "Unavailable — cannot add to bag"
                                    : "Out of stock — cannot add to bag"
                                )
                            }
                            onClick={() =>
                              moveToCart(
                                variant.id,
                              )
                            }
                          >
                            Move to bag
                          </button>

                          <button
                            type="button"
                            className="wishlist-remove-link"
                            onClick={() =>
                              remove(
                                variant.id,
                              )
                            }
                          >
                            Remove from wishlist
                          </button>
                        </div>
                      </li>
                    );
                  },
                )
              }
            </ul>

            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              pageNumbers={pageNumbers}
              hasPrevious={Boolean(pagination.previous)}
              hasNext={Boolean(pagination.next)}
              onPageChange={setPage}
              className="artisan-pagination wishlist-pagination"
            />
          </>
          )
        }
      </main>
      

      <footer className="home-footer">

        <div className="home-footer-inner">

          <div className="footer-logo">
            FURNICART
          </div>

          <div className="footer-links">

            <Link to="/">
              Privacy Policy
            </Link>

            <Link to="/">
              Terms of Service
            </Link>

            <Link to="/">
              Shipping Information
            </Link>

            <Link to="/">
              Return Policy
            </Link>
          </div>

          <div className="footer-copy">
            © 2026 Furnicart.
            All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
