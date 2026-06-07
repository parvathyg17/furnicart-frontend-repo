import "../../styles/shop.css";
import "../../styles/checkout.css";
import "../../styles/orderdetail.css";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
  useLocation,
} from "react-router-dom";

import {
  Check,
  ChevronDown,
  Download,
} from "lucide-react";

import {
  fetchOrderApi,
  downloadOrderInvoicePdf,
  cancelOrderApi,
  cancelOrderLineApi,
  submitReturnRequest,
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

const PAYMENT_STATUS_LABELS = {
  pending: "Pending",
  processing: "Processing",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
  partially_refunded: "Partially refunded",
};

/**
 * Extra payment line for the customer UI. COD orders stay ``pending`` until
 * delivery — showing raw ``pending`` looks like an error, so we omit it.
 */
function paymentStatusFollowLine(
  order,
) {

  const ps = order.payment_status;

  const pm = order.payment_method;

  if (
    !ps
  ) {

    return null;
  }

  if (
    ps === "pending" &&
    pm === "cod"
  ) {

    return null;
  }

  return PAYMENT_STATUS_LABELS[
    ps
  ] ||
    ps;
}

const STATUS_LABELS = {
  pending: "Pending",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  partially_cancelled: "Partially cancelled",
  partially_shipped: "Partially shipped",
  partially_delivered: "Partially delivered",
};

const FULFILLMENT_LABELS = {
  pending: "Pending",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  returned: "Returned",
};

const IMAGE_BASE = (
  import.meta.env.VITE_API_URL || ""
).replace(
  /\/$/,
  "",
);

const ORDER_TRACK_STEPS = [
  {
    key: "pending",
    label: "Ordered",
  },
  {
    key: "shipped",
    label: "Shipped",
  },
  {
    key: "out_for_delivery",
    label: "Out for delivery",
  },
  {
    key: "delivered",
    label: "Delivered",
  },
];

const LINE_TRACK_STEPS = [
  {
    key: "ordered",
    label: "Ordered",
  },
  {
    key: "shipped",
    label: "Shipped",
  },
  {
    key: "ofd",
    label: "Out for delivery",
  },
  {
    key: "delivered",
    label: "Delivered",
  },
];

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

function resolveOrderTracker(
  status,
) {

  if (
    status === "cancelled"
  ) {

    return {
      cancelled: true,
      phase: 0,
      allDelivered: false,
    };
  }

  const allDelivered = status === "delivered";

  const phase = (
    {
      pending: 0,
      partially_cancelled: 0,
      partially_shipped: 1,
      shipped: 1,
      out_for_delivery: 2,
      partially_delivered: 3,
      delivered: 3,
    }[
      status
    ] ?? 0
  );

  return {
    cancelled: false,
    phase,
    allDelivered,
  };
}

function orderBarFilled(
  barIndex,
  phase,
  allDelivered,
) {

  if (
    allDelivered
  ) {

    return barIndex < 3;
  }

  return barIndex < phase;
}

function orderStepDotKind(
  stepIndex,
  tracker,
) {

  if (
    tracker.cancelled
  ) {

    return "upcoming";
  }

  if (
    tracker.allDelivered
  ) {

    return "done";
  }

  if (
    stepIndex < tracker.phase
  ) {

    return "done";
  }

  if (
    stepIndex === tracker.phase
  ) {

    return "current";
  }

  return "upcoming";
}

function OrderProgressStepper(
  {
    order,
  },
) {

  const tracker = resolveOrderTracker(
    order.status,
  );

  const placed = formatDateShort(
    order.placed_at,
  );

  return (

    <div className="odl-order-track">

      <p className="odl-order-track-title">
        Order status
      </p>

      {
        tracker.cancelled && (

          <p style={{ margin: "0 0 0.75rem", fontSize: "0.88rem", color: "#991b1b" }}>
            This order was cancelled.
          </p>
        )
      }

      <div
        className="odl-track-flex"
        role="list"
        aria-label="Order shipping progress"
      >

        {
          ORDER_TRACK_STEPS.map(
            (
              step,
              i,
            ) => {

              const kind = orderStepDotKind(
                i,
                tracker,
              );

              const labelClass = [
                "odl-track-label",
                kind === "current"
                  ? "odl-track-label--current"
                  : "",
                kind === "done"
                  ? "odl-track-label--done"
                  : "",
              ].filter(
                Boolean,
              ).join(
                " ",
              );

              const dotClass = [
                "odl-track-dot",
                kind === "done"
                  ? "odl-track-dot--done"
                  : "",
                kind === "current"
                  ? "odl-track-dot--current"
                  : "",
                kind === "upcoming"
                  ? "odl-track-dot--upcoming"
                  : "",
              ].filter(
                Boolean,
              ).join(
                " ",
              );

              const meta = (

                kind === "done" &&
                i === 0 &&
                order.placed_at
              )
                ? placed
                : "";

              return (

                <div key={step.key} style={{ display: "contents" }}>

                  {
                    i > 0 && (

                      <div
                        className={
                          `odl-track-bar${
                            orderBarFilled(
                              i - 1,
                              tracker.phase,
                              tracker.allDelivered,
                            )
                              ? " odl-track-bar--on"
                              : ""
                          }`
                        }
                        aria-hidden
                      />
                    )
                  }

                  <div
                    className="odl-track-col"
                    role="listitem"
                  >

                    <div className={dotClass}>

                      {
                        kind === "done"
                          ? (
                            <Check size={16} strokeWidth={2.5} aria-hidden />
                          )
                          : null
                      }
                    </div>

                    <div className={labelClass}>
                      {step.label}
                    </div>

                    <div className="odl-track-meta">
                      {meta}
                    </div>
                  </div>
                </div>
              );
            },
          )
        }
      </div>
    </div>
  );
}

function lineFulfillmentPhase(
  fs,
) {

  if (
    fs === "shipped"
  ) {

    return 1;
  }

  if (
    fs === "out_for_delivery"
  ) {

    return 2;
  }

  if (
    fs === "delivered"
  ) {

    return 3;
  }

  return 0;
}

function RejectedReturnNotice(
  {
    lastReturn,
    className = "odl-mini-track-note",
  },
) {

  if (
    !lastReturn ||
    lastReturn.status !== "rejected"
  ) {

    return null;
  }

  const note = (
    typeof lastReturn.admin_note === "string"
      ? lastReturn.admin_note.trim()
      : ""
  );

  return (
    <p className={`${className} odl-return-rejected`}>
      <strong>
        Return request rejected
      </strong>

      {
        lastReturn.resolved_at
          ? (
            <>
              {" "}

              <span className="odl-return-rejected-date">
                (
                {formatDateShort(lastReturn.resolved_at)}
                )
              </span>
            </>
          )
          : null
      }

      {
        note
          ? (
            <>
              <br />

              <span className="odl-return-rejected-note">
                {note}
              </span>
            </>
          )
          : null
      }
    </p>
  );
}

function LineItemTracking(
  {
    line,
    orderPlacedAt,
  },
) {

  if (
    line.status === "cancelled"
  ) {

    return (

      <div className="odl-mini-track odl-mini-track--muted">

        <p style={{ margin: 0, fontSize: "0.88rem", color: "#991b1b" }}>
          This line item was cancelled.
        </p>

        {
          line.cancellation_reason && (

            <p className="odl-mini-track-note">
              {line.cancellation_reason}
            </p>
          )
        }
      </div>
    );
  }

  const fs = line.fulfillment_status || "pending";

  if (
    fs === "returned"
  ) {

    return (

      <div>

        <div className="odl-mini-track">

          <p style={{ margin: 0, fontSize: "0.82rem", color: "#5c534a" }}>
            This item was marked
            {" "}

            <strong>
              returned
            </strong>

            {" "}
            after delivery.
          </p>
        </div>
      </div>
    );
  }

  const phase = lineFulfillmentPhase(
    fs,
  );

  const allDelivered = fs === "delivered";

  const placed = formatDateShort(
    orderPlacedAt,
  );

  return (

    <div className="odl-mini-track">

      <div
        className="odl-track-flex"
        role="list"
        aria-label="Item fulfillment"
      >

        {
          LINE_TRACK_STEPS.map(
            (
              step,
              i,
            ) => {

              const kind = (

                () => {

                  if (
                    allDelivered
                  ) {

                    return "done";
                  }

                  if (
                    i < phase
                  ) {

                    return "done";
                  }

                  if (
                    i === phase
                  ) {

                    return "current";
                  }

                  return "upcoming";
                }
              )();

              const labelClass = [
                "odl-track-label",
                kind === "current"
                  ? "odl-track-label--current"
                  : "",
                kind === "done"
                  ? "odl-track-label--done"
                  : "",
              ].filter(
                Boolean,
              ).join(
                " ",
              );

              const dotClass = [
                "odl-track-dot",
                kind === "done"
                  ? "odl-track-dot--done"
                  : "",
                kind === "current"
                  ? "odl-track-dot--current"
                  : "",
                kind === "upcoming"
                  ? "odl-track-dot--upcoming"
                  : "",
              ].filter(
                Boolean,
              ).join(
                " ",
              );

              const barIdx = i - 1;

              const barOn = (

                allDelivered
                  ? barIdx < 3
                  : barIdx < phase
              );

              const meta = (

                kind === "done" &&
                i === 0 &&
                orderPlacedAt
              )
                ? placed
                : "";

              return (

                <div key={step.key} style={{ display: "contents" }}>

                  {
                    i > 0 && (

                      <div
                        className={
                          `odl-track-bar${
                            barOn
                              ? " odl-track-bar--on"
                              : ""
                          }`
                        }
                        aria-hidden
                      />
                    )
                  }

                  <div
                    className="odl-track-col"
                    role="listitem"
                  >

                    <div className={dotClass}>

                      {
                        kind === "done"
                          ? (
                            <Check size={14} strokeWidth={2.5} aria-hidden />
                          )
                          : null
                      }
                    </div>

                    <div className={labelClass}>
                      {step.label}
                    </div>

                    <div className="odl-track-meta">
                      {meta}
                    </div>
                  </div>
                </div>
              );
            },
          )
        }
      </div>

      {
        line.open_return && (

          <p className="odl-mini-track-note">
            {line.open_return.status === "approved"
              ? "Return approved — follow any instructions we sent by email."
              : "Return request submitted — we will notify you when it is reviewed."}
          </p>
        )
      }

      <RejectedReturnNotice
        lastReturn={line.last_return}
      />
    </div>
  );
}

function lineStatusBadgeClass(
  line,
) {

  if (
    line.status === "cancelled"
  ) {

    return "odl-status-badge--cancelled";
  }

  const fs = line.fulfillment_status || "pending";

  if (
    fs === "returned"
  ) {

    return "odl-status-badge--returned";
  }

  if (
    fs === "delivered"
  ) {

    return "odl-status-badge--delivered";
  }

  if (
    fs === "out_for_delivery"
  ) {

    return "odl-status-badge--ofd";
  }

  if (
    fs === "shipped"
  ) {

    return "odl-status-badge--shipped";
  }

  return "odl-status-badge--pending";
}

function lineStatusLabel(
  line,
) {

  if (
    line.status === "cancelled"
  ) {

    return "Cancelled";
  }

  const fs = line.fulfillment_status || "pending";

  return FULFILLMENT_LABELS[
    fs
  ] ||
    fs;
}

export default function OrderDetail() {

  const { orderNumber } = useParams();

  const location = useLocation();

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

  const [
    returnTargetLineId,
    setReturnTargetLineId,
  ] = useState(null);

  const [
    returnReason,
    setReturnReason,
  ] = useState("");

  const [
    returnBusy,
    setReturnBusy,
  ] = useState(false);

  const [
    returnModalError,
    setReturnModalError,
  ] = useState(null);

  const [
    trackingLineId,
    setTrackingLineId,
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
  }, [orderNumber, location.key]);

  const refetchOrder = useCallback(
    async () => {

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
    },
    [orderNumber],
  );

  useEffect(
    () => {

      const onPageShow = (
        e,
      ) => {

        if (
          e.persisted &&
          orderNumber
        ) {

          refetchOrder();
        }
      };

      window.addEventListener(
        "pageshow",
        onPageShow,
      );

      return () => {

        window.removeEventListener(
          "pageshow",
          onPageShow,
        );
      };
    },
    [
      orderNumber,
      refetchOrder,
    ],
  );

  const canCancelLine = (line) =>
    line.status === "active" &&
    (line.fulfillment_status || "pending") === "pending";

  const canCancelEntireOrder =
    order &&
    (order.lines || []).some(
      (l) =>
        l.status === "active",
    ) &&
    (order.lines || []).every(
      (l) =>
        l.status !== "active" ||
        (l.fulfillment_status || "pending") === "pending",
    );

  const openReturnModal = (lineId) => {

    setReturnModalError(null);

    setReturnReason("");

    setReturnTargetLineId(lineId);
  };

  const closeReturnModal = () => {

    if (returnBusy) {

      return;
    }

    setReturnTargetLineId(null);

    setReturnReason("");

    setReturnModalError(null);
  };

  const submitReturn = async () => {

    if (!order?.order_number || !returnTargetLineId) {

      return;
    }

    const r = returnReason.trim();

    if (!r) {

      setReturnModalError("Please enter a return reason.");

      return;
    }

    setReturnBusy(true);

    setReturnModalError(null);

    try {

      const data = await submitReturnRequest(
        order.order_number,
        returnTargetLineId,
        { reason: r },
      );

      setOrder(
        data,
      );

      setReturnTargetLineId(null);

      setReturnReason("");
    } catch (err) {

      setReturnModalError(

        formatProductApiError(
          err.response?.data,
        ) ||

          err.message ||

          "Could not submit return.",
      );
    } finally {

      setReturnBusy(false);
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

  const openCancelOrderModal = () => {

    if (
      !canCancelEntireOrder
    ) {

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

    const line = order?.lines?.find(
      (l) =>
        l.id === lineId,
    );

    if (
      !line ||
      !canCancelLine(
        line,
      )
    ) {

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

            <div className="odl-page">

              <nav className="odl-breadcrumb" aria-label="Breadcrumb">

                <Link to="/profile">
                  My account
                </Link>

                <span>
                  /
                </span>

                <Link to="/orders">
                  My orders
                </Link>

                <span>
                  /
                </span>

                <span aria-current="page">
                  Order #
                  {order.order_number}
                </span>
              </nav>

              <div className="odl-hero">

                <div>

                  <h1 className="odl-hero-title">
                    Order #
                    {order.order_number}
                  </h1>

                  <p className="odl-hero-sub">
                    Placed on
                    {" "}

                    {formatDateShort(
                      order.placed_at,
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  className="odl-btn-invoice"
                  disabled={invoiceBusy}
                  onClick={handleDownloadInvoice}
                >

                  <Download size={18} aria-hidden />

                  {invoiceBusy
                    ? "Preparing…"
                    : "Download invoice"}
                </button>
              </div>

              {
                order.cancelled_at && (

                  <p
                    style={{
                      margin: "0 0 1rem",
                      fontSize: "0.9rem",
                      color: "#7a4a4a",
                    }}
                  >

                    <strong>
                      Cancelled on:
                    </strong>

                    {" "}

                    {new Date(order.cancelled_at).toLocaleString()}

                    {order.cancellation_reason
                      ? (
                        <>
                            {" "}
                            —
                            {" "}
                            {order.cancellation_reason}
                          </>
                        )
                      : null}
                  </p>
                )
              }

              <div className="odl-meta-strip">

                <strong>
                  Order status:
                </strong>

                {" "}

                {STATUS_LABELS[order.status] || order.status}

                {" · "}

                <strong>
                  Payment:
                </strong>

                {" "}

                {PAYMENT_LABELS[order.payment_method] || order.payment_method}

                {paymentStatusFollowLine(order)
                  ? (
                    <>
                      {" "}
                      (
                      {paymentStatusFollowLine(order)}
                      )
                    </>
                  )
                  : null}
              </div>

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

                {
                  canCancelEntireOrder && (

                    <button
                      type="button"
                      className="checkout-btn-secondary order-cancel-order-btn"
                      disabled={invoiceBusy}
                      onClick={openCancelOrderModal}
                    >
                      Cancel entire order
                    </button>
                  )
                }
              </div>

              <OrderProgressStepper order={order} />

              <div className="odl-cards-row">

                <div className="odl-info-card">

                  <h3>
                    Shipping address
                  </h3>

                  <p>

                    <strong>
                      {order.shipping_name}
                    </strong>

                    {order.shipping_phone
                      ? (
                        <>
                          {" · "}
                          {order.shipping_phone}
                        </>
                      )
                      : null}

                    <br />

                    {[
                      order.shipping_address_line,
                      order.shipping_city,
                      `${order.shipping_state} ${order.shipping_pincode}`,
                    ].filter(Boolean).join(", ")}
                  </p>
                </div>

                <div className="odl-info-card">

                  <h3>
                    Payment method
                  </h3>

                  <p>
                    {PAYMENT_LABELS[order.payment_method] || order.payment_method}

                    {paymentStatusFollowLine(order)
                      ? (
                        <>
                          <br />

                          <span style={{ fontSize: "0.85rem", color: "#6b635c" }}>
                            Payment status:
                            {" "}

                            {paymentStatusFollowLine(order)}
                          </span>
                        </>
                      )
                      : order.payment_method === "cod"
                        ? (
                          <>
                            <br />

                            <span style={{ fontSize: "0.85rem", color: "#6b635c" }}>
                              Payment is collected when your order is delivered.
                            </span>
                          </>
                        )
                      : null}
                  </p>
                </div>
              </div>

              <div className="odl-summary-card">

                <div className="odl-summary-head">

                  <h2>
                    Order summary
                  </h2>
                </div>

                  {
                    (order.lines || []).map(
                      (line) => {

                      const lineCancelled = line.status === "cancelled";

                      const fs = line.fulfillment_status || "pending";

                      const canReturn =
                        !lineCancelled &&
                        line.status === "active" &&
                        fs === "delivered" &&
                        !line.has_return_request;

                      const img = lineImageSrc(line.image_url);

                      const trackingOpen = trackingLineId === line.id;

                        return (

                        <div
                          key={line.id}
                          className="odl-line-block"
                        >

                          <div className="odl-line-row">

                            {
                              img
                                ? (
                                  <img
                                    className="odl-line-thumb"
                                    src={img}
                                    alt=""
                                  />
                                )
                                : (
                                  <div
                                    className="odl-line-thumb odl-line-thumb--empty"
                                    aria-hidden
                                  >
                                    No image
                                  </div>
                                )
                            }

                            <div>

                              <p className="odl-line-name">
                              {line.product_name}
                              </p>

                              <p className="odl-line-variant">
                                {line.variant_name}
                                {" · SKU "}
                                {line.sku}
                              </p>

                              {
                                lineCancelled && line.cancellation_reason
                                  ? (
                                    <p className="odl-line-variant" style={{ color: "#991b1b" }}>
                                      {line.cancellation_reason}
                                    </p>
                                  )
                                  : null
                              }

                              <button
                                type="button"
                                className={
                                  `odl-status-badge ${lineStatusBadgeClass(line)}${trackingOpen ? " odl-status-badge--open" : ""}`
                                }
                                aria-expanded={trackingOpen}
                                onClick={() => {

                                  setTrackingLineId(
                                    (prev) =>
                                      prev === line.id
                                        ? null
                                        : line.id,
                                  );
                                }}
                              >

                                <span aria-hidden>
                                  ●
                                </span>

                                {" "}

                                {String(
                                  lineStatusLabel(
                                    line,
                                  ),
                                ).toUpperCase()}

                                <ChevronDown
                                  size={16}
                                  className={
                                    `odl-chevron${trackingOpen ? " odl-chevron--up" : ""}`
                                  }
                                  aria-hidden
                                />
                              </button>

                              {
                                line.open_return && (

                                  <p className="odl-line-variant" style={{ color: "#8b6914", marginTop: "0.35rem" }}>
                                    {line.open_return.status === "approved"
                                      ? "Return approved"
                                      : "Return requested"}
                                  </p>
                                )
                              }

                              <RejectedReturnNotice
                                lastReturn={line.last_return}
                                className="odl-line-variant"
                              />
                            </div>

                            <div className="odl-line-side">

                              <div className="odl-line-qty-price">

                                <span>
                                  Qty:
                                  {" "}
                            {line.quantity}
                                </span>

                                <strong>
                            ₹
                            {formatMoney(line.line_total)}
                                </strong>
                              </div>

                              <div className="odl-line-actions">

                            {
                                  canCancelLine(line) && (

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
                                }

                                {
                                  canReturn && (

                                    <button
                                      type="button"
                                      className="checkout-btn-secondary"
                                      style={{ fontSize: "0.78rem" }}
                                      onClick={() => {

                                        openReturnModal(
                                          line.id,
                                        );
                                      }}
                                    >
                                      Request return
                                    </button>
                                  )
                                }
                              </div>
                            </div>
                          </div>

                          {
                            trackingOpen && (

                              <div className="odl-line-tracking">

                                <LineItemTracking
                                  line={line}
                                  orderPlacedAt={order.placed_at}
                                />
                              </div>
                            )
                          }
                        </div>
                      );
                    },
                  )
                }

                <div className="odl-totals">

                  <div>

                    <div className="odl-total-row">

                      <span>
                    Subtotal
                      </span>

                      <span>
                    ₹
                    {formatMoney(order.subtotal)}
                      </span>
                </div>

                    <div className="odl-total-row">

                      <span>
                        Shipping
                      </span>

                      <span>
                        {Number(order.shipping_total) === 0
                          ? "Free"
                          : `₹${formatMoney(order.shipping_total)}`}
                      </span>
                </div>

                    <div className="odl-total-row">

                      <span>
                        Tax
                      </span>

                      <span>
                        ₹
                        {formatMoney(order.tax_total)}
                      </span>
                </div>

                    <div className="odl-total-row">

                      <span>
                    Discounts
                      </span>

                      <span>
                    ₹
                    {formatMoney(order.discount_total)}
                      </span>
                </div>

                    <div className="odl-total-final">

                <span>
                        Total
                </span>

                <span>
                  ₹
                  {formatMoney(order.grand_total)}
                </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="odl-toolbar-links">

                <Link to="/orders">
                  My orders
                </Link>

                <Link to="/purchases">
                  My purchases
                </Link>

                <Link to="/shop">
                  Continue shopping
                </Link>
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

            {
              returnTargetLineId !== null && (

                <div
                  className="order-cancel-overlay"
                  role="presentation"
                  onClick={closeReturnModal}
                >

                  <div
                    className="order-cancel-dialog"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="order-return-title"
                    onClick={(e) => {

                      e.stopPropagation();
                    }}
                  >

                    <h2
                      id="order-return-title"
                      className="checkout-panel-title artisan-font-serif"
                      style={{ marginTop: 0 }}
                    >

                      Request return
                    </h2>

                    <p className="order-cancel-dialog-hint">

                      Returns require a reason. An administrator will review your
                      request before stock is adjusted.
                    </p>

                    <label
                      className="order-cancel-label"
                      htmlFor="order-return-reason"
                    >

                      Reason (required)
                    </label>

                    <textarea
                      id="order-return-reason"
                      className="order-cancel-textarea"
                      rows={4}
                      maxLength={2000}
                      value={returnReason}
                      onChange={(e) => {

                        setReturnReason(
                          e.target.value,
                        );
                      }}
                    />

                    {
                      returnModalError && (

                        <div
                          className="shop-banner error cart-bag-banner"
                          role="alert"
                          style={{ marginBottom: "0.75rem" }}
                        >

                          {returnModalError}
                        </div>
                      )
                    }

                    <div className="order-cancel-dialog-actions">

                      <button
                        type="button"
                        className="checkout-btn-secondary"
                        disabled={returnBusy}
                        onClick={closeReturnModal}
                      >

                        Close
                      </button>

                      <button
                        type="button"
                        className="checkout-btn-primary order-cancel-confirm-btn"
                        disabled={returnBusy}
                        onClick={submitReturn}
                      >

                        {
                          returnBusy
                            ? "Submitting…"
                            : "Submit return"
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
