import {
  formatMoney,
} from "../../../utils/currency.js";

export default function OrderPricing(
  {
    order,
  },
) {

  const offerDiscountNum = Number(
    order.offer_discount_total ?? 0,
  );

  const couponDiscountNum = Number(
    order.discount_total ?? 0,
  );

  return (

    <div className="odl-totals">

      <div>

        <div className="odl-total-row">

          <span>
            {
              offerDiscountNum > 0
                ? "Items"
                : "Subtotal"
            }
          </span>

          <span>
            ₹
            {formatMoney(
              offerDiscountNum > 0
                ? (
                    order.subtotal_gross
                    ?? order.subtotal
                  )
                : order.subtotal,
            )}
          </span>
        </div>

        {
          offerDiscountNum > 0 && (

            <div className="odl-total-row">

              <span>
                Offer savings
              </span>

              <span>
                −₹
                {formatMoney(
                  offerDiscountNum,
                )}
              </span>
            </div>
          )
        }

        {
          offerDiscountNum > 0 && (

            <div className="odl-total-row">

              <span>
                Subtotal
              </span>

              <span>
                ₹
                {formatMoney(
                  order.subtotal,
                )}
              </span>
            </div>
          )
        }

        <div className="odl-total-row">

          <span>
            Shipping
          </span>

          <span>
            {Number(order.shipping_total) === 0
              ? "Free"
              : `₹${formatMoney(order.shipping_total)}`}
          </span>
        </div>

        <div className="odl-total-row">

          <span>
            Tax
          </span>

          <span>
            ₹
            {formatMoney(order.tax_total)}
          </span>
        </div>

        {
          couponDiscountNum > 0 && (

            <div className="odl-total-row">

              <span>
                {
                  order.coupon_code
                    ? `Coupon (${order.coupon_code})`
                    : "Coupon"
                }
              </span>

              <span>
                −₹
                {formatMoney(
                  couponDiscountNum,
                )}
              </span>
            </div>
          )
        }

        {
          offerDiscountNum <= 0 &&
          couponDiscountNum <= 0 && (

            <div className="odl-total-row">

              <span>
                Discounts
              </span>

              <span>
                ₹
                {formatMoney(
                  0,
                )}
              </span>
            </div>
          )
        }

        <div className="odl-total-final">

          <span>
            Total
          </span>

          <span>
            ₹
            {formatMoney(order.grand_total)}
          </span>
        </div>
      </div>
    </div>
  );
}
