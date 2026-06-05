import "../../styles/shop.css";
import "../../styles/checkout.css";

import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  fetchOrderApi,
  downloadOrderInvoicePdf,
  cancelOrderApi,
  cancelOrderLineApi,
} from "../../features/orders/orderAPI.js";

import {
  formatProductApiError,
} from "../../utils/productApiErrors.js";

function formatMoney(value) {

  const n = Number(value);

  if (Number.isNaN(n)) {

    return String(value ?? "—");
  }

  return n.toLocaleString(
    undefined,
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  );
}

const PAYMENT_LABELS = {
  cod: "Cash on delivery",
  razorpay: "Razorpay",
  wallet: "Wallet",
  other: "Other",
};

const STATUS_LABELS = {
  pending: "Pending",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function OrderDetail() {

  const { orderNumber } = useParams();

  const [
    order,
    setOrder,
  ] = useState(null);

  const [
    error,
    setError,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    invoiceBusy,
    setInvoiceBusy,
  ] = useState(false);

  const [
    invoiceError,
    setInvoiceError,
  ] = useState(null);

  const [
    cancelTarget,
    setCancelTarget,
  ] = useState(null);

  const [
    cancelReason,
    setCancelReason,
  ] = useState("");

  const [
    cancelBusy,
    setCancelBusy,
  ] = useState(false);

  const [
    cancelModalError,
    setCancelModalError,
  ] = useState(null);

  useEffect(() => {

    let cancelled = false;

    if (!orderNumber) {

      setLoading(false);

      setError("Missing order reference.");

      return;
    }

    (
      async () => {

        setLoading(true);

        setError(null);

        try {

          const data = await fetchOrderApi(
            decodeURIComponent(orderNumber),
          );

          if (!cancelled) {

            setOrder(data);
          }
        } catch (err) {

          if (!cancelled) {

            setError(

              formatProductApiError(
                err.response?.data,
              ) ||

                "Could not load this order.",
            );
          }
        } finally {

          if (!cancelled) {

            setLoading(false);
          }
        }
      }
    )();

    return () => {

      cancelled = true;
    };
  }, [orderNumber]);

  const refetchOrder = async () => {

    if (
      !orderNumber
    ) {

      return;
    }

    try {

      const data = await fetchOrderApi(
        decodeURIComponent(orderNumber),
      );

      setOrder(
        data,
      );
    } catch (err) {

      setError(

        formatProductApiError(
          err.response?.data,
        ) ||

          "Could not refresh this order.",
      );
    }
  };

  const handleDownloadInvoice = async () => {

    if (
      !order?.order_number
    ) {

      return;
    }

    setInvoiceBusy(
      true,
    );

    setInvoiceError(
      null,
    );

    try {

      await downloadOrderInvoicePdf(
        order.order_number,
      );
    } catch (err) {

      setInvoiceError(

        err.message ||

          "Could not download invoice.",
      );
    } finally {

      setInvoiceBusy(
        false,
      );
    }
  };

  const canModifyOrder =
    order?.status === "pending";

  const openCancelOrderModal = () => {

    if (!canModifyOrder) {

      return;
    }

    setCancelModalError(
      null,
    );

    setCancelReason(
      "",
    );

    setCancelTarget(
      { type: "order" },
    );
  };

  const openCancelLineModal = (lineId) => {

    if (!canModifyOrder) {

      return;
    }

    setCancelModalError(
      null,
    );

    setCancelReason(
      "",
    );

    setCancelTarget(
      { type: "line", lineId },
    );
  };

  const closeCancelModal = () => {

    if (cancelBusy) {

      return;
    }

    setCancelTarget(
      null,
    );

    setCancelReason(
      "",
    );

    setCancelModalError(
      null,
    );
  };

  const submitCancel = async () => {

    if (!order?.order_number || !cancelTarget) {

      return;
    }

    setCancelBusy(
      true,
    );

    setCancelModalError(
      null,
    );

    try {

      const body = {};

      if (cancelReason.trim()) {

        body.reason = cancelReason.trim().slice(
          0,
          500,
        );
      }

      if (cancelTarget.type === "order") {

        await cancelOrderApi(
          order.order_number,
          body,
        );
      } else {

        await cancelOrderLineApi(
          order.order_number,
          cancelTarget.lineId,
          body,
        );
      }

      await refetchOrder();

      setCancelTarget(
        null,
      );

      setCancelReason(
        "",
      );
    } catch (err) {

      setCancelModalError(

        formatProductApiError(
          err.response?.data,
        ) ||

          err.message ||

          "Could not complete cancellation.",
      );
    } finally {

      setCancelBusy(
        false,
      );
    }
  };

  return (

    <div className="artisan-shop order-detail-shell">

      <main className="order-detail-main">

        <header className="checkout-head">

          <div>

            <h1 className="checkout-title artisan-font-serif">

              Order details
            </h1>

            <p className="checkout-sub">

              Confirmation and line items for your purchase.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >

            <Link
              className="checkout-back"
              to="/orders"
            >
              My orders
            </Link>

            <Link
              className="checkout-back"
              to="/shop"
            >
              Continue shopping
            </Link>

          </div>

        </header>

        {
          loading ? (

            <p className="cart-bag-muted">
              Loading…
            </p>
          ) : error ? (

            <div
              className="shop-banner error cart-bag-banner"
              role="alert"
            >

              {error}
            </div>
          ) : order ? (

            <>

            <div className="checkout-panel">

              <p style={{ margin: "0 0 0.75rem", color: "#5c534a" }}>

                <strong>
                  Order ID:
                </strong>

                {" "}

                {order.order_number}

                {" "}
                ·
                {" "}

                <strong>
                  Status:
                </strong>

                {" "}

                {
                  STATUS_LABELS[order.status] ||
                  order.status
                }

                {" "}
                ·
                {" "}

                <strong>
                  Payment:
                </strong>

                {" "}

                {
                  PAYMENT_LABELS[order.payment_method] ||
                  order.payment_method
                }

              </p>

              {
                order.cancelled_at && (

                  <p
                    style={{
                      margin: "0 0 0.75rem",
                      fontSize: "0.9rem",
                      color: "#7a4a4a",
                    }}
                  >

                    <strong>
                      Cancelled on:
                    </strong>

                    {" "}

                    {
                      new Date(
                        order.cancelled_at,
                      ).toLocaleString()
                    }

                    {
                      order.cancellation_reason
                        ? (
                          <>

                            {" "}
                            —
                            {" "}

                            {order.cancellation_reason}
                          </>
                        )
                        : null
                    }

                  </p>
                )
              }

              <p style={{ margin: "0 0 1rem", fontSize: "0.9rem", color: "#5c534a" }}>

                <strong>
                  Ship to:
                </strong>

                {" "}

                {order.shipping_name}
                ,
                {" "}

                {order.shipping_phone}
                <br />

                {
                  [
                    order.shipping_address_line,
                    order.shipping_city,
                    `${order.shipping_state} ${order.shipping_pincode}`,
                  ].join(
                    ", ",
                  )
                }

              </p>

              {
                invoiceError && (

                  <div
                    className="shop-banner error cart-bag-banner"
                    role="alert"
                    style={{ marginBottom: "0.75rem" }}
                  >

                    {invoiceError}
                  </div>
                )
              }

              <div
                style={{
                  marginBottom: "1rem",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                }}
              >

                <button
                  type="button"
                  className="checkout-btn-secondary"
                  disabled={
                    invoiceBusy
                  }
                  onClick={
                    handleDownloadInvoice
                  }
                >

                  {
                    invoiceBusy
                      ? "Preparing PDF…"
                      : "Download invoice (PDF)"
                  }
                </button>

                {
                  canModifyOrder && (

                    <button
                      type="button"
                      className="checkout-btn-secondary order-cancel-order-btn"
                      disabled={
                        invoiceBusy
                      }
                      onClick={
                        openCancelOrderModal
                      }
                    >

                      Cancel entire order
                    </button>
                  )
                }

              </div>

              <h2 className="checkout-panel-title artisan-font-serif">

                Items
              </h2>

              <table className="order-detail-table">

                <thead>

                  <tr>

                    <th>
                      Product
                    </th>

                    <th>
                      Qty
                    </th>

                    <th style={{ textAlign: "right" }}>
                      Line total
                    </th>

                    <th style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {
                    (order.lines || []).map(
                      (line) => {

                        const lineCancelled =
                          line.status === "cancelled";

                        return (

                        <tr
                          key={line.id}
                          className={
                            lineCancelled
                              ? "order-detail-line--cancelled"
                              : undefined
                          }
                        >

                          <td>

                            <div style={{ fontWeight: 600 }}>

                              {line.product_name}

                              {
                                lineCancelled
                                  ? (

                                    <span className="order-detail-line-badge">

                                      {" "}
                                      Cancelled
                                    </span>
                                  )
                                  : null
                              }

                            </div>

                            <div style={{ fontSize: "0.82rem", color: "#6b635c" }}>

                              {line.variant_name}

                              {" "}
                              ·
                              {" "}

                              {line.sku}
                            </div>

                            {
                              lineCancelled && line.cancellation_reason
                                ? (

                                  <div className="order-detail-line-reason">

                                    {line.cancellation_reason}
                                  </div>
                                )
                                : null
                            }

                          </td>

                          <td>

                            {line.quantity}
                          </td>

                          <td style={{ textAlign: "right" }}>

                            ₹
                            {formatMoney(line.line_total)}
                          </td>

                          <td style={{ textAlign: "right" }}>

                            {
                              canModifyOrder && !lineCancelled
                                ? (

                                  <button
                                    type="button"
                                    className="order-cancel-line-btn"
                                    onClick={() => {

                                      openCancelLineModal(
                                        line.id,
                                      );
                                    }}
                                  >

                                    Cancel line
                                  </button>
                                )
                                : (
                                  <span className="cart-bag-muted">
                                    —
                                  </span>
                                )
                            }

                          </td>

                        </tr>
                      );
                      },
                    )
                  }

                </tbody>

              </table>

              <div className="checkout-summary-divider" />

              <dl className="checkout-summary-lines">

                <div className="checkout-summary-line">

                  <dt>
                    Subtotal
                  </dt>

                  <dd>

                    ₹
                    {formatMoney(order.subtotal)}
                  </dd>

                </div>

                <div className="checkout-summary-line">

                  <dt>
                    Taxes
                  </dt>

                  <dd>

                    ₹
                    {formatMoney(order.tax_total)}
                  </dd>

                </div>

                <div className="checkout-summary-line">

                  <dt>
                    Shipping
                  </dt>

                  <dd>

                    ₹
                    {formatMoney(order.shipping_total)}
                  </dd>

                </div>

                <div className="checkout-summary-line">

                  <dt>
                    Discounts
                  </dt>

                  <dd>

                    ₹
                    {formatMoney(order.discount_total)}
                  </dd>

                </div>

              </dl>

              <div className="checkout-summary-total">

                <span>
                  Grand total
                </span>

                <span>

                  ₹
                  {formatMoney(order.grand_total)}
                </span>

              </div>

            </div>

            {
              cancelTarget && (

                <div
                  className="order-cancel-overlay"
                  role="presentation"
                  onClick={
                    closeCancelModal
                  }
                >

                  <div
                    className="order-cancel-dialog"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="order-cancel-title"
                    onClick={(e) => {

                      e.stopPropagation();
                    }}
                  >

                    <h2
                      id="order-cancel-title"
                      className="checkout-panel-title artisan-font-serif"
                      style={{ marginTop: 0 }}
                    >

                      {
                        cancelTarget.type === "order"
                          ? "Cancel entire order?"
                          : "Cancel this line?"
                      }

                    </h2>

                    <p className="order-cancel-dialog-hint">

                      {
                        cancelTarget.type === "order"
                          ? "This cancels every item and restores stock. This cannot be undone."
                          : "Stock for this item will be restored. If it is your last active item, the whole order will be cancelled."
                      }

                    </p>

                    <label
                      className="order-cancel-label"
                      htmlFor="order-cancel-reason"
                    >

                      Reason (optional)
                    </label>

                    <textarea
                      id="order-cancel-reason"
                      className="order-cancel-textarea"
                      rows={3}
                      maxLength={500}
                      value={
                        cancelReason
                      }
                      onChange={(e) => {

                        setCancelReason(
                          e.target.value,
                        );
                      }}
                      placeholder="Tell us why (optional)"
                    />

                    {
                      cancelModalError && (

                        <div
                          className="shop-banner error cart-bag-banner"
                          role="alert"
                          style={{ marginBottom: "0.75rem" }}
                        >

                          {cancelModalError}
                        </div>
                      )
                    }

                    <div className="order-cancel-dialog-actions">

                      <button
                        type="button"
                        className="checkout-btn-secondary"
                        disabled={
                          cancelBusy
                        }
                        onClick={
                          closeCancelModal
                        }
                      >

                        Keep order
                      </button>

                      <button
                        type="button"
                        className="checkout-btn-primary order-cancel-confirm-btn"
                        disabled={
                          cancelBusy
                        }
                        onClick={
                          submitCancel
                        }
                      >

                        {
                          cancelBusy
                            ? "Working…"
                            : "Confirm cancel"
                        }
                      </button>

                    </div>

                  </div>

                </div>
              )
            }

            </>
          ) : null
        }

      </main>

    </div>
  );
}
