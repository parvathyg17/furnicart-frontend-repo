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

  const fs = line.fulfillment_status || "pending";

  return FULFILLMENT_LABELS[
    fs
  ] ||
    fs;
}
