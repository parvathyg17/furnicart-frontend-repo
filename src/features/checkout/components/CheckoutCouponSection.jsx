import { useState } from "react";

import { formatMoney } from "../../../utils/currency.js";

import { ChevronDown, ChevronUp } from "lucide-react";

export default function CheckoutCouponSection({
  pricingPreview,
  discountNum,
  couponInput,
  onCouponInputChange,
  couponBusy,
  onApply,
  onRemove,
  activeCoupons,
}) {
  const applied = pricingPreview?.coupon;

  const hasDiscount = Number(discountNum) > 0;

  const [offersExpanded, setOffersExpanded] = useState(false);

  return (
    <section className="checkout-coupon-block" aria-label="Coupon code">
      <h3 className="checkout-coupon-title artisan-font-serif">Coupon</h3>

      {applied ? (
        <div className="checkout-coupon-applied">
          <div>
            <strong>{applied.code}</strong>

            {applied.description && (
              <p className="checkout-coupon-desc">{applied.description}</p>
            )}
          </div>

          <button
            type="button"
            className="checkout-coupon-remove"
            disabled={couponBusy}
            onClick={onRemove}
          >
            Remove
          </button>
        </div>
      ) : (
        <div>
          <div className="checkout-coupon-form">
            <input
              type="text"
              className="checkout-coupon-input"
              placeholder="Enter coupon code"
              value={couponInput}
              disabled={couponBusy}
              onChange={(e) => {
                onCouponInputChange(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();

                  onApply();
                }
              }}
            />

            <button
              type="button"
              className="checkout-coupon-apply"
              disabled={couponBusy || !couponInput.trim()}
              onClick={() => {
                onApply();
              }}
            >
              {couponBusy ? "Applying…" : "Apply"}
            </button>
          </div>

          {/* COLLAPSIBLE AVAILABLE OFFERS */}
          {activeCoupons && activeCoupons.length > 0 && (
            <div
              className="checkout-offers-collapsible"
              style={{
                marginTop: "12px",
                border: "1px solid #e6dfd9",
                borderRadius: "10px",
                background: "#f8f6f3",
                overflow: "hidden",
                transition: "0.2s ease-in-out",
              }}
            >
              <button
                type="button"
                onClick={() => setOffersExpanded(!offersExpanded)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#4b3529",
                  outline: "none",
                  fontFamily: "inherit",
                }}
              >
                <span>Available Offers ({activeCoupons.length})</span>
                {offersExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {offersExpanded && (
                <div
                  style={{
                    padding: "0 12px 12px 12px",
                    borderTop: "1px solid #e6dfd9",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    background: "#fff",
                  }}
                >
                  <ul style={{ listStyle: "none", padding: 0, margin: "6px 0 0 0", display: "flex", flexDirection: "column", gap: "6px" }}>
                    {activeCoupons.map((coupon) => {
                      const disabled = couponBusy || !coupon.is_eligible;

                      const discountText =
                        coupon.discount_type === "fixed"
                          ? `₹${formatMoney(coupon.discount_value)} off`
                          : `${coupon.discount_value}% off`;

                      return (
                        <li key={coupon.code}>
                          <button
                            type="button"
                            disabled={disabled}
                            onClick={() => {
                              if (coupon.is_eligible) {
                                onCouponInputChange(coupon.code);
                                onApply(coupon.code);
                              }
                            }}
                            style={{
                              width: "100%",
                              padding: "8px 10px",
                              borderRadius: "6px",
                              border: "1px solid",
                              borderColor: coupon.is_eligible ? "#e6dfd9" : "#f3f4f6",
                              background: coupon.is_eligible ? "#fff" : "#f9fafb",
                              textAlign: "left",
                              cursor: disabled ? "not-allowed" : "pointer",
                              fontSize: "12px",
                              color: coupon.is_eligible ? "#4b3529" : "#9ca3af",
                              transition: "0.2s",
                              fontFamily: "inherit",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "600" }}>
                              <span>{coupon.code}</span>
                              <span>{discountText}</span>
                            </div>
                            {coupon.description && (
                              <div style={{ fontSize: "11px", color: "#7b6b63", marginTop: "2px" }}>
                                {coupon.description}
                              </div>
                            )}
                            {!coupon.is_eligible && coupon.ineligible_reason && (
                              <div style={{ fontSize: "10px", color: "#b91c1c", marginTop: "4px" }}>
                                • {coupon.ineligible_reason}
                              </div>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {hasDiscount && (
        <p className="checkout-coupon-savings">
          You save ₹{formatMoney(discountNum)} on this order.
        </p>
      )}
    </section>
  );
}
