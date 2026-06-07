import "../../styles/account.css";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  Search,
} from "lucide-react";

import AccountLayout from "../../components/user/AccountLayout";

import {
  fetchPurchasesList,
  cancelOrderLineApi,
  submitReturnRequest,
} from "../../features/orders/orderAPI";

import {
  addToCartApi,
} from "../../features/cart/cartAPI";

import {
  formatProductApiError,
} from "../../utils/productApiErrors.js";

const PAGE_SIZE = 10;

const IMAGE_BASE = (
  import.meta.env.VITE_API_URL || ""
).replace(
  /\/$/,
  "",
);

const FULFILLMENT_LABELS = {
  pending: "Pending",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  returned: "Returned",
};

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

export default function Purchases() {

  const [
    results,
    setResults,
  ] = useState(
    [],
  );

  const [
    totalPages,
    setTotalPages,
  ] = useState(
    1,
  );

  const [
    page,
    setPage,
  ] = useState(
    1,
  );

  const [
    search,
    setSearch,
  ] = useState(
    "",
  );

  const [
    searchDraft,
    setSearchDraft,
  ] = useState(
    "",
  );

  const [
    fulfillmentFilter,
    setFulfillmentFilter,
  ] = useState(
    "",
  );

  const [
    lineStatusFilter,
    setLineStatusFilter,
  ] = useState(
    "",
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
    actionErr,
    setActionErr,
  ] = useState(
    null,
  );

  const [
    returnLine,
    setReturnLine,
  ] = useState(
    null,
  );

  const [
    returnReason,
    setReturnReason,
  ] = useState(
    "",
  );

  const [
    returnBusy,
    setReturnBusy,
  ] = useState(
    false,
  );

  const load = useCallback(
    async () => {

      setLoading(
        true,
      );

      setError(
        null,
      );

      try {

        const data = await fetchPurchasesList(
          {
            page,
            pageSize: PAGE_SIZE,
            search,
            fulfillmentStatus: fulfillmentFilter,
            lineStatus: lineStatusFilter,
          },
        );

        setResults(
          data.results || [],
        );

        setTotalPages(
          data.total_pages || 1,
        );
      } catch (err) {

        setError(

          formatProductApiError(
            err.response?.data,
          ) ||

            "Could not load purchases.",
        );
      } finally {

        setLoading(
          false,
        );
      }
    },
    [
      page,
      search,
      fulfillmentFilter,
      lineStatusFilter,
    ],
  );

  useEffect(
    () => {

      load();
    },
    [load],
  );

  const handleSearchSubmit = (
    e,
  ) => {

    e.preventDefault();

    setPage(
      1,
    );

    setSearch(
      searchDraft.trim(),
    );
  };

  const handleCancelLine = async (
    row,
  ) => {

    setActionErr(
      null,
    );

    if (
      !window.confirm(
        "Cancel this item? Stock will be restored.",
      )
    ) {

      return;
    }

    try {

      await cancelOrderLineApi(
        row.order_number,
        row.id,
        {},
      );

      await load();
    } catch (err) {

      setActionErr(

        formatProductApiError(
          err.response?.data,
        ) ||

          "Could not cancel line.",
      );
    }
  };

  const submitReturn = async () => {

    if (
      !returnLine
    ) {

      return;
    }

    const r = returnReason.trim();

    if (
      !r
    ) {

      setActionErr(
        "Please enter a return reason.",
      );

      return;
    }

    setReturnBusy(
      true,
    );

    setActionErr(
      null,
    );

    try {

      await submitReturnRequest(
        returnLine.order_number,
        returnLine.id,
        {
          reason: r,
        },
      );

      setReturnLine(
        null,
      );

      setReturnReason(
        "",
      );

      await load();
    } catch (err) {

      setActionErr(

        formatProductApiError(
          err.response?.data,
        ) ||

          "Could not submit return.",
      );
    } finally {

      setReturnBusy(
        false,
      );
    }
  };

  const handleBuyAgain = async (
    row,
  ) => {

    setActionErr(
      null,
    );

    try {

      await addToCartApi(
        {
          variantId: row.variant_id,
          quantity: 1,
        },
      );

      window.location.href = "/cart";
    } catch (err) {

      setActionErr(

        formatProductApiError(
          err.response?.data,
        ) ||

          "Could not add to cart.",
      );
    }
  };

  return (

    <AccountLayout>

      <div className="profile-wrapper orders-artisan-wrap">

        <header className="orders-artisan-head">

          <h1 className="orders-artisan-title">
            My purchases
          </h1>

          <p className="orders-artisan-lead">
            Every item across your orders — cancel, return, or buy again without
            affecting other lines.
          </p>

          <form
            className="orders-artisan-search"
            onSubmit={handleSearchSubmit}
          >

            <div className="orders-artisan-search-inner">

              <Search
                className="orders-artisan-search-icon"
                size={18}
                aria-hidden
              />

              <input
                className="orders-artisan-search-input"
                placeholder="Search by order ID or product"
                value={searchDraft}
                onChange={(e) =>
                  setSearchDraft(
                    e.target.value,
                  )
                }
                aria-label="Search purchases"
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

            <span style={{ marginRight: "0.5rem", color: "#6b635c" }}>
              Fulfillment:
            </span>

            {
              [
                "",
                "pending",
                "shipped",
                "out_for_delivery",
                "delivered",
                "returned",
              ].map(
                (v) => (

                  <button
                    key={
                      v || "all-f"
                    }
                    type="button"
                    className={
                      `orders-artisan-pill${
                        fulfillmentFilter === v
                          ? " orders-artisan-pill--active"
                          : ""
                      }`
                    }
                    onClick={() => {

                      setPage(
                        1,
                      );

                      setFulfillmentFilter(
                        v,
                      );
                    }}
                  >

                    {
                      v
                        ? FULFILLMENT_LABELS[v] || v
                        : "All"
                    }

                  </button>
                ),
              )
            }

          </div>

          <div className="orders-artisan-pills">

            <span style={{ marginRight: "0.5rem", color: "#6b635c" }}>
              Line:
            </span>

            {
              [
                "",
                "active",
                "cancelled",
              ].map(
                (v) => (

                  <button
                    key={
                      v || "all-s"
                    }
                    type="button"
                    className={
                      `orders-artisan-pill${
                        lineStatusFilter === v
                          ? " orders-artisan-pill--active"
                          : ""
                      }`
                    }
                    onClick={() => {

                      setPage(
                        1,
                      );

                      setLineStatusFilter(
                        v,
                      );
                    }}
                  >

                    {
                      v
                        ? (
                          v.charAt(
                            0,
                          ).toUpperCase() + v.slice(
                            1,
                          )
                        )
                        : "All"
                    }

                  </button>
                ),
              )
            }

          </div>

        </header>

        {
          actionErr && (

            <div
              className="shop-banner error cart-bag-banner"
              role="alert"
            >
              {actionErr}
            </div>
          )
        }

        {
          loading ? (

            <p className="orders-artisan-muted">
              Loading…
            </p>
          ) : error ? (

            <div
              className="shop-banner error cart-bag-banner"
              role="alert"
            >
              {error}
            </div>
          ) : results.length === 0 ? (

            <div className="orders-artisan-empty">

              <p className="orders-artisan-muted">
                No items match your filters.
              </p>

              <Link
                className="primary-btn orders-artisan-empty-cta"
                to="/shop"
              >
                Continue shopping
              </Link>

            </div>
          ) : (

            <ul className="orders-artisan-cards">

              {
                results.map(
                  (row) => {

                    const img = lineImageSrc(
                      row.image_url,
                    );

                    const canCancel =
                      row.status === "active" &&
                      row.fulfillment_status === "pending";

                    const canReturn =
                      row.status === "active" &&
                      row.fulfillment_status === "delivered" &&
                      !row.has_return_request;

                    return (

                      <li
                        key={row.id}
                        className="orders-artisan-card"
                      >

                        <div className="orders-artisan-card-head">

                          <div className="orders-artisan-card-meta">

                            <span className="orders-artisan-card-label">
                              Order
                            </span>

                            <span className="orders-artisan-card-value orders-artisan-card-id">

                              <Link
                                to={
                                  `/orders/${encodeURIComponent(row.order_number)}`
                                }
                              >
                                {row.order_number}
                              </Link>

                            </span>

                          </div>

                          <div className="orders-artisan-card-meta">

                            <span className="orders-artisan-card-label">
                              Fulfillment
                            </span>

                            <span className="orders-artisan-card-value">

                              {
                                FULFILLMENT_LABELS[row.fulfillment_status] ||
                                row.fulfillment_status
                              }

                            </span>

                          </div>

                        </div>

                        <div className="orders-artisan-card-body">

                          <div className="orders-artisan-line">

                            <div className="orders-artisan-line-thumb">

                              {
                                img ? (

                                  <img
                                    src={img}
                                    alt=""
                                  />
                                ) : (

                                  <span className="orders-artisan-line-ph">
                                    —
                                  </span>
                                )
                              }

                            </div>

                            <div className="orders-artisan-line-info">

                              <div className="orders-artisan-line-title">

                                <Link
                                  to={
                                    `/shop/product/${row.product_id}`
                                  }
                                >
                                  {row.product_name}
                                </Link>

                              </div>

                              <div className="orders-artisan-line-sub">

                                {row.variant_name}
                                {" "}
                                · Qty
                                {" "}
                                {row.quantity}
                              </div>

                            </div>

                            <div className="orders-artisan-line-price">

                              <div className="orders-artisan-line-amount">

                                ₹
                                {formatMoney(row.line_total)}
                              </div>

                            </div>

                          </div>

                        </div>

                        <div className="orders-artisan-card-foot">

                          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>

                            <button
                              type="button"
                              className="primary-btn"
                              style={{ fontSize: "0.85rem", padding: "0.35rem 0.75rem" }}
                              onClick={() =>
                                handleBuyAgain(
                                  row,
                                )
                              }
                            >
                              Buy again
                            </button>

                            {
                              canCancel && (

                                <button
                                  type="button"
                                  className="checkout-btn-secondary"
                                  style={{ fontSize: "0.85rem" }}
                                  onClick={() =>
                                    handleCancelLine(
                                      row,
                                    )
                                  }
                                >
                                  Cancel line
                                </button>
                              )
                            }

                            {
                              canReturn && (

                                <button
                                  type="button"
                                  className="checkout-btn-secondary"
                                  style={{ fontSize: "0.85rem" }}
                                  onClick={() => {

                                    setReturnLine(
                                      row,
                                    );

                                    setReturnReason(
                                      "",
                                    );

                                    setActionErr(
                                      null,
                                    );
                                  }}
                                >
                                  Request return
                                </button>
                              )
                            }

                            {
                              row.open_return && (

                                <span className="orders-artisan-muted">
                                  {row.open_return.status === "approved"
                                    ? "Return approved"
                                    : "Return pending review"}
                                </span>
                              )
                            }

                            {
                              !row.open_return &&
                              row.last_return &&
                              row.last_return.status === "rejected" && (

                                <span
                                  className="orders-artisan-muted"
                                  style={{ color: "#991b1b" }}
                                >
                                  Return request rejected
                                </span>
                              )
                            }

                          </div>

                        </div>

                      </li>
                    );
                  },
                )
              }

            </ul>
          )
        }

        {
          totalPages > 1 && (

            <div className="orders-artisan-pagination">

              <button
                type="button"
                className="orders-artisan-page-btn"
                disabled={page <= 1}
                onClick={() =>
                  setPage(
                    (p) =>
                      Math.max(
                        1,
                        p - 1,
                      ),
                  )
                }
              >
                Previous
              </button>

              <span className="orders-artisan-muted">
                Page
                {" "}
                {page}
                {" "}
                of
                {" "}
                {totalPages}
              </span>

              <button
                type="button"
                className="orders-artisan-page-btn"
                disabled={page >= totalPages}
                onClick={() =>
                  setPage(
                    (p) =>
                      Math.min(
                        totalPages,
                        p + 1,
                      ),
                  )
                }
              >
                Next
              </button>

            </div>
          )
        }

        {
          returnLine && (

            <div
              className="order-cancel-overlay"
              role="presentation"
              onClick={() => {

                if (
                  !returnBusy
                ) {

                  setReturnLine(
                    null,
                  );
                }
              }}
            >

              <div
                className="order-cancel-dialog"
                role="dialog"
                aria-modal
                aria-labelledby="purchase-return-title"
                onClick={(e) =>
                  e.stopPropagation()
                }
              >

                <h2 id="purchase-return-title">
                  Return request
                </h2>

                <p className="order-cancel-dialog-hint">
                  Tell us why you are returning this item. An administrator will
                  review your request.
                </p>

                <label
                  className="order-cancel-label"
                  htmlFor="purchase-return-reason"
                >
                  Reason (required)
                </label>

                <textarea
                  id="purchase-return-reason"
                  className="order-cancel-textarea"
                  rows={4}
                  value={returnReason}
                  onChange={(e) =>
                    setReturnReason(
                      e.target.value,
                    )
                  }
                />

                {
                  actionErr && returnLine && (

                    <p className="shop-banner error cart-bag-banner">
                      {actionErr}
                    </p>
                  )
                }

                <div className="order-cancel-dialog-actions">

                  <button
                    type="button"
                    className="checkout-btn-secondary"
                    disabled={returnBusy}
                    onClick={() =>
                      setReturnLine(
                        null,
                      )
                    }
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    className="checkout-btn-primary"
                    disabled={returnBusy}
                    onClick={submitReturn}
                  >
                    {returnBusy ? "Submitting…" : "Submit"}
                  </button>

                </div>

              </div>

            </div>
          )
        }

      </div>

    </AccountLayout>

  );
}
