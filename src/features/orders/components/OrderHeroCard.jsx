import { Download } from "lucide-react";

import { formatDateShort } from "../../../utils/date.js";

import { STATUS_LABELS, orderStatusPillClass } from "../orderUi.js";

import OrderProgressStepper from "./OrderProgressStepper.jsx";

export default function OrderHeroCard({
  order,
  invoiceBusy,
  onDownloadInvoice,
  canDownloadInvoice,
  canCancelEntireOrder,
  onCancelEntireOrder,
}) {
  return (
    <div className="odl-hero-card">
      <div className="odl-hero-top">
        <div className="odl-hero-headings">
          <h1 className="odl-hero-title">Order #{order.order_number}</h1>

          <p className="odl-hero-sub">
            Placed on {formatDateShort(order.placed_at)}
          </p>
        </div>

        <div className="odl-hero-actions">
          <span className={`odl-pill ${orderStatusPillClass(order.status)}`}>
            {STATUS_LABELS[order.status] || order.status}
          </span>

          {canDownloadInvoice && (
            <button
              type="button"
              className="odl-btn-invoice"
              disabled={invoiceBusy}
              onClick={onDownloadInvoice}
            >
              <Download size={16} aria-hidden />

              {invoiceBusy ? "Preparing…" : "Download invoice"}
            </button>
          )}
        </div>
      </div>

      {order.cancelled_at && (
        <p className="odl-hero-cancelled">
          <strong>Cancelled on</strong>{" "}
          {new Date(order.cancelled_at).toLocaleString()}
          {order.cancellation_reason ? (
            <>
              {" — "}
              {order.cancellation_reason}
            </>
          ) : null}
        </p>
      )}

      <OrderProgressStepper order={order} />

      {canCancelEntireOrder && (
        <div className="odl-hero-cancel-row">
          <button
            type="button"
            className="checkout-btn-secondary order-cancel-order-btn"
            disabled={invoiceBusy}
            onClick={onCancelEntireOrder}
          >
            Cancel entire order
          </button>
        </div>
      )}
    </div>
  );
}
