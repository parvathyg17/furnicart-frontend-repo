import "../../styles/admin-orders.css";

import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  Check,
  Package,
  Truck,
  Circle,
} from "lucide-react";

import {
  fetchAdminOrder,
  patchAdminLineFulfillment,
  postAdminCancelOrder,
} from "../../features/admin/adminAPI";

import {
  useBackgroundServerSync,
} from "../../hooks/useBackgroundServerSync.js";

import {
  stableStringify,
} from "../../utils/stableStringify.js";

const IMAGE_BASE = (
  import.meta.env.VITE_API_URL || ""
).replace(
  /\/$/,
  "",
);

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
  },
  {
    key: "shipped",
    label: "SHIPPED",
  },
  {
    key: "out_for_delivery",
    label: "OUT FOR DELIVERY",
  },
  {
    key: "delivered",
    label: "DELIVERED",
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

function formatMoney(
  v,
) {

  const n = Number(
    v,
  );

  if (
    Number.isNaN(
      n,
    )
  ) {

    return String(
      v ?? "—",
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

function initialsFromEmail(
  email,
) {

  if (
    !email ||
    typeof email !== "string"
  ) {

    return "?";
  }

  const local = email.split(
    "@",
  )[
    0
  ] ||
    email;

  const parts = local.split(
    /[._-]+/,
  ).filter(
    Boolean,
  );

  if (
    parts.length >= 2
  ) {

    return (
      (
        parts[
          0
        ][
          0
        ] +
        parts[
          1
        ][
          0
        ]
      ).toUpperCase()
    );
  }

  return local.slice(
    0,
    2,
  ).toUpperCase();
}

function displayNameFromEmail(
  email,
) {

  if (
    !email ||
    typeof email !== "string"
  ) {

    return "Customer";
  }

  const local = email.split(
    "@",
  )[
    0
  ] ||
    email;

  return local
    .replace(
      /[._-]+/g,
      " ",
    )
    .split(
      " ",
    )
    .filter(
      Boolean,
    )
    .map(
      (
        w,
      ) =>
        w.charAt(
          0,
        ).toUpperCase() +
        w.slice(
          1,
        ),
    )
    .join(
      " ",
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

function formatPlacedAt(
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

  return d.toLocaleString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  );
}

function resolveTracker(
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

function barFilled(
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

function stepDotKind(
  stepIndex,
  {
    cancelled,
    phase,
    allDelivered,
  },
) {

  if (
    cancelled
  ) {

    return "void";
  }

  if (
    allDelivered
  ) {

    return "done";
  }

  if (
    stepIndex < phase
  ) {

    return "done";
  }

  if (
    stepIndex === phase
  ) {

    return "current";
  }

  return "upcoming";
}

function stepDotIcon(
  kind,
  stepIndex,
) {

  if (
    kind === "done"
  ) {

    return (
      <Check
        size={16}
        strokeWidth={2.5}
        aria-hidden
      />
    );
  }

  if (
    kind === "void"
  ) {

    return (
      <Circle
        size={16}
        aria-hidden
      />
    );
  }

  if (
    kind === "current"
  ) {

    if (
      stepIndex === 0 ||
      stepIndex === 3
    ) {

      return (
        <Package
          size={16}
          aria-hidden
        />
      );
    }

    return (
      <Truck
        size={16}
        aria-hidden
      />
    );
  }

  if (
    stepIndex === 3
  ) {

    return (
      <Package
        size={16}
        aria-hidden
      />
    );
  }

  return (
    <Circle
      size={16}
      aria-hidden
    />
  );
}

function paymentSummary(
  method,
  paymentStatus,
) {

  const label = PAYMENT_LABEL[
    method
  ] ||
    method ||
    "—";

  if (
    !paymentStatus ||
    paymentStatus === "pending"
  ) {

    return label;
  }

  return `${label} · ${paymentStatus}`;
}

function shippingBlock(
  order,
) {

  const parts = [
    order.shipping_address_line,
    [
      order.shipping_city,
      order.shipping_state,
      order.shipping_pincode,
    ].filter(
      Boolean,
    ).join(
      ", ",
    ),
  ].filter(
    Boolean,
  );

  return parts.join(
    "\n",
  ) ||
    "—";
}

function fulfillmentPillClass(
  fs,
) {

  if (
    fs === "delivered"
  ) {

    return "aod-pill aod-pill--delivered";
  }

  if (
    fs === "shipped"
  ) {

    return "aod-pill aod-pill--shipped";
  }

  if (
    fs === "out_for_delivery"
  ) {

    return "aod-pill aod-pill--ofd";
  }

  if (
    fs === "returned"
  ) {

    return "aod-pill aod-pill--returned";
  }

  return "aod-pill aod-pill--pending";
}

function canAdminCancelEntireOrder(
  order,
) {

  if (
    !order ||
    order.status === "cancelled"
  ) {

    return false;
  }

  const lines = order.lines || [];

  const active = lines.filter(
    (
      ln,
    ) =>
      ln.status === "active",
  );

  if (
    active.length === 0
  ) {

    return false;
  }

  return active.every(
    (
      ln,
    ) =>
      (ln.fulfillment_status || "pending") === "pending",
  );
}

export default function AdminOrderDetail() {

  const {
    orderNumber,
  } = useParams();

  const [
    order,
    setOrder,
  ] = useState(
    null,
  );

  const [
    err,
    setErr,
  ] = useState(
    null,
  );

  const [
    busyLine,
    setBusyLine,
  ] = useState(
    null,
  );

  const [
    cancelModalOpen,
    setCancelModalOpen,
  ] = useState(
    false,
  );

  const [
    cancelReason,
    setCancelReason,
  ] = useState(
    "",
  );

  const [
    cancelBusy,
    setCancelBusy,
  ] = useState(
    false,
  );

  const lastOrderSigRef =
    useRef(
      null,
    );

  const load =
    useCallback(
      async (
        { silent = false } = {},
      ) => {

        if (!silent) {

          setErr(
            null,
          );
        }

        try {

          const data =
            await fetchAdminOrder(
              decodeURIComponent(
                orderNumber,
              ),
            );

          const snap =
            stableStringify(
              data,
            );

          if (
            silent &&
            lastOrderSigRef.current ===
              snap
          ) {

            return;
          }

          lastOrderSigRef.current =
            snap;

          setOrder(
            data,
          );
        } catch (e) {

          if (!silent) {

            setErr(
              e.response?.data?.detail ||
                "Order not found.",
            );
          }
        }
      },

      [
        orderNumber,
      ],
    );

  useEffect(
    () => {

      lastOrderSigRef.current =
        null;

      load();
    },
    [
      orderNumber,
      load,
    ],
  );

  useBackgroundServerSync(
    {

      enabled: Boolean(
        orderNumber,
      ),

      pollIntervalMs: 90_000,

      onRefresh:
        () =>
          load(
            {
              silent: true,
            },
          ),
    },
  );

  const tracker = useMemo(
    () =>
      order
        ? resolveTracker(
          order.status,
        )
        : null,
    [
      order,
    ],
  );

  const cancelledCount = useMemo(
    () =>
      (order?.lines || []).filter(
        (ln) =>
          ln.status === "cancelled",
      ).length,
    [
      order,
    ],
  );

  const onFulfillmentChange = async (
    lineId,
    value,
  ) => {

    if (
      !order?.order_number
    ) {

      return;
    }

    setBusyLine(
      lineId,
    );

    setErr(
      null,
    );

    try {

      const data = await patchAdminLineFulfillment(
        order.order_number,
        lineId,
        value,
      );

      lastOrderSigRef.current =
        stableStringify(
          data,
        );

      setOrder(
        data,
      );
    } catch (e) {

      const msg = (

        e.response?.data &&
        (
          e.response.data.detail ||
          e.response.data.fulfillment_status?.[
            0
          ] ||
          JSON.stringify(
            e.response.data,
          )
        )
      ) ||
        "Update failed.";

      setErr(
        typeof msg === "string"
          ? msg
          : "Update failed.",
      );
    } finally {

      setBusyLine(
        null,
      );
    }
  };

  const onCancelEntireOrder = async () => {

    if (
      !order?.order_number
    ) {

      return;
    }

    setCancelBusy(
      true,
    );

    setErr(
      null,
    );

    try {

      const data = await postAdminCancelOrder(
        order.order_number,
        cancelReason,
      );

      lastOrderSigRef.current =
        stableStringify(
          data,
        );

      setOrder(
        data,
      );

      setCancelModalOpen(
        false,
      );

      setCancelReason(
        "",
      );
    } catch (e) {

      const msg = (

        e.response?.data &&
        (
          e.response.data.detail ||
          e.response.data.reason?.[
            0
          ] ||
          JSON.stringify(
            e.response.data,
          )
        )
      ) ||
        "Could not cancel order.";

      setErr(
        typeof msg === "string"
          ? msg
          : "Could not cancel order.",
      );
    } finally {

      setCancelBusy(
        false,
      );
    }
  };

  if (
    err &&
    !order
  ) {

    return (

      <div className="aod-page aod-error-page">

        <div
          className="ao-error"
          role="alert"
        >
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

  if (
    !order ||
    !tracker
  ) {

    return (

      <div className="aod-page">

        <div className="aod-loading">
          Loading order…
        </div>

      </div>
    );
  }

  const lines = order.lines || [];

  const email = order.user_email || "";

  const ship = shippingBlock(
    order,
  );

  const couponDiscountNum = Number(
    order.discount_total,
  ) ||
    0;

  const offerDiscountNum = Number(
    order.offer_discount_total,
  ) ||
    0;

  const refundedNum = Number(
    order.refunded_total,
  ) ||
    0;

  const shipNum = Number(
    order.shipping_total,
  ) ||
    0;

  const showAdminCancelOrder = canAdminCancelEntireOrder(
    order,
  );

  return (

    <div className="aod-page">

      <p className="aod-breadcrumb">

        <Link to="/admin/orders">
          Orders
        </Link>

        <span>
          /
        </span>

        Order detail
      </p>

      <h1 className="aod-page-title">
        Order
        {" "}

        <span style={{ color: "var(--ao-brown)" }}>
          #
          {order.order_number}
        </span>
      </h1>

      <p className="aod-placed-line">

        <span style={{ fontWeight: 600, color: "var(--ao-ink)" }}>
          {ORDER_STATUS_LABEL[
            order.status
          ] ||
            order.status}
        </span>

        {" · "}

        Placed
        {" "}

        {formatPlacedAt(
          order.placed_at,
        )}
      </p>

      {
        showAdminCancelOrder && (

          <p style={{ margin: "0 0 1rem" }}>

            <button
              type="button"
              className="ao-btn-ghost"
              style={{
                borderColor: "#b45309",
                color: "#b45309",
              }}
              onClick={() =>
                setCancelModalOpen(
                  true,
                )
              }
            >
              Cancel entire order
            </button>
          </p>
        )
      }

      {
        err && (

          <div
            className="ao-error"
            role="alert"
            style={{ marginBottom: "1rem" }}
          >
            {err}
          </div>
        )
      }

      <div
        className={
          `aod-tracker${
            tracker.cancelled
              ? " aod-tracker--cancelled"
              : ""
          }`
        }
      >

        {
          tracker.cancelled &&
          order.cancellation_reason && (

            <p className="aod-tracker-cancel-note">
              <strong>
                Cancelled.
              </strong>

              {" "}

              {order.cancellation_reason}
            </p>
          )
        }

        <div
          className="aod-track-flex"
          role="list"
          aria-label="Order progress"
        >

          {
            TRACKER_STEPS.map(
              (
                step,
                i,
              ) => {

                const kind = stepDotKind(
                  i,
                  tracker,
                );

                const labelClass = [
                  "aod-step-label",
                  kind === "current"
                    ? "aod-step-label--current"
                    : "",
                  kind === "done"
                    ? "aod-step-label--done"
                    : "",
                ].filter(
                  Boolean,
                ).join(
                  " ",
                );

                const dotClass = [
                  "aod-step-dot",
                  kind === "done"
                    ? "aod-step-dot--done"
                    : "",
                  kind === "current"
                    ? "aod-step-dot--current"
                    : "",
                  kind === "upcoming"
                    ? "aod-step-dot--upcoming"
                    : "",
                  kind === "void"
                    ? "aod-step-dot--void"
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
                  ? formatPlacedAt(
                    order.placed_at,
                  )
                  : "";

                return (

                  <Fragment key={step.key}>

                    {
                      i > 0 && (

                        <div
                          className={
                            `aod-track-bar${
                              barFilled(
                                i - 1,
                                tracker.phase,
                                tracker.allDelivered,
                              )
                                ? " aod-track-bar--on"
                                : ""
                            }`
                          }
                          aria-hidden
                        />
                      )
                    }

                    <div
                      className="aod-track-col"
                      role="listitem"
                    >

                      <div className={dotClass}>

                        {stepDotIcon(
                          kind,
                          i,
                        )}
                      </div>

                      <div className={labelClass}>
                        {step.label}
                      </div>

                      <div className="aod-step-meta">
                        {meta}
                      </div>
                    </div>
                  </Fragment>
                );
              },
            )
          }
        </div>
      </div>

      <div className="aod-grid">

        <div className="aod-items-card">

            <div className="aod-card-head">

              <h2>
                Order items
              </h2>

              <span className="aod-item-count">
                {lines.length}

                {" "}

                {lines.length === 1
                  ? "ITEM"
                  : "ITEMS"}
              </span>
            </div>

            <div className="aod-table-wrap">

              <table className="aod-items-table">

                <thead>

                  <tr>

                    <th>
                      Product
                    </th>

                    <th>
                      SKU
                    </th>

                    <th className="aod-num">
                      Price
                    </th>

                    <th className="aod-num">
                      Qty
                    </th>

                    <th className="aod-num">
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {
                    lines.map(
                      (
                        ln,
                      ) => {

                        const img = lineImageSrc(
                          ln.image_url,
                        );

                        const cancelled = ln.status === "cancelled";

                        const returned = ln.fulfillment_status === "returned";

                        const delivered = ln.fulfillment_status === "delivered";

                        const fs = ln.fulfillment_status || "pending";

                        const locked = cancelled || returned || delivered;

                        const showStrike = cancelled;

                        return (

                          <tr key={ln.id}>

                            <td>

                              <div className="aod-product-cell">

                                {
                                  img
                                    ? (

                                      <img
                                        className="aod-thumb"
                                        src={img}
                                        alt=""
                                      />
                                    )
                                    : (

                                      <div
                                        className="aod-thumb aod-thumb--empty"
                                        aria-hidden
                                      >
                                        No
                                        <br />
                                        image
                                      </div>
                                    )
                                }

                                <div>

                                  <p className="aod-product-name">
                                    {ln.product_name}
                                  </p>

                                  {
                                    ln.variant_name && (

                                      <p className="aod-variant-line">
                                        {ln.variant_name}
                                      </p>
                                    )
                                  }

                                  <div className="aod-status-cell">

                                    {
                                      cancelled && (

                                        <span className="aod-pill aod-pill--cancelled">
                                          Cancelled
                                        </span>
                                      )
                                    }

                                    {
                                      returned && !cancelled && (

                                        <span className={fulfillmentPillClass(
                                          "returned",
                                        )}
                                        >
                                          {FULFILLMENT_LABEL.returned}
                                        </span>
                                      )
                                    }

                                    {
                                      delivered && !cancelled && !returned && (

                                        <span className={fulfillmentPillClass(
                                          "delivered",
                                        )}
                                        >
                                          {FULFILLMENT_LABEL.delivered}
                                        </span>
                                      )
                                    }

                                    {
                                      !locked && (

                                        <div className="aod-fulfill-wrap">

                                          <span className={fulfillmentPillClass(
                                            fs,
                                          )}
                                          style={{ marginBottom: "0.35rem" }}
                                          >
                                            {FULFILLMENT_LABEL[
                                              fs
                                            ] ||
                                              fs}
                                          </span>

                                          <select
                                            className="aod-fulfill-select"
                                            disabled={busyLine === ln.id}
                                            value={fs}
                                            aria-label={`Fulfillment for ${ln.product_name}`}
                                            onChange={(e) =>
                                              onFulfillmentChange(
                                                ln.id,
                                                e.target.value,
                                              )}
                                          >

                                            {
                                              FULFILLMENT_OPTIONS.map(
                                                (
                                                  opt,
                                                ) => (

                                                  <option
                                                    key={opt}
                                                    value={opt}
                                                  >
                                                    {FULFILLMENT_LABEL[
                                                      opt
                                                    ] ||
                                                      opt}
                                                  </option>
                                                ),
                                              )
                                            }
                                          </select>
                                        </div>
                                      )
                                    }

                                    {
                                      cancelled &&
                                      ln.cancellation_reason && (

                                        <p className="aod-line-reason">

                                          <strong>
                                            Reason:
                                          </strong>

                                          {" "}

                                          {ln.cancellation_reason}
                                        </p>
                                      )
                                    }
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td>

                              <span className="aod-mono">
                                {ln.sku || "—"}
                              </span>
                            </td>

                            <td className="aod-num aod-mono">
                              ₹
                              {formatMoney(
                                ln.unit_price,
                              )}
                            </td>

                            <td className="aod-num">
                              {ln.quantity}
                            </td>

                            <td className={`aod-num${showStrike ? " aod-strike" : ""}`}>

                              <strong>
                                ₹
                                {formatMoney(
                                  ln.line_total,
                                )}
                              </strong>
                            </td>
                          </tr>
                        );
                      },
                    )
                  }
                </tbody>
              </table>
            </div>
          </div>

        <aside className="aod-aside">

          <div className="aod-side-card">

            <div className="aod-order-id-row">
              ORDER ID
              <strong>
                #
                {order.order_number}
              </strong>
            </div>

            <div className="aod-customer-row">

              <div className="aod-avatar">
                {initialsFromEmail(
                  email,
                )}
              </div>

              <div>

                <p className="aod-customer-name">
                  {displayNameFromEmail(
                    email,
                  )}
                </p>

                <p className="aod-customer-email">
                  {email || "—"}
                </p>
              </div>
            </div>

            <dl className="aod-kv">

              <dt>
                Shipping address
              </dt>

              <dd style={{ whiteSpace: "pre-line" }}>
                {ship}
              </dd>

              {
                order.shipping_phone && (

                  <>

                    <dt>
                      Phone
                    </dt>

                    <dd>
                      {order.shipping_phone}
                    </dd>
                  </>
                )
              }

              <dt>
                Payment
              </dt>

              <dd>
                {paymentSummary(
                  order.payment_method,
                  order.payment_status,
                )}
              </dd>
            </dl>
          </div>

          <div className="aod-side-card">

            <h3>
              Order summary
            </h3>

            <div className="aod-summary-rows">

              <div className="aod-summary-row">

                <span>
                  {offerDiscountNum > 0
                    ? "Items"
                    : "Subtotal"}
                </span>

                <span>
                  ₹
                  {formatMoney(
                    offerDiscountNum > 0
                      ? (
                        order.subtotal_gross
                        ?? order.subtotal
                      )
                      : order.subtotal,
                  )}
                </span>
              </div>

              {
                offerDiscountNum > 0 && (

                  <div className="aod-summary-row aod-summary-row--deduct">

                    <span>
                      Offer savings
                    </span>

                    <span>
                      −₹
                      {formatMoney(
                        offerDiscountNum,
                      )}
                    </span>
                  </div>
                )
              }

              {
                offerDiscountNum > 0 && (

                  <div className="aod-summary-row">

                    <span>
                      Subtotal
                    </span>

                    <span>
                      ₹
                      {formatMoney(
                        order.subtotal,
                      )}
                    </span>
                  </div>
                )
              }

              <div className="aod-summary-row aod-summary-row--muted">

                <span>
                  Shipping
                </span>

                <span>
                  {shipNum <= 0
                    ? "FREE"
                    : `₹${formatMoney(
                      order.shipping_total,
                    )}`}
                </span>
              </div>

              <div className="aod-summary-row">

                <span>
                  Tax
                </span>

                <span>
                  ₹
                  {formatMoney(
                    order.tax_total,
                  )}
                </span>
              </div>

              {
                couponDiscountNum > 0 && (

                  <div className="aod-summary-row aod-summary-row--deduct">

                    <span>
                      {order.coupon_code
                        ? `Coupon (${order.coupon_code})`
                        : "Coupon"}
                    </span>

                    <span>
                      −₹
                      {formatMoney(
                        order.discount_total,
                      )}
                    </span>
                  </div>
                )
              }

              <div className="aod-summary-total">

                <span>
                  TOTAL
                </span>

                <strong>
                  ₹
                  {formatMoney(
                    order.grand_total,
                  )}
                </strong>
              </div>

              {
                refundedNum > 0 && (

                  <div className="aod-summary-row aod-summary-row--deduct">

                    <span>
                      Refunded
                      {cancelledCount > 0
                        ? ` (${cancelledCount} cancelled)`
                        : ""}
                    </span>

                    <span>
                      −₹
                      {formatMoney(
                        refundedNum,
                      )}
                    </span>
                  </div>
                )
              }
            </div>
          </div>
        </aside>
      </div>

      {
        cancelModalOpen && (

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

              if (
                !cancelBusy
              ) {

                setCancelModalOpen(
                  false,
                );
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
              onClick={(e) =>
                e.stopPropagation()
              }
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

              <p style={{ margin: "0 0 1rem", fontSize: "0.9rem", color: "#57534e" }}>
                This cancels every line that is still unshipped and restores stock.
                Optional note for the record.
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
                onChange={(e) =>
                  setCancelReason(
                    e.target.value,
                  )
                }
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  marginBottom: "1rem",
                }}
              />

              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>

                <button
                  type="button"
                  className="ao-btn-ghost"
                  disabled={cancelBusy}
                  onClick={() =>
                    setCancelModalOpen(
                      false,
                    )
                  }
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
        )
      }
    </div>
  );
}
