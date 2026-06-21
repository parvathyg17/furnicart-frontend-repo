import {
  formatMoney,
} from "../../../utils/currency.js";

export default function CheckoutCouponSection(
  {
    pricingPreview,
    discountNum,
    couponInput,
    onCouponInputChange,
    couponBusy,
    onApply,
    onRemove,
  },
) {

  const applied =
    pricingPreview?.coupon;

  const hasDiscount =
    Number(
      discountNum,
    ) > 0;

  return (

    <section
      className="checkout-coupon-block"
      aria-label="Coupon code"
    >

      <h3 className="checkout-coupon-title artisan-font-serif">
        Coupon
      </h3>

      {
        applied ? (

          <div className="checkout-coupon-applied">

            <div>

              <strong>
                {applied.code}
              </strong>

              {
                applied.description && (

                  <p className="checkout-coupon-desc">
                    {applied.description}
                  </p>
                )
              }
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

          <div className="checkout-coupon-form">

            <input
              type="text"
              className="checkout-coupon-input"
              placeholder="Enter coupon code"
              value={couponInput}
              disabled={couponBusy}
              onChange={(
                e,
              ) => {

                onCouponInputChange(
                  e.target.value,
                );
              }}
              onKeyDown={(
                e,
              ) => {

                if (
                  e.key === "Enter"
                ) {

                  e.preventDefault();

                  onApply();
                }
              }}
            />

            <button
              type="button"
              className="checkout-coupon-apply"
              disabled={
                couponBusy ||
                !couponInput.trim()
              }
              onClick={() => {

                onApply();
              }}
            >
              {couponBusy
                ? "Applying…"
                : "Apply"}
            </button>
          </div>
        )
      }

      {
        hasDiscount && (

          <p className="checkout-coupon-savings">
            You save ₹
            {formatMoney(
              discountNum,
            )}
            {" "}
            on this order.
          </p>
        )
      }
    </section>
  );
}
