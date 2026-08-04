import { Link } from "react-router-dom";

import { formatMoney } from "../../../utils/currency.js";

import { resolveMediaUrl } from "../../../utils/mediaUrl.js";

import { gstPercentLabel } from "../../checkout/checkoutUtils.js";

import { lineStatusBadgeClass, lineStatusLabel } from "../orderUi.js";

import LineItemTracking from "./LineItemTracking.jsx";

import RejectedReturnNotice from "./RejectedReturnNotice.jsx";

export default function OrderItemsList({
  order,
  canCancelLine,
  onOpenCancelLine,
  onOpenReturn,
}) {
  const gstPct = gstPercentLabel(order?.gst_rate) ?? 18;

  return (
    <div className="odl-items">
      {(order.lines || []).map((line) => {
        const lineCancelled = line.status === "cancelled";

        const fs = line.fulfillment_status || "pending";

        const canReturn =
          !lineCancelled &&
          line.status === "active" &&
          fs === "delivered" &&
          (line.returnable_quantity ?? 0) > 0;

        const orderedQty = Number(line.quantity ?? 1);

        const cancelledQty = Number(line.cancelled_quantity ?? 0);

        const returnedQty = Number(line.returned_quantity ?? 0);

        const activeQty = Number(
          line.active_quantity ??
            Math.max(0, orderedQty - cancelledQty - returnedQty),
        );

        const cancellableQty = Number(
          line.cancellable_quantity ?? Math.max(0, orderedQty - cancelledQty),
        );

        const canReview =
          !lineCancelled &&
          line.status === "active" &&
          fs === "delivered" &&
          line.product_slug;

        const img = resolveMediaUrl(line.image_url);

        const refundAmt = Number(line.refund_amount ?? 0);

        const hasRefund = refundAmt > 0;

        const taxShare = Number(line.tax_share ?? line.tax_amount ?? 0);

        const couponShare = Number(line.coupon_share ?? 0);

        const basePrice = Number(line.line_total ?? 0);

        const itemSubtotal = basePrice + taxShare - couponShare;

        return (
          <div
            key={line.id}
            className={`odl-item-card${
              lineCancelled ? " odl-item-card--cancelled" : ""
            }`}
          >
            <div className="odl-item-head">
              {img ? (
                <img className="odl-item-thumb" src={img} alt="" />
              ) : (
                <div
                  className="odl-item-thumb odl-item-thumb--empty"
                  aria-hidden
                >
                  No image
                </div>
              )}

              <div className="odl-item-info">
                <p className="odl-item-name">{line.product_name}</p>

                <p className="odl-item-variant">
                  {line.variant_name}
                  {" · SKU "}
                  {line.sku}
                  {" · Qty "}
                  {orderedQty}
                </p>

                {(cancelledQty > 0 || returnedQty > 0) && (
                  <p className="odl-item-qty-note">
                    {activeQty > 0 ? `${activeQty} active` : "None active"}
                    {cancelledQty > 0 ? ` · ${cancelledQty} cancelled` : ""}
                    {returnedQty > 0 ? ` · ${returnedQty} returned` : ""}
                  </p>
                )}

                <span
                  className={`odl-status-badge ${lineStatusBadgeClass(line)}`}
                >
                  <span aria-hidden>●</span>{" "}
                  {String(lineStatusLabel(line)).toUpperCase()}
                </span>
              </div>
            </div>

            {lineCancelled ? (
              <div className="odl-item-breakdown odl-item-breakdown--cancel">
                {hasRefund && (
                  <div className="odl-breakdown-row">
                    <span>Cancellation refund</span>

                    <span className="odl-breakdown-refund">
                      ₹{formatMoney(refundAmt)}
                    </span>
                  </div>
                )}

                {line.cancellation_reason ? (
                  <div className="odl-breakdown-row">
                    <span>Reason</span>

                    <span className="odl-breakdown-reason">
                      {line.cancellation_reason}
                    </span>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="odl-item-breakdown">
                <div className="odl-breakdown-row">
                  <span>Base price</span>

                  <span>₹{formatMoney(basePrice)}</span>
                </div>

                {taxShare > 0 && (
                  <div className="odl-breakdown-row">
                    <span>GST ({gstPct}%)</span>

                    <span>₹{formatMoney(taxShare)}</span>
                  </div>
                )}

                {couponShare > 0 && (
                  <div className="odl-breakdown-row">
                    <span>Coupon share</span>

                    <span>− ₹{formatMoney(couponShare)}</span>
                  </div>
                )}

                <div className="odl-breakdown-row odl-breakdown-row--total">
                  <span>Item subtotal</span>

                  <strong>₹{formatMoney(itemSubtotal)}</strong>
                </div>
              </div>
            )}

            {!lineCancelled && (
              <div className="odl-item-tracking">
                <LineItemTracking line={line} orderPlacedAt={order.placed_at} />
              </div>
            )}

            {line.open_return && (
              <p className="odl-item-return-note">
                {line.open_return.status === "approved"
                  ? "Return approved"
                  : "Return requested"}
                {line.open_return.quantity > 1
                  ? ` · ${line.open_return.quantity} units`
                  : ""}
                — awaiting pickup.
              </p>
            )}

            <RejectedReturnNotice
              lastReturn={line.last_return}
              className="odl-item-return-note"
            />

            {hasRefund && !lineCancelled && (
              <p className="odl-item-refund-note">
                Refunded ₹{formatMoney(refundAmt)}
              </p>
            )}

            <div className="odl-item-actions">
              {canCancelLine(line) && (
                <button
                  type="button"
                  className="order-cancel-line-btn"
                  onClick={() => {
                    onOpenCancelLine(line.id);
                  }}
                >
                  Cancel
                  {cancellableQty > 1 ? " units" : " line"}
                </button>
              )}

              {canReturn && (
                <button
                  type="button"
                  className="checkout-btn-secondary"
                  onClick={() => {
                    onOpenReturn(line.id);
                  }}
                >
                  Request return
                  {(line.returnable_quantity ?? 0) > 1 ? " (choose qty)" : ""}
                </button>
              )}

              {canReview && (
                <Link
                  className="checkout-btn-secondary"
                  to={`/shop/product/${encodeURIComponent(line.product_slug)}?writeReview=1`}
                >
                  Write a review
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
