import {
  ChevronDown,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  formatMoney,
} from "../../../utils/currency.js";

import {
  resolveMediaUrl,
} from "../../../utils/mediaUrl.js";

import {
  lineStatusBadgeClass,
  lineStatusLabel,
} from "../orderUi.js";

import LineItemTracking from "./LineItemTracking.jsx";

import RejectedReturnNotice from "./RejectedReturnNotice.jsx";

export default function OrderItemsList(
  {
    order,
    trackingLineId,
    onToggleTracking,
    canCancelLine,
    onOpenCancelLine,
    onOpenReturn,
  },
) {

  return (

    <>
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

            const canReview =
              !lineCancelled &&
              line.status === "active" &&
              fs === "delivered" &&
              line.product_slug;

            const img = resolveMediaUrl(line.image_url);

            const trackingOpen = trackingLineId === line.id;

            const refundAmt = Number(
              line.refund_amount ?? 0,
            );

            const hasRefund = refundAmt > 0;

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

                        onToggleTracking(line.id);
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

                      {
                        hasRefund && (

                          <span className="odl-line-refund">
                            Refunded ₹
                            {formatMoney(
                              refundAmt,
                            )}
                          </span>
                        )
                      }
                    </div>

                    <div className="odl-line-actions">

                      {
                        canCancelLine(line) && (

                          <button
                            type="button"
                            className="order-cancel-line-btn"
                            onClick={() => {

                              onOpenCancelLine(line.id);
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

                              onOpenReturn(line.id);
                            }}
                          >
                            Request return
                          </button>
                        )
                      }

                      {
                        canReview && (

                          <Link
                            className="checkout-btn-secondary"
                            style={{
                              fontSize: "0.78rem",
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            to={`/shop/product/${encodeURIComponent(line.product_slug)}?writeReview=1`}
                          >
                            Write a review
                          </Link>
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
    </>
  );
}
