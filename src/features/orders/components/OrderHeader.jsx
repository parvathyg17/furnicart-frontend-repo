import {
  Link,
} from "react-router-dom";

import {
  Download,
} from "lucide-react";

import {
  formatDateShort,
} from "../../../utils/date.js";

import {
  PAYMENT_LABELS,
  STATUS_LABELS,
  paymentStatusFollowLine,
} from "../orderUi.js";

export default function OrderHeader(
  {
    order,
    invoiceBusy,
    onDownloadInvoice,
    canCancelEntireOrder,
    onCancelEntireOrder,
  },
) {

  return (

    <>

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
          onClick={onDownloadInvoice}
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
              onClick={onCancelEntireOrder}
            >
              Cancel entire order
            </button>
          )
        }
      </div>
    </>
  );
}
