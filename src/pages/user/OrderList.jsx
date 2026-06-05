import "../../styles/account.css";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";

import AccountLayout from "../../components/user/AccountLayout";

import {
  fetchOrdersList,
} from "../../features/orders/orderAPI";

import {
  formatProductApiError,
} from "../../utils/productApiErrors.js";

const PAGE_SIZE = 10;

const STATUS_LABELS = {
  "": "All",
  pending: "Pending",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_PILL_ORDER = [
  "",
  "pending",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

const IMAGE_BASE = (
  import.meta.env.VITE_API_URL || ""
).replace(
  /\/$/,
  "",
);

function formatMoney(
  value,
) {

  const n = Number(
    value,
  );

  if (
    Number.isNaN(
      n,
    )
  ) {

    return String(
      value ?? "—",
    );
  }

  return n.toLocaleString(
    undefined,
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  );
}

function formatDateShort(
  iso,
) {

  if (
    !iso
  ) {

    return "—";
  }

  const d = new Date(
    iso,
  );

  if (
    Number.isNaN(
      d.getTime(),
    )
  ) {

    return "—";
  }

  return d.toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );
}

function lineImageSrc(
  imageUrl,
) {

  if (
    !imageUrl
  ) {

    return null;
  }

  if (
    imageUrl.startsWith(
      "http",
    )
  ) {

    return imageUrl;
  }

  const path = imageUrl.startsWith(
    "/",
  )
    ? imageUrl
    : `/${imageUrl}`;

  return `${IMAGE_BASE}${path}`;
}

function orderFooterHint(
  order,
) {

  const placed = order.placed_at
    ? new Date(
      order.placed_at,
    )
    : null;

  const placedOk =
    placed &&
    !Number.isNaN(
      placed.getTime(),
    );

  switch (
    order.status
  ) {

    case "pending": {

      if (
        !placedOk
      ) {

        return "We are preparing your order for shipment.";
      }

      const est = new Date(
        placed,
      );

      est.setDate(
        est.getDate() + 8,
      );

      return `Expected delivery by ${est.toLocaleDateString(
        undefined,
        {
          day: "numeric",
          month: "short",
        },
      )}.`;
    }

    case "shipped":

      return "Your order has left our studio and is on the way.";

    case "out_for_delivery":

      return "Courier is out for delivery — please keep your phone available.";

    case "delivered":

      return placedOk
        ? `Delivered on ${placed.toLocaleDateString(
          undefined,
          {
            dateStyle: "medium",
          },
        )}.`
        : "Delivered. Thank you for your purchase.";

    case "cancelled":

      return "This order was cancelled.";

    default:

      return "";
  }
}

function buildPageList(
  current,
  total,
) {

  if (
    total <= 7
  ) {

    return Array.from(
      {
        length: total,
      },
      (
        _,
        i,
      ) =>
        i + 1,
    );
  }

  const pages = new Set(
    [
      1,
      total,
      current,
      current - 1,
      current + 1,
    ],
  );

  const sorted = [
    ...pages,
  ].filter(
    (p) =>
      p >= 1 &&
      p <= total,
  ).sort(
    (
      a,
      b,
    ) =>
      a - b,
  );

  const out = [];

  let prev = 0;

  for (
    const p of sorted
  ) {

    if (
      p - prev >
      1
    ) {

      out.push(
        "…",
      );
    }

    out.push(
      p,
    );

    prev = p;
  }

  return out;
}

export default function OrdersList() {

  const [
    results,
    setResults,
  ] = useState(
    [],
  );

  const [
    count,
    setCount,
  ] = useState(
    0,
  );

  const [
    totalPages,
    setTotalPages,
  ] = useState(
    1,
  );

  const [
    currentPage,
    setCurrentPage,
  ] = useState(
    1,
  );

  const [
    loading,
    setLoading,
  ] = useState(
    true,
  );

  const [
    error,
    setError,
  ] = useState(
    null,
  );

  const [
    searchDraft,
    setSearchDraft,
  ] = useState(
    "",
  );

  const [
    appliedSearch,
    setAppliedSearch,
  ] = useState(
    "",
  );

  const [
    appliedStatus,
    setAppliedStatus,
  ] = useState(
    "",
  );

  const loadOrders = useCallback(
    async () => {

      setLoading(
        true,
      );

      setError(
        null,
      );

      try {

        const data = await fetchOrdersList(
          {
            page: currentPage,
            pageSize: PAGE_SIZE,
            search: appliedSearch,
            status: appliedStatus,
          },
        );

        setResults(
          data.results || [],
        );

        setCount(
          data.count ?? 0,
        );

        setTotalPages(
          data.total_pages || 1,
        );
      } catch (err) {

        setError(

          formatProductApiError(
            err.response?.data,
          ) ||

            "Could not load orders.",
        );

        setResults(
          [],
        );
      } finally {

        setLoading(
          false,
        );
      }
    },
    [
      currentPage,
      appliedSearch,
      appliedStatus,
    ],
  );

  useEffect(
    () => {

      loadOrders();
    },
    [
      loadOrders,
    ],
  );

  const handleSearchSubmit = (
    e,
  ) => {

    e.preventDefault();

    setCurrentPage(
      1,
    );

    setAppliedSearch(
      searchDraft.trim(),
    );
  };

  const handleClearFilters = () => {

    setSearchDraft(
      "",
    );

    setAppliedSearch(
      "",
    );

    setAppliedStatus(
      "",
    );

    setCurrentPage(
      1,
    );
  };

  const pageItems = useMemo(
    () =>
      buildPageList(
        currentPage,
        totalPages,
      ),
    [
      currentPage,
      totalPages,
    ],
  );

  return (

    <AccountLayout>

      <div className="profile-wrapper orders-artisan-wrap">

        <header className="orders-artisan-head">

          <h1 className="orders-artisan-title">
            My orders
          </h1>

          <p className="orders-artisan-lead">

            Track shipments, download invoices, and revisit every piece you
            have chosen.
          </p>

        </header>

        <form
          className="orders-artisan-search"
          onSubmit={
            handleSearchSubmit
          }
        >

          <div className="orders-artisan-search-inner">

            <Search
              className="orders-artisan-search-icon"
              size={20}
              aria-hidden
            />

            <input
              type="search"
              className="orders-artisan-search-input"
              placeholder="Search by Order ID or Product Name"
              value={
                searchDraft
              }
              onChange={
                (e) =>
                  setSearchDraft(
                    e.target.value,
                  )
              }
              aria-label="Search orders"
            />

            <button
              type="submit"
              className="orders-artisan-search-btn"
            >
              Search
            </button>

          </div>

        </form>

        <div className="orders-artisan-pills">

          {
            STATUS_PILL_ORDER.map(
              (val) => (

                <button
                  key={
                    val ||
                    "all"
                  }
                  type="button"
                  className={
                    `orders-artisan-pill${

                      appliedStatus === val
                        ? " orders-artisan-pill--active"
                        : ""
                    }`
                  }
                  onClick={() => {

                    setAppliedStatus(
                      val,
                    );

                    setCurrentPage(
                      1,
                    );
                  }}
                >

                  {
                    STATUS_LABELS[val] ||
                    "All"
                  }
                </button>
              ),
            )
          }

        </div>

        {
          (appliedSearch || appliedStatus) && (

            <button
              type="button"
              className="orders-artisan-clear"
              onClick={
                handleClearFilters
              }
            >
              Clear filters
            </button>
          )
        }

        {
          error && (

            <div
              className="orders-artisan-banner"
              role="alert"
            >

              {error}
            </div>
          )
        }

        {
          loading ? (

            <p className="orders-artisan-muted">
              Loading your orders…
            </p>
          ) : !results.length ? (

            <div className="orders-artisan-empty">

              <p>
                {
                  appliedSearch || appliedStatus
                    ? "No orders match your filters."
                    : "You have not placed any orders yet."
                }
              </p>

              <Link
                className="primary-btn orders-artisan-empty-cta"
                to="/shop"
              >
                Browse shop
              </Link>

            </div>
          ) : (

            <>

              <p className="orders-artisan-count">

                <strong>
                  {count}
                </strong>

                {" "}
                order
                {count === 1 ? "" : "s"}
                {" "}
                found
              </p>

              <ul className="orders-artisan-cards">

                {
                  results.map(
                    (order) => (

                      <li
                        key={
                          order.id
                        }
                        className="orders-artisan-card"
                      >

                        <div className="orders-artisan-card-head">

                          <div className="orders-artisan-card-meta">

                            <span className="orders-artisan-card-label">
                              Order placed
                            </span>

                            <span className="orders-artisan-card-value">

                              {formatDateShort(
                                order.placed_at,
                              )}
                            </span>
                          </div>

                          <div className="orders-artisan-card-meta">

                            <span className="orders-artisan-card-label">
                              Order ID
                            </span>

                            <span className="orders-artisan-card-value orders-artisan-card-id">

                              #
                              {order.order_number}
                            </span>
                          </div>

                          <div className="orders-artisan-card-meta orders-artisan-card-meta--status">

                            <span className="orders-artisan-card-label">
                              Status
                            </span>

                            <span
                              className={
                                `orders-artisan-status orders-artisan-status--${order.status}`
                              }
                            >

                              {
                                STATUS_LABELS[order.status] ||
                                order.status
                              }
                            </span>
                          </div>

                          <Link
                            className="orders-artisan-card-detail"
                            to={
                              `/orders/${encodeURIComponent(order.order_number)}`
                            }
                          >

                            View details

                            <ChevronRight
                              size={18}
                              aria-hidden
                            />

                          </Link>

                        </div>

                        <div className="orders-artisan-card-body">

                          {
                            (order.lines || []).map(
                              (line) => {

                                const img = lineImageSrc(
                                  line.image_url,
                                );

                                return (

                                  <div
                                    key={
                                      line.id
                                    }
                                    className={
                                      line.status === "cancelled"
                                        ? "orders-artisan-line orders-artisan-line--cancelled"
                                        : "orders-artisan-line"
                                    }
                                  >

                                    <div className="orders-artisan-line-thumb">

                                      {
                                        img ? (

                                          <img
                                            src={
                                              img
                                            }
                                            alt=""
                                          />
                                        ) : (

                                          <span className="orders-artisan-line-ph">
                                            No image
                                          </span>
                                        )
                                      }
                                    </div>

                                    <div className="orders-artisan-line-info">

                                      <div className="orders-artisan-line-title">

                                        {line.product_name}
                                      </div>

                                      <div className="orders-artisan-line-sub">

                                        {line.variant_name}
                                      </div>
                                    </div>

                                    <div className="orders-artisan-line-price">

                                      <div className="orders-artisan-line-amount">

                                        ₹
                                        {formatMoney(
                                          line.unit_price,
                                        )}
                                      </div>

                                      <div className="orders-artisan-line-qty">

                                        Qty:
                                        {" "}

                                        {line.quantity}
                                      </div>
                                    </div>

                                  </div>
                                );
                              },
                            )
                          }

                        </div>

                        <div className="orders-artisan-card-foot">

                          <p className="orders-artisan-card-hint">

                            {orderFooterHint(
                              order,
                            )}
                          </p>

                          <div className="orders-artisan-card-total">

                            <span className="orders-artisan-card-total-label">
                              Total
                            </span>

                            <span className="orders-artisan-card-total-amt">

                              ₹
                              {formatMoney(
                                order.grand_total,
                              )}
                            </span>

                          </div>

                        </div>

                      </li>
                    ),
                  )
                }

              </ul>

              {
                totalPages > 1 && (

                  <nav
                    className="orders-artisan-pagination"
                    aria-label="Order pages"
                  >

                    <button
                      type="button"
                      className="orders-artisan-page-btn"
                      disabled={
                        currentPage <= 1
                      }
                      aria-label="Previous page"
                      onClick={() =>
                        setCurrentPage(
                          (
                            p,
                          ) =>
                            Math.max(
                              1,
                              p - 1,
                            ),
                        )
                      }
                    >

                      <ChevronLeft size={20} />
                    </button>

                    {
                      pageItems.map(
                        (item, idx) =>

                          item === "…"
                            ? (

                              <span
                                key={
                                  `e-${idx}`
                                }
                                className="orders-artisan-page-ellipsis"
                              >
                                …
                              </span>
                            )
                            : (

                              <button
                                key={
                                  item
                                }
                                type="button"
                                className={
                                  `orders-artisan-page-num${

                                    item === currentPage
                                      ? " orders-artisan-page-num--active"
                                      : ""
                                  }`
                                }
                                onClick={() =>
                                  setCurrentPage(
                                    item,
                                  )
                                }
                              >

                                {item}
                              </button>
                            ),
                      )
                    }

                    <button
                      type="button"
                      className="orders-artisan-page-btn"
                      disabled={
                        currentPage >= totalPages
                      }
                      aria-label="Next page"
                      onClick={() =>
                        setCurrentPage(
                          (
                            p,
                          ) =>
                            Math.min(
                              totalPages,
                              p + 1,
                            ),
                        )
                      }
                    >

                      <ChevronRight size={20} />
                    </button>

                  </nav>
                )
              }

            </>
          )
        }

      </div>

    </AccountLayout>

  );
}
