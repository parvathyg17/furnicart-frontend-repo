import { Link } from "react-router-dom";

import { formatMoney } from "../../../utils/currency.js";

import {
  computeOriginalOrderBreakdown,
  DELIVERY_CHARGE_NON_REFUNDABLE_NOTE,
  showDeliveryChargeNonRefundableNote,
} from "../orderUi.js";

export default function OrderSummaryCard({ order }) {
  const {
    originalPaid,
    origItemsNet,
    origOfferNum,
    origItemsGross,
    origTaxNum,
    origCouponNum,
    origShippingNum,
  } = computeOriginalOrderBreakdown(order);

  const refundedNum = Number(order.refunded_total ?? 0);

  const finalPaid = Number(order.remaining_value ?? originalPaid);

  const hasRefund = refundedNum > 0;

  return (
    <div className="odl-summary-card">
      <h3 className="odl-summary-title">Order summary</h3>

      <div className="odl-summary-rows">
        <div className="odl-summary-row">
          <span>{origOfferNum > 0 ? "Items" : "Subtotal"}</span>

          <span>
            ₹{formatMoney(origOfferNum > 0 ? origItemsGross : origItemsNet)}
          </span>
        </div>

        {origOfferNum > 0 && (
          <div className="odl-summary-row odl-summary-row--deduct">
            <span>Offer savings</span>

            <span>
              −₹
              {formatMoney(origOfferNum)}
            </span>
          </div>
        )}

        {origOfferNum > 0 && (
          <div className="odl-summary-row">
            <span>Subtotal</span>

            <span>₹{formatMoney(origItemsNet)}</span>
          </div>
        )}

        <div className="odl-summary-row odl-summary-row--muted">
          <span>Shipping</span>

          <span>
            {origShippingNum <= 0 ? "FREE" : `₹${formatMoney(origShippingNum)}`}
          </span>
        </div>

        <div className="odl-summary-row">
          <span>Tax</span>

          <span>₹{formatMoney(origTaxNum)}</span>
        </div>

        {origCouponNum > 0 && (
          <div className="odl-summary-row odl-summary-row--deduct">
            <span>
              {order.coupon_code ? `Coupon (${order.coupon_code})` : "Coupon"}
            </span>

            <span>
              −₹
              {formatMoney(origCouponNum)}
            </span>
          </div>
        )}
      </div>

      <div className="odl-summary-total">
        <span>Total ordered value</span>

        <strong>₹{formatMoney(originalPaid)}</strong>
      </div>

      {hasRefund && (
        <div className="odl-summary-rows odl-summary-rows--after-total">
          <div className="odl-summary-row odl-summary-row--refund">
            <span>Total refund amount</span>

            <span>
              −₹
              {formatMoney(refundedNum)}
            </span>
          </div>
        </div>
      )}

      <div className="odl-summary-final">
        <span>Final value</span>

        <strong>₹{formatMoney(finalPaid)}</strong>
      </div>

      {showDeliveryChargeNonRefundableNote(order, {
        refundSummary: true,
      }) && (
        <p className="odl-summary-note">
          {DELIVERY_CHARGE_NON_REFUNDABLE_NOTE}
        </p>
      )}

      <Link to="/shop" className="odl-summary-cta">
        Continue shopping
      </Link>
    </div>
  );
}
