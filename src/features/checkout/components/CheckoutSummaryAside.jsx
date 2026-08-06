import { formatMoney } from "../../../utils/currency.js";

import CheckoutCouponSection from "./CheckoutCouponSection.jsx";

export default function CheckoutSummaryAside({
  cartData,
  pricingPreview,
  taxNum,
  shipNum,
  discountNum,
  offerDiscountNum,
  grandNum,
  gstPct,
  freeShipMin,
  selectedPaymentMethod,
  onPaymentMethodChange,
  canPlace,
  placeBusy,
  onPlaceClick,
  couponInput,
  onCouponInputChange,
  couponBusy,
  onApplyCoupon,
  onRemoveCoupon,
  walletBalance,
  walletCanPay,
  availableCoupons,
}) {
  return (
    <aside className="checkout-panel">
      <h2 className="checkout-panel-title artisan-font-serif">Summary</h2>

      <CheckoutCouponSection
        pricingPreview={pricingPreview}
        discountNum={discountNum}
        couponInput={couponInput}
        onCouponInputChange={onCouponInputChange}
        couponBusy={couponBusy}
        onApply={onApplyCoupon}
        onRemove={onRemoveCoupon}
        activeCoupons={availableCoupons}
      />

      <dl className="checkout-summary-lines">
        <div className="checkout-summary-line">
          <dt>{offerDiscountNum > 0 ? "Items" : "Subtotal"}</dt>

          <dd>
            ₹
            {formatMoney(
              offerDiscountNum > 0
                ? (pricingPreview?.subtotal_gross ??
                    cartData?.subtotal_gross ??
                    cartData?.subtotal)
                : cartData.subtotal,
            )}
          </dd>
        </div>

        {offerDiscountNum > 0 && (
          <div className="checkout-summary-line">
            <dt>Offer savings</dt>

            <dd>
              −₹
              {formatMoney(offerDiscountNum)}
            </dd>
          </div>
        )}

        {offerDiscountNum > 0 && (
          <div className="checkout-summary-line">
            <dt>Subtotal</dt>

            <dd>
              ₹{formatMoney(pricingPreview?.subtotal ?? cartData?.subtotal)}
            </dd>
          </div>
        )}

        <div className="checkout-summary-line">
          <dt>{gstPct != null ? `GST (${gstPct}%)` : "GST"}</dt>

          <dd>₹{formatMoney(taxNum)}</dd>
        </div>

        <div className="checkout-summary-line">
          <dt>Shipping</dt>

          <dd>
            {pricingPreview?.shipping_tier === "free_over_threshold" ? (
              <span>Free</span>
            ) : (
              <>₹{formatMoney(shipNum)}</>
            )}
          </dd>
        </div>

        {freeShipMin && (
          <p className="checkout-pricing-note">
            Free shipping on subtotals of ₹{formatMoney(freeShipMin)} or more;
            otherwise a flat delivery fee applies.
          </p>
        )}

        <div className="checkout-summary-line">
          <dt>{discountNum > 0 ? "Coupon" : "Discounts"}</dt>

          <dd>
            {discountNum > 0 ? (
              <>
                −₹
                {formatMoney(discountNum)}
                {pricingPreview?.coupon?.code && (
                  <span className="checkout-summary-muted">
                    {" "}
                    ({pricingPreview.coupon.code})
                  </span>
                )}
              </>
            ) : (
              <>₹{formatMoney(0)}</>
            )}
          </dd>
        </div>
      </dl>

      <div className="checkout-summary-divider" />

      <div className="checkout-summary-total">
        <span>Total</span>

        <span>₹{formatMoney(grandNum)}</span>
      </div>

      <section className="checkout-payment-block" aria-label="Payment method">
        <h3 className="checkout-payment-title artisan-font-serif">Payment</h3>

        <label className="checkout-payment-option">
          <input
            type="radio"
            name="pay-method"
            value="cod"
            checked={selectedPaymentMethod === "cod"}
            onChange={() => {
              onPaymentMethodChange("cod");
            }}
          />

          <div>
            <div className="checkout-payment-option-head">
              <strong>Cash on delivery</strong>
            </div>

            <p className="checkout-payment-option-desc">
              Pay when your order arrives. Your order total above is final.
            </p>
          </div>
        </label>

        <label className="checkout-payment-option">
          <input
            type="radio"
            name="pay-method"
            value="razorpay"
            checked={selectedPaymentMethod === "razorpay"}
            onChange={() => {
              onPaymentMethodChange("razorpay");
            }}
          />

          <div>
            <div className="checkout-payment-option-head">
              <strong>Razorpay</strong>
            </div>

            <p className="checkout-payment-option-desc">
              Pay now with UPI, card, or net banking. Your order is placed only
              after successful payment.
            </p>
          </div>
        </label>

        <label
          className={
            walletCanPay
              ? "checkout-payment-option"
              : "checkout-payment-option checkout-payment-option--disabled"
          }
        >
          <input
            type="radio"
            name="pay-method"
            value="wallet"
            checked={selectedPaymentMethod === "wallet"}
            disabled={!walletCanPay}
            onChange={() => {
              if (walletCanPay) {
                onPaymentMethodChange("wallet");
              }
            }}
          />

          <div>
            <div className="checkout-payment-option-head">
              <strong>Wallet</strong>

              {walletBalance != null && (
                <span className="checkout-payment-wallet-balance">
                  Balance ₹{formatMoney(walletBalance)}
                </span>
              )}
            </div>

            <p className="checkout-payment-option-desc">
              {walletCanPay ? (
                "Pay now using your FurniCart wallet balance."
              ) : walletBalance == null ? (
                "Loading wallet balance…"
              ) : (
                <>
                  Insufficient balance for this order (₹
                  {formatMoney(grandNum)} required). Refunds from cancellations
                  and returns are added to your wallet.
                </>
              )}
            </p>
          </div>
        </label>
      </section>

      <button
        type="button"
        className="checkout-place"
        disabled={!canPlace}
        onClick={onPlaceClick}
      >
        {placeBusy
          ? selectedPaymentMethod === "razorpay"
            ? "Opening payment…"
            : selectedPaymentMethod === "wallet"
              ? "Paying with wallet…"
              : "Placing order…"
          : selectedPaymentMethod === "razorpay"
            ? "Pay now"
            : selectedPaymentMethod === "wallet"
              ? "Pay with wallet"
              : "Place order"}
      </button>

      <p className="checkout-trust">
        Secure checkout · Questions? Visit your profile for account help.
      </p>
    </aside>
  );
}
