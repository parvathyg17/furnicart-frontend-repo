import { formatMoney } from "../../../utils/currency.js";

function discountLabel(coupon) {
  if (coupon.discount_type === "fixed") {
    return `₹${formatMoney(coupon.discount_value)} off`;
  }

  return `${coupon.discount_value}% off`;
}

export default function CheckoutActiveCoupons({
  activeCoupons,
  appliedCode,
  couponBusy,
  onApplyCode,
  loaded = false,
}) {
  const coupons = Array.isArray(activeCoupons) ? activeCoupons : [];

  if (!loaded) {
    return null;
  }

  return (
    <section
      className="checkout-panel checkout-active-coupons"
      aria-label="Available coupons"
    >
      <h2 className="checkout-panel-title artisan-font-serif">
        Available offers
      </h2>

      {coupons.length > 0 ? (
        <>
          <p className="checkout-active-coupons-lead">
            Tap a coupon to apply it to this order.
          </p>

          <ul className="checkout-active-coupons-list">
            {coupons.map((coupon) => {
              const isApplied =
                appliedCode &&
                appliedCode.toUpperCase() === coupon.code.toUpperCase();

              const disabled =
                couponBusy ||
                !coupon.is_eligible ||
                Boolean(appliedCode && !isApplied);

              return (
                <li key={coupon.code}>
                  <button
                    type="button"
                    className={
                      isApplied
                        ? "checkout-coupon-chip is-applied"
                        : coupon.is_eligible
                          ? "checkout-coupon-chip"
                          : "checkout-coupon-chip is-disabled"
                    }
                    disabled={disabled}
                    title={
                      coupon.is_eligible
                        ? `Apply ${coupon.code}`
                        : coupon.ineligible_reason
                    }
                    onClick={() => {
                      if (!coupon.is_eligible || isApplied) {
                        return;
                      }

                      onApplyCode(coupon.code);
                    }}
                  >
                    <span className="checkout-coupon-chip-code">
                      {coupon.code}
                    </span>

                    <span className="checkout-coupon-chip-off">
                      {discountLabel(coupon)}
                    </span>

                    {coupon.description && (
                      <span className="checkout-coupon-chip-desc">
                        {coupon.description}
                      </span>
                    )}

                    {Number(coupon.min_order_subtotal) > 0 && (
                      <span className="checkout-coupon-chip-min">
                        Min. ₹{formatMoney(coupon.min_order_subtotal)}
                      </span>
                    )}

                    {!coupon.is_eligible && coupon.ineligible_reason && (
                      <span className="checkout-coupon-chip-note">
                        {coupon.ineligible_reason}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <p className="checkout-active-coupons-lead">
          No active offers right now. You can still enter a code in the summary.
        </p>
      )}
    </section>
  );
}
