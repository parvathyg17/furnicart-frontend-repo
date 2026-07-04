import {
  formatMoney,
} from "../../utils/currency.js";

export const PAYMENT_LABELS = {
  cod: "Cash on delivery",
  razorpay: "Razorpay",
  wallet: "Wallet",
  other: "Other",
};

export const PAYMENT_STATUS_LABELS = {
  pending: "Pending",
  processing: "Processing",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
  partially_refunded: "Partially refunded",
};

export const DELIVERY_CHARGE_NON_REFUNDABLE_NOTE =
  "Delivery charges are not refundable on partial cancellations or returns.";

export const INVOICE_UNAVAILABLE_NOTE =
  "Invoice is not available after any item has been cancelled, returned, or refunded.";

/**
 * Invoice PDF is only available while the order is unchanged since placement —
 * no partial or full cancellations, returns, or refunds.
 */
export function canDownloadOrderInvoice(
  order,
) {

  if (
    !order
  ) {

    return false;
  }

  if (
    order.status === "cancelled" ||
    order.status === "partially_cancelled"
  ) {

    return false;
  }

  if (
    order.payment_status === "partially_refunded" ||
    order.payment_status === "refunded"
  ) {

    return false;
  }

  if (
    Number(
      order.refunded_total ?? 0,
    ) > 0
  ) {

    return false;
  }

  const lines = order.lines || [];

  return !lines.some(
    (line) =>
      line.status === "cancelled" ||
      line.fulfillment_status === "returned" ||
      Number(
        line.cancelled_quantity ?? 0,
      ) > 0 ||
      Number(
        line.returned_quantity ?? 0,
      ) > 0,
  );
}

export function orderHasPaidDeliveryCharge(
  order,
) {

  return Number(
    order?.shipping_total ?? 0,
  ) > 0;
}

/**
 * Full-order cancellations refund the entire grand total, including shipping.
 * For partial cancellations and returns, the delivery charge is retained.
 */
export function showDeliveryChargeNonRefundableNote(
  order,
  {
    refundSummary = false,
  } = {},
) {

  if (
    !orderHasPaidDeliveryCharge(
      order,
    )
  ) {

    return false;
  }

  if (
    refundSummary
  ) {

    if (
      Number(
        order?.refunded_total ?? 0,
      ) <= 0
    ) {

      return false;
    }

    return order.status !== "cancelled";
  }

  return true;
}

/**
 * Extra payment line for the customer UI. COD orders stay ``pending`` until
 * delivery — showing raw ``pending`` looks like an error, so we omit it.
 */
export function paymentStatusFollowLine(
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

export const STATUS_LABELS = {
  pending: "Pending",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  partially_cancelled: "Partially cancelled",
  partially_shipped: "Partially shipped",
  partially_delivered: "Partially delivered",
};

export function orderStatusPillClass(
  status,
) {

  if (
    status === "cancelled"
  ) {

    return "odl-pill--cancelled";
  }

  if (
    status === "partially_cancelled"
  ) {

    return "odl-pill--partial";
  }

  if (
    status === "delivered" ||
    status === "partially_delivered"
  ) {

    return "odl-pill--delivered";
  }

  if (
    status === "shipped" ||
    status === "out_for_delivery" ||
    status === "partially_shipped"
  ) {

    return "odl-pill--progress";
  }

  return "odl-pill--pending";
}

export const FULFILLMENT_LABELS = {
  pending: "Pending",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  returned: "Returned",
};

export const ORDER_TRACK_STEPS = [
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

export const LINE_TRACK_STEPS = [
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

export function resolveOrderTracker(
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

export function orderBarFilled(
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

export function orderStepDotKind(
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

export function lineFulfillmentPhase(
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

export function lineStatusBadgeClass(
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

export function lineStatusLabel(
  line,
) {

  if (
    line.status === "cancelled"
  ) {

    return "Cancelled";
  }

  const returnedQty = Number(
    line.returned_quantity ?? 0,
  );

  const deliverable = Number(
    line.quantity ?? 0,
  ) - Number(
    line.cancelled_quantity ?? 0,
  );

  if (
    returnedQty > 0
    && deliverable > 0
    && returnedQty < deliverable
  ) {

    return "Partially returned";
  }

  const fs = line.fulfillment_status || "pending";

  return FULFILLMENT_LABELS[
    fs
  ] ||
    fs;
}

/**
 * Immutable placed-order breakdown from per-line values and original_paid.
 * Stays fixed after cancellations or returns (mirrors admin order summary).
 */
export function computeOriginalOrderBreakdown(
  order,
) {

  const lines = order?.lines || [];

  const originalPaid = Number(
    order?.original_paid ?? order?.grand_total ?? 0,
  );

  const itemTotals = lines.reduce(
    (
      acc,
      ln,
    ) => {

      acc.price += Number(
        ln.line_total,
      ) ||
        0;

      acc.coupon += Number(
        ln.coupon_share,
      ) ||
        0;

      acc.tax += Number(
        ln.tax_share,
      ) ||
        0;

      acc.offer += Number(
        ln.discount_amount,
      ) ||
        0;

      return acc;
    },
    {
      price: 0,
      coupon: 0,
      tax: 0,
      offer: 0,
    },
  );

  const origItemsNet = itemTotals.price;

  const origOfferNum = itemTotals.offer;

  const origItemsGross = origItemsNet + origOfferNum;

  const origTaxNum = itemTotals.tax;

  const origCouponNum = itemTotals.coupon;

  const origShippingNum = Math.max(
    0,
    Math.round(
      (originalPaid
        - origItemsNet
        - origTaxNum
        + origCouponNum) * 100,
    ) / 100,
  );

  return {
    originalPaid,
    origItemsNet,
    origOfferNum,
    origItemsGross,
    origTaxNum,
    origCouponNum,
    origShippingNum,
  };
}

/**
 * COD returns are settled in cash at pickup — not via wallet credits.
 */
export function isCodOrder(
  order,
) {

  return order?.payment_method === "cod";
}

export function codReturnRefundStatusLabel(
  order,
) {

  if (
    !isCodOrder(
      order,
    )
  ) {

    return null;
  }

  const lines = order?.lines || [];

  const activeLines = lines.filter(
    (line) =>
      line.status !== "cancelled",
  );

  const returnedLines = activeLines.filter(
    (line) =>
      (line.returned_quantity ?? 0) > 0
      || line.fulfillment_status === "returned",
  );

  if (
    returnedLines.length <= 0
  ) {

    return null;
  }

  const allReturned = activeLines.length > 0
    && activeLines.every(
      (line) => {
        const deliverable = (line.quantity ?? 0)
          - (line.cancelled_quantity ?? 0);

        return deliverable > 0
          && (line.returned_quantity ?? 0) >= deliverable;
      },
    );

  return allReturned
    ? "Refunded"
    : "Partially refunded";
}

export function codReturnRefundNote(
  order,
  amount,
) {

  const label = codReturnRefundStatusLabel(
    order,
  );

  if (
    !label
  ) {

    return null;
  }

  const amt = Number(
    amount ?? order?.return_refund_total ?? order?.refunded_total ?? 0,
  );

  if (
    Number.isNaN(
      amt,
    )
    || amt <= 0
  ) {

    return "Cash on delivery — amount refunded when the item was picked up.";
  }

  return `Cash on delivery — ₹${formatMoney(
    amt,
  )} refunded when the item was picked up.`;
}
