import "../../styles/admin-orders.css";

import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Link, useParams } from "react-router-dom";

import {
  Check,
  Package,
  Truck,
  ClipboardList,
  Home,
  ChevronRight,
} from "lucide-react";

import {
  fetchAdminOrder,
  patchAdminLineFulfillment,
  patchAdminOrderFulfillment,
  postAdminCancelOrder,
} from "../../features/admin/adminAPI";

import { useBackgroundServerSync } from "../../hooks/useBackgroundServerSync.js";

import { stableStringify } from "../../utils/stableStringify.js";

import {
  codReturnRefundNote,
  codReturnRefundStatusLabel,
} from "../../features/orders/orderUi.js";

import { gstPercentLabel } from "../../features/checkout/checkoutUtils.js";

const IMAGE_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const FULFILLMENT_OPTIONS = [
  "pending",
  "shipped",
  "out_for_delivery",
  "delivered",
];

const TRACKER_STEPS = [
  {
    key: "pending",
    label: "PENDING",
    tone: "amber",
    Icon: ClipboardList,
  },
  {
    key: "shipped",
    label: "SHIPPED",
    tone: "blue",
    Icon: Truck,
  },
  {
    key: "out_for_delivery",
    label: "OUT FOR DELIVERY",
    tone: "indigo",
    Icon: Package,
  },
  {
    key: "delivered",
    label: "DELIVERED",
    tone: "green",
    Icon: Check,
  },
];

const FULFILLMENT_LABEL = {
  pending: "Pending",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  returned: "Returned",
};

const ORDER_STATUS_LABEL = {
  pending: "Pending",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  partially_cancelled: "Partially cancelled",
  partially_shipped: "Partially shipped",
  partially_delivered: "Partially delivered",
};

const PAYMENT_LABEL = {
  cod: "Cash on delivery",
  razorpay: "Razorpay",
  wallet: "Wallet",
  other: "Other",
};

function formatMoney(v) {
  const n = Number(v);

  if (Number.isNaN(n)) {
    return String(v ?? "—");
  }

  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function initialsFromEmail(email) {
  if (!email || typeof email !== "string") {
    return "?";
  }

  const local = email.split("@")[0] || email;

  const parts = local.split(/[._-]+/).filter(Boolean);

  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  return local.slice(0, 2).toUpperCase();
}

function displayNameFromEmail(email) {
  if (!email || typeof email !== "string") {
    return "Customer";
  }

  const local = email.split("@")[0] || email;

  return local
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function lineImageSrc(imageUrl) {
  if (!imageUrl) {
    return null;
  }

  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }

  const path = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;

  return `${IMAGE_BASE}${path}`;
}

function formatPlacedAt(iso) {
  if (!iso) {
    return "—";
  }

  const d = new Date(iso);

  if (Number.isNaN(d.getTime())) {
    return "—";
  }

  return d.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function resolveTracker(status) {
  if (status === "cancelled") {
    return {
      cancelled: true,
      phase: 0,
      allDelivered: false,
    };
  }

  const allDelivered = status === "delivered";

  const phase =
    {
      pending: 0,
      partially_cancelled: 0,
      partially_shipped: 1,
      shipped: 1,
      out_for_delivery: 2,
      partially_delivered: 3,
      delivered: 3,
    }[status] ?? 0;

  return {
    cancelled: false,
    phase,
    allDelivered,
  };
}

function stepState(stepIndex, { cancelled, phase, allDelivered }) {
  if (cancelled) {
    return "void";
  }

  if (allDelivered) {
    return "done";
  }

  if (stepIndex < phase) {
    return "done";
  }

  if (stepIndex === phase) {
    return "current";
  }

  return "upcoming";
}

function paymentSummary(method, paymentStatus) {
  const label = PAYMENT_LABEL[method] || method || "—";

  if (!paymentStatus || paymentStatus === "pending") {
    return label;
  }

  return `${label} · ${paymentStatus}`;
}

function shippingBlock(order) {
  const parts = [
    order.shipping_address_line,
    [order.shipping_city, order.shipping_state, order.shipping_pincode]
      .filter(Boolean)
      .join(", "),
  ].filter(Boolean);

  return parts.join("\n") || "—";
}

function fulfillmentPillClass(fs) {
  if (fs === "delivered") {
    return "aod-pill aod-pill--delivered";
  }

  if (fs === "shipped") {
    return "aod-pill aod-pill--shipped";
  }

  if (fs === "out_for_delivery") {
    return "aod-pill aod-pill--ofd";
  }

  if (fs === "returned") {
    return "aod-pill aod-pill--returned";
  }

  return "aod-pill aod-pill--pending";
}

function canAdminCancelEntireOrder(order) {
  if (!order || order.status === "cancelled") {
    return false;
  }

  const lines = order.lines || [];

  const active = lines.filter((ln) => ln.status === "active");

  if (active.length === 0) {
    return false;
  }

  return active.every(
    (ln) => (ln.fulfillment_status || "pending") === "pending",
  );
}

function bulkUpdatableLines(order) {
  if (!order || order.status === "cancelled") {
    return [];
  }

  return (order.lines || []).filter(
    (ln) =>
      ln.status === "active" &&
      ln.fulfillment_status !== "returned" &&
      ln.fulfillment_status !== "delivered",
  );
}

export default function AdminOrderDetail() {
  const { orderNumber } = useParams();

  const [order, setOrder] = useState(null);

  const [err, setErr] = useState(null);

  const [busyLine, setBusyLine] = useState(null);

  const [bulkFulfillmentStatus, setBulkFulfillmentStatus] = useState("pending");

  const [bulkFulfillmentBusy, setBulkFulfillmentBusy] = useState(false);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const [cancelReason, setCancelReason] = useState("");

  const [cancelBusy, setCancelBusy] = useState(false);

  const lastOrderSigRef = useRef(null);

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) {
        setErr(null);
      }

      try {
        const data = await fetchAdminOrder(decodeURIComponent(orderNumber));

        const snap = stableStringify(data);

        if (silent && lastOrderSigRef.current === snap) {
          return;
        }

        lastOrderSigRef.current = snap;

        setOrder(data);
      } catch (e) {
        if (!silent) {
          setErr(e.response?.data?.detail || "Order not found.");
        }
      }
    },

    [orderNumber],
  );

  useEffect(() => {
    lastOrderSigRef.current = null;

    load();
  }, [orderNumber, load]);

  useBackgroundServerSync({
    enabled: Boolean(orderNumber),

    pollIntervalMs: 90_000,

    onRefresh: () =>
      load({
        silent: true,
      }),
  });

  const tracker = useMemo(
    () => (order ? resolveTracker(order.status) : null),
    [order],
  );

  const cancelledQuantity = useMemo(
    () =>
      (order?.lines || []).reduce(
        (total, ln) => total + Number(ln.cancelled_quantity ?? 0),
        0,
      ),
    [order],
  );

  const returnedQuantity = useMemo(
    () =>
      (order?.lines || []).reduce(
        (total, ln) => total + Number(ln.returned_quantity ?? 0),
        0,
      ),
    [order],
  );

  const codRefundStatus = codReturnRefundStatusLabel(order);

  const codRefundNote = codReturnRefundNote(
    order,
    order?.return_refund_total ?? order?.refunded_total,
  );

  const onFulfillmentChange = async (lineId, value) => {
    if (!order?.order_number) {
      return;
    }

    setBusyLine(lineId);

    setErr(null);

    try {
      const data = await patchAdminLineFulfillment(
        order.order_number,
        lineId,
        value,
      );

      lastOrderSigRef.current = stableStringify(data);

      setOrder(data);
    } catch (e) {
      const msg =
        (e.response?.data &&
          (e.response.data.detail ||
            e.response.data.fulfillment_status?.[0] ||
            JSON.stringify(e.response.data))) ||
        "Update failed.";

      setErr(typeof msg === "string" ? msg : "Update failed.");
    } finally {
      setBusyLine(null);
    }
  };

  const onBulkFulfillmentApply = async () => {
    if (!order?.order_number) {
      return;
    }

    setBulkFulfillmentBusy(true);

    setErr(null);

    try {
      const data = await patchAdminOrderFulfillment(
        order.order_number,
        bulkFulfillmentStatus,
      );

      lastOrderSigRef.current = stableStringify(data);

      setOrder(data);
    } catch (e) {
      const msg =
        (e.response?.data &&
          (e.response.data.detail ||
            e.response.data.fulfillment_status?.[0] ||
            JSON.stringify(e.response.data))) ||
        "Bulk update failed.";

      setErr(typeof msg === "string" ? msg : "Bulk update failed.");
    } finally {
      setBulkFulfillmentBusy(false);
    }
  };

  const onCancelEntireOrder = async () => {
    if (!order?.order_number) {
      return;
    }

    setCancelBusy(true);

    setErr(null);

    try {
      const data = await postAdminCancelOrder(order.order_number, cancelReason);

      lastOrderSigRef.current = stableStringify(data);

      setOrder(data);

      setCancelModalOpen(false);

      setCancelReason("");
    } catch (e) {
      const msg =
        (e.response?.data &&
          (e.response.data.detail ||
            e.response.data.reason?.[0] ||
            JSON.stringify(e.response.data))) ||
        "Could not cancel order.";

      setErr(typeof msg === "string" ? msg : "Could not cancel order.");
    } finally {
      setCancelBusy(false);
    }
  };

  if (err && !order) {
    return (
      <div className="aod-page aod-error-page">
        <div className="ao-error" role="alert">
          {err}
        </div>

        <Link
          to="/admin/orders"
          className="ao-btn-ghost"
          style={{ marginTop: "1rem", display: "inline-block" }}
        >
          ← Back to orders
        </Link>
      </div>
    );
  }

  if (!order || !tracker) {
    return (
      <div className="aod-page">
        <div className="aod-loading">Loading order…</div>
      </div>
    );
  }

  const lines = order.lines || [];

  const gstPct = gstPercentLabel(order?.gst_rate) ?? 18;

  const email = order.user_email || "";

  const ship = shippingBlock(order);

  const refundedNum = Number(order.refunded_total) || 0;

  const remainingValueNum =
    Number(order.remaining_value ?? order.grand_total) || 0;

  const originalPaidNum = Number(order.original_paid ?? order.grand_total) || 0;

  const refundTxns = order.refund_transactions || [];

  const itemTotals = lines.reduce(
    (acc, ln) => {
      acc.price += Number(ln.line_total) || 0;

      acc.coupon += Number(ln.coupon_share) || 0;

      acc.tax += Number(ln.tax_share) || 0;

      acc.offer += Number(ln.discount_amount) || 0;

      acc.refund += Number(ln.refund_amount) || 0;

      return acc;
    },
    {
      price: 0,
      coupon: 0,
      tax: 0,
      offer: 0,
      refund: 0,
    },
  );

  // Immutable original order breakdown, reconstructed from per-line values
  // (line_total / tax_share / coupon_share never change on cancel/return) and
  // the immutable original_paid. These stay constant even after cancellations
  // or returns, mirroring how real e-commerce keeps the placed-order summary.
  const origItemsNet = itemTotals.price;

  const origOfferNum = itemTotals.offer;

  const origItemsGross = origItemsNet + origOfferNum;

  const origTaxNum = itemTotals.tax;

  const origCouponNum = itemTotals.coupon;

  const origShippingNum = Math.max(
    0,
    Math.round(
      (originalPaidNum - origItemsNet - origTaxNum + origCouponNum) * 100,
    ) / 100,
  );

  const showAdminCancelOrder = canAdminCancelEntireOrder(order);

  const updatableFulfillmentLines = bulkUpdatableLines(order);

  const showBulkFulfillment = updatableFulfillmentLines.length > 0;

  return (
    <div className="aod-page">
      <nav className="aod-breadcrumb" aria-label="Breadcrumb">
        <Link to="/admin/orders" className="aod-breadcrumb-home">
          <Home size={13} aria-hidden />
          Orders
        </Link>

        <ChevronRight size={13} aria-hidden className="aod-breadcrumb-sep" />

        <span className="aod-breadcrumb-current">Order detail</span>
      </nav>

      {err && (
        <div className="ao-error aod-inline-error" role="alert">
          {err}
        </div>
      )}

      <div className="aod-hero">
        <div className="aod-hero-left">
          <h1 className="aod-hero-title">Order #{order.order_number}</h1>

          <p className="aod-hero-status">
            <span
              className={`aod-status-word aod-status-word--${
                order.status === "delivered"
                  ? "green"
                  : order.status === "cancelled"
                    ? "red"
                    : String(order.status).startsWith("partially")
                      ? "amber"
                      : "slate"
              }`}
            >
              {ORDER_STATUS_LABEL[order.status] || order.status}
            </span>
            <span className="aod-status-sep">•</span>
            Placed {formatPlacedAt(order.placed_at)}
          </p>

          {showAdminCancelOrder && (
            <button
              type="button"
              className="aod-cancel-order-btn"
              onClick={() => setCancelModalOpen(true)}
            >
              Cancel entire order
            </button>
          )}

          {tracker.cancelled && order.cancellation_reason && (
            <p className="aod-tracker-cancel-note">
              <strong>Cancelled.</strong> {order.cancellation_reason}
            </p>
          )}
        </div>

        <div
          className={`aod-hero-tracker${
            tracker.cancelled ? " aod-hero-tracker--cancelled" : ""
          }`}
          role="list"
          aria-label="Order progress"
        >
          {TRACKER_STEPS.map((step, i) => {
            const state = stepState(i, tracker);

            const reached = state === "done" || state === "current";

            const StepIcon = step.Icon;

            const dotClass = [
              "aod-tdot",
              `aod-tdot--${step.tone}`,
              reached ? "aod-tdot--reached" : "aod-tdot--upcoming",
              state === "current" ? "aod-tdot--current" : "",
              state === "void" ? "aod-tdot--void" : "",
              i === 3 && reached ? "aod-tdot--filled" : "",
            ]
              .filter(Boolean)
              .join(" ");

            const meta =
              i === 0 && order.placed_at ? formatPlacedAt(order.placed_at) : "";

            return (
              <Fragment key={step.key}>
                {i > 0 && (
                  <div
                    className={`aod-tconn${
                      reached && state !== "void" ? " aod-tconn--on" : ""
                    }`}
                    aria-hidden
                  />
                )}

                <div className="aod-tstep" role="listitem">
                  <div className={dotClass}>
                    <StepIcon size={16} strokeWidth={2.25} aria-hidden />
                  </div>

                  <div className="aod-tstep-label">{step.label}</div>

                  {meta && <div className="aod-tstep-meta">{meta}</div>}
                </div>
              </Fragment>
            );
          })}
        </div>
      </div>

      <div className="aod-grid">
        <div className="aod-top-row">
          <aside className="aod-aside">
            <div className="aod-side-card aod-customer-card">
              <div className="aod-order-id-row">
                ORDER ID
                <strong>#{order.order_number}</strong>
              </div>

              <div className="aod-customer-row">
                <div className="aod-avatar">{initialsFromEmail(email)}</div>

                <div>
                  <p className="aod-customer-name">
                    {displayNameFromEmail(email)}
                  </p>

                  <p className="aod-customer-email">{email || "—"}</p>
                </div>
              </div>

              <dl className="aod-kv">
                <dt>Shipping address</dt>

                <dd style={{ whiteSpace: "pre-line" }}>{ship}</dd>

                {order.shipping_phone && (
                  <>
                    <dt>Phone</dt>

                    <dd>{order.shipping_phone}</dd>
                  </>
                )}

                <dt>Payment</dt>

                <dd>
                  {paymentSummary(order.payment_method, order.payment_status)}
                </dd>
              </dl>
            </div>
          </aside>

          <div className="aod-side-card aod-order-summary-card">
            <h3>Order summary</h3>

            <div className="aod-summary-rows">
              <div className="aod-summary-row">
                <span>{origOfferNum > 0 ? "Items" : "Subtotal"}</span>

                <span>
                  ₹
                  {formatMoney(
                    origOfferNum > 0 ? origItemsGross : origItemsNet,
                  )}
                </span>
              </div>

              {origOfferNum > 0 && (
                <div className="aod-summary-row aod-summary-row--deduct">
                  <span>Offer savings</span>

                  <span>
                    −₹
                    {formatMoney(origOfferNum)}
                  </span>
                </div>
              )}

              {origOfferNum > 0 && (
                <div className="aod-summary-row">
                  <span>Subtotal</span>

                  <span>₹{formatMoney(origItemsNet)}</span>
                </div>
              )}

              <div className="aod-summary-row aod-summary-row--muted">
                <span>Shipping</span>

                <span>
                  {origShippingNum <= 0
                    ? "FREE"
                    : `₹${formatMoney(origShippingNum)}`}
                </span>
              </div>

              <div className="aod-summary-row">
                <span>Tax</span>

                <span>₹{formatMoney(origTaxNum)}</span>
              </div>

              {origCouponNum > 0 && (
                <div className="aod-summary-row aod-summary-row--deduct">
                  <span>
                    {order.coupon_code
                      ? `Coupon (${order.coupon_code})`
                      : "Coupon"}
                  </span>

                  <span>
                    −₹
                    {formatMoney(origCouponNum)}
                  </span>
                </div>
              )}

              <div className="aod-summary-total">
                <span>TOTAL ORDERED VALUE</span>

                <strong>₹{formatMoney(originalPaidNum)}</strong>
              </div>
            </div>

            <p className="aod-remaining-note">
              This is the original value of the order when placed. It stays
              fixed even after cancellations or returns.
            </p>
          </div>
        </div>

        <div className="aod-items-card">
          <div className="aod-card-head">
            <div className="aod-card-head-main">
              <h2>Order items</h2>

              <span className="aod-item-count">
                {lines.length} {lines.length === 1 ? "ITEM" : "ITEMS"}
              </span>
            </div>

            {showBulkFulfillment && (
              <div className="aod-bulk-fulfill">
                <label
                  className="aod-bulk-fulfill-label"
                  htmlFor="aod-bulk-fulfill-select"
                >
                  Update all items
                </label>

                <select
                  id="aod-bulk-fulfill-select"
                  className="aod-bulk-fulfill-select"
                  value={bulkFulfillmentStatus}
                  disabled={bulkFulfillmentBusy || Boolean(busyLine)}
                  onChange={(e) => setBulkFulfillmentStatus(e.target.value)}
                >
                  {FULFILLMENT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {FULFILLMENT_LABEL[opt] || opt}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  className="aod-bulk-fulfill-btn"
                  disabled={bulkFulfillmentBusy || Boolean(busyLine)}
                  onClick={onBulkFulfillmentApply}
                >
                  {bulkFulfillmentBusy ? "Updating…" : "Apply to all"}
                </button>
              </div>
            )}
          </div>

          <div className="aod-table-wrap">
            <table className="aod-items-table">
              <thead>
                <tr>
                  <th>Product</th>

                  <th className="aod-num">Price</th>

                  <th className="aod-num">Coupon share</th>

                  <th className="aod-num">Tax ({gstPct}%)</th>

                  <th>Status</th>

                  <th className="aod-num">Refund amount</th>
                </tr>
              </thead>

              <tbody>
                {lines.map((ln) => {
                  const img = lineImageSrc(ln.image_url);

                  const cancelled = ln.status === "cancelled";

                  const returned = ln.fulfillment_status === "returned";

                  const delivered = ln.fulfillment_status === "delivered";

                  const fs = ln.fulfillment_status || "pending";

                  const locked = cancelled || returned || delivered;

                  const showStrike = cancelled;

                  const couponShare = Number(ln.coupon_share) || 0;

                  const hasRefund =
                    ln.refund_amount !== null &&
                    ln.refund_amount !== undefined &&
                    Number(ln.refund_amount) > 0;

                  return (
                    <tr key={ln.id}>
                      <td>
                        <div className="aod-product-cell">
                          {img ? (
                            <img className="aod-thumb" src={img} alt="" />
                          ) : (
                            <div
                              className="aod-thumb aod-thumb--empty"
                              aria-hidden
                            >
                              No
                              <br />
                              image
                            </div>
                          )}

                          <div>
                            <p className="aod-product-name">
                              {ln.product_name}
                            </p>

                            {ln.variant_name && (
                              <p className="aod-variant-line">
                                {ln.variant_name}
                              </p>
                            )}

                            <p className="aod-variant-line aod-mono">
                              {ln.sku || "—"}
                              {" · Qty "}
                              {ln.quantity}
                            </p>

                            {((ln.cancelled_quantity ?? 0) > 0 ||
                              (ln.returned_quantity ?? 0) > 0) && (
                              <p className="aod-variant-line-qty">
                                {(ln.active_quantity ?? ln.quantity) > 0
                                  ? `${ln.active_quantity ?? ln.quantity} active`
                                  : "None active"}
                                {(ln.cancelled_quantity ?? 0) > 0
                                  ? ` · ${ln.cancelled_quantity} cancelled`
                                  : ""}
                                {(ln.returned_quantity ?? 0) > 0
                                  ? ` · ${ln.returned_quantity} returned`
                                  : ""}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td
                        className={`aod-num${showStrike ? " aod-strike" : ""}`}
                      >
                        <strong>₹{formatMoney(ln.line_total)}</strong>

                        {ln.quantity > 1 && (
                          <span className="aod-qty-sub">
                            {ln.quantity}
                            {" × ₹"}
                            {formatMoney(ln.unit_price)}
                          </span>
                        )}
                      </td>

                      <td className="aod-num">
                        {couponShare > 0 ? (
                          <span className="aod-num--deduct">
                            −₹
                            {formatMoney(couponShare)}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="aod-num aod-mono">
                        ₹{formatMoney(ln.tax_share ?? 0)}
                      </td>

                      <td>
                        <div className="aod-status-cell">
                          {cancelled && (
                            <span className="aod-pill aod-pill--cancelled">
                              Cancelled
                            </span>
                          )}

                          {returned && !cancelled && (
                            <span className={fulfillmentPillClass("returned")}>
                              {FULFILLMENT_LABEL.returned}
                            </span>
                          )}

                          {delivered && !cancelled && !returned && (
                            <span className={fulfillmentPillClass("delivered")}>
                              {FULFILLMENT_LABEL.delivered}
                            </span>
                          )}

                          {!locked && (
                            <div className="aod-fulfill-wrap">
                              <span className={fulfillmentPillClass(fs)}>
                                {FULFILLMENT_LABEL[fs] || fs}
                              </span>

                              <select
                                className="aod-fulfill-select"
                                disabled={
                                  busyLine === ln.id || bulkFulfillmentBusy
                                }
                                value={fs}
                                aria-label={`Fulfillment for ${ln.product_name}`}
                                onChange={(e) =>
                                  onFulfillmentChange(ln.id, e.target.value)
                                }
                              >
                                {FULFILLMENT_OPTIONS.map((opt) => (
                                  <option key={opt} value={opt}>
                                    {FULFILLMENT_LABEL[opt] || opt}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {cancelled && ln.cancellation_reason && (
                            <p className="aod-line-reason">
                              <strong>Reason:</strong> {ln.cancellation_reason}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="aod-num">
                        {hasRefund ? (
                          <span className="aod-num--refund">
                            ₹{formatMoney(ln.refund_amount)}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              <tfoot>
                <tr className="aod-items-foot">
                  <td>Total</td>

                  <td className="aod-num">
                    <strong>₹{formatMoney(itemTotals.price)}</strong>
                  </td>

                  <td className="aod-num">
                    {itemTotals.coupon > 0 ? (
                      <span className="aod-num--deduct">
                        −₹
                        {formatMoney(itemTotals.coupon)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="aod-num aod-mono">
                    ₹{formatMoney(itemTotals.tax)}
                  </td>

                  <td />

                  <td className="aod-num">
                    {itemTotals.refund > 0 ? (
                      <span className="aod-num--refund">
                        ₹{formatMoney(itemTotals.refund)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <div className="aod-summary-grid aod-summary-grid--duo">
        <div className="aod-side-card aod-refund-card">
          <h3>Refund summary</h3>

          <div className="aod-refund-stats">
            <div className="aod-refund-stat">
              <span className="aod-refund-stat-label">Total refund amount</span>

              <span className="aod-refund-stat-value aod-refund-stat-value--refund">
                ₹{formatMoney(refundedNum)}
              </span>
            </div>

            <div className="aod-refund-stat">
              <span className="aod-refund-stat-label">Refund status</span>

              <span
                className={`aod-refund-stat-value aod-refund-stat-value--status ${
                  codRefundStatus
                    ? codRefundStatus.startsWith("Partial")
                      ? "aod-refund-stat-value--partial"
                      : "aod-refund-stat-value--ok"
                    : order.payment_status === "refunded"
                      ? "aod-refund-stat-value--ok"
                      : refundedNum > 0
                        ? "aod-refund-stat-value--partial"
                        : ""
                }`}
              >
                {codRefundStatus ??
                  (order.payment_status === "refunded"
                    ? "Refunded"
                    : refundedNum > 0
                      ? "Partial"
                      : "—")}
              </span>
            </div>

            <div className="aod-refund-stat">
              <span className="aod-refund-stat-label">Cancelled quantity</span>

              <span className="aod-refund-stat-value">{cancelledQuantity}</span>
            </div>

            <div className="aod-refund-stat">
              <span className="aod-refund-stat-label">Returned quantity</span>

              <span className="aod-refund-stat-value">{returnedQuantity}</span>
            </div>
          </div>

          {codRefundNote && (
            <p className="aod-refund-cod-note">{codRefundNote}</p>
          )}

          {refundTxns.length > 0 && (
            <ul className="aod-refund-txns">
              {refundTxns.map((txn) => (
                <li key={txn.id} className="aod-refund-txn">
                  <div className="aod-refund-txn-top">
                    <span className="aod-refund-txn-amt">
                      ₹{formatMoney(txn.amount)}
                    </span>

                    <span className="aod-refund-txn-date">
                      {formatPlacedAt(txn.created_at)}
                    </span>
                  </div>

                  <p className="aod-refund-txn-note">
                    {txn.reference_note || txn.reason_label}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="aod-side-card">
          <h3>Remaining order value</h3>

          <div className="aod-summary-rows">
            <div className="aod-summary-row">
              <span>Total paid</span>

              <span>₹{formatMoney(originalPaidNum)}</span>
            </div>

            {refundedNum > 0 && (
              <div className="aod-summary-row aod-summary-row--deduct">
                <span>Total refund</span>

                <span>
                  −₹
                  {formatMoney(refundedNum)}
                </span>
              </div>
            )}

            <div className="aod-summary-total">
              <span>REMAINING</span>

              <strong>₹{formatMoney(remainingValueNum)}</strong>
            </div>
          </div>

          <p className="aod-remaining-note">
            This is the value retained for the items still active in this order.
          </p>
        </div>
      </div>

      {cancelModalOpen && (
        <div
          className="aod-cancel-overlay"
          role="presentation"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
          onClick={() => {
            if (!cancelBusy) {
              setCancelModalOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal
            aria-labelledby="aod-cancel-title"
            style={{
              background: "#fff",
              padding: "1.5rem",
              maxWidth: "26rem",
              borderRadius: "8px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="aod-cancel-title"
              style={{
                margin: "0 0 0.75rem",
                fontSize: "1.1rem",
              }}
            >
              Cancel this order?
            </h2>

            <p
              style={{
                margin: "0 0 1rem",
                fontSize: "0.9rem",
                color: "#57534e",
              }}
            >
              This cancels every line that is still unshipped and restores
              stock. Optional note for the record.
            </p>

            <label
              htmlFor="aod-cancel-reason"
              style={{
                display: "block",
                fontSize: "0.85rem",
                marginBottom: "0.35rem",
              }}
            >
              Note (optional)
            </label>

            <textarea
              id="aod-cancel-reason"
              rows={3}
              maxLength={500}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                marginBottom: "1rem",
              }}
            />

            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                className="ao-btn-ghost"
                disabled={cancelBusy}
                onClick={() => setCancelModalOpen(false)}
              >
                Close
              </button>

              <button
                type="button"
                className="ao-btn-ghost"
                disabled={cancelBusy}
                style={{
                  borderColor: "#b45309",
                  color: "#b45309",
                }}
                onClick={onCancelEntireOrder}
              >
                {cancelBusy ? "Cancelling…" : "Confirm cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
