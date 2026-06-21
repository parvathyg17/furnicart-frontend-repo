import {
  formatMoney,
} from "../../../utils/currency.js";

import CheckoutCouponSection from "./CheckoutCouponSection.jsx";

export default function CheckoutSummaryAside(
  {
    cartData,
    pricingPreview,
    taxNum,
    shipNum,
    discountNum,
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
  },
) {

  return (

    <aside className="checkout-panel">

      <h2 className="checkout-panel-title artisan-font-serif">
        Summary
      </h2>

      <CheckoutCouponSection
        pricingPreview={pricingPreview}
        discountNum={discountNum}
        couponInput={couponInput}
        onCouponInputChange={onCouponInputChange}
        couponBusy={couponBusy}
        onApply={onApplyCoupon}
        onRemove={onRemoveCoupon}
      />

      <dl className="checkout-summary-lines">

        <div className="checkout-summary-line">

          <dt>
            Subtotal
          </dt>

          <dd>
            ₹
            {formatMoney(
              cartData.subtotal,
            )}
          </dd>
        </div>

        <div className="checkout-summary-line">

          <dt>
            {
              gstPct != null
                ? `GST (${gstPct}%)`
                : "GST"
            }
          </dt>

          <dd>
            ₹
            {formatMoney(
              taxNum,
            )}
          </dd>
        </div>

        <div className="checkout-summary-line">

          <dt>
            Shipping
          </dt>

          <dd>
            {
              pricingPreview?.shipping_tier ===
              "free_over_threshold"
                ? (
                  <span>
                    Free
                  </span>
                )
                : (
                  <>
                    ₹
                    {formatMoney(
                      shipNum,
                    )}
                  </>
                )
            }
          </dd>
        </div>

        {
          freeShipMin && (

            <p className="checkout-pricing-note">
              Free shipping on subtotals of ₹
              {formatMoney(
                freeShipMin,
              )}
              {" "}
              or more; otherwise a flat delivery fee applies.
            </p>
          )
        }

        <div className="checkout-summary-line">

          <dt>
            Discounts
          </dt>

          <dd>
            {
              discountNum > 0
                ? (
                  <>
                    −₹
                    {formatMoney(
                      discountNum,
                    )}
                    {
                      pricingPreview?.coupon?.code && (
                        <span className="checkout-summary-muted">
                          {" "}
                          (
                          {pricingPreview.coupon.code}
                          )
                        </span>
                      )
                    }
                  </>
                )
                : (
                  <>
                    ₹
                    {formatMoney(
                      0,
                    )}
                  </>
                )
            }
          </dd>
        </div>
      </dl>

      <div className="checkout-summary-divider" />

      <div className="checkout-summary-total">

        <span>
          Total
        </span>

        <span>
          ₹
          {formatMoney(
            grandNum,
          )}
        </span>
      </div>

      <section
        className="checkout-payment-block"
        aria-label="Payment method"
      >

        <h3 className="checkout-payment-title artisan-font-serif">
          Payment
        </h3>

        <label className="checkout-payment-option">

          <input
            type="radio"
            name="pay-method"
            value="cod"
            checked={
              selectedPaymentMethod ===
              "cod"
            }
            onChange={() => {

              onPaymentMethodChange(
                "cod",
              );
            }}
          />

          <div>

            <div className="checkout-payment-option-head">
              <strong>
                Cash on delivery
              </strong>
            </div>

            <p className="checkout-payment-option-desc">
              Pay when your order arrives. Your order total above is final.
            </p>
          </div>
        </label>

        <div
          className="checkout-payment-option checkout-payment-option--disabled"
          aria-disabled
        >

          <input
            type="radio"
            name="pay-method"
            value="razorpay"
            disabled
          />

          <div>

            <div className="checkout-payment-option-head">

              <strong>
                Razorpay
              </strong>

              <span className="checkout-payment-soon">
                Coming soon
              </span>
            </div>

            <p className="checkout-payment-option-desc">
              Card, UPI, and net banking — not available yet.
            </p>
          </div>
        </div>

        <div
          className="checkout-payment-option checkout-payment-option--disabled"
          aria-disabled
        >

          <input
            type="radio"
            name="pay-method"
            value="wallet"
            disabled
          />

          <div>

            <div className="checkout-payment-option-head">

              <strong>
                Wallet
              </strong>

              <span className="checkout-payment-soon">
                Coming soon
              </span>
            </div>

            <p className="checkout-payment-option-desc">
              Pay with your Furnicart wallet — not available yet.
            </p>
          </div>
        </div>
      </section>

      <button
        type="button"
        className="checkout-place"
        disabled={!canPlace}
        onClick={onPlaceClick}
      >
        {
          placeBusy
            ? "Placing order…"
            : "Place order"
        }
      </button>

      {
        !cartData.can_checkout && (

          <p className="cart-bag-summary-note">
            Some items are unavailable or exceed stock. Update your bag and try
            again.
          </p>
        )
      }

      <p className="checkout-trust">
        Secure checkout · Questions? Visit your profile for account help.
      </p>
    </aside>
  );
}
