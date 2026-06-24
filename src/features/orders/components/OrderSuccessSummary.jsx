import {
  formatMoney,
} from "../../../utils/currency.js";

import {
  PAYMENT_LABELS,
  paymentStatusFollowLine,
} from "../orderUi.js";

export default function OrderSuccessSummary(
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

  const paymentLabel =
    PAYMENT_LABELS[
      order.payment_method
    ] ||
    order.payment_method;

  const statusLine =
    paymentStatusFollowLine(
      order,
    );

  return (

    <section
      className="checkout-success-summary checkout-panel"
      aria-label="Order summary"
    >

      <h2 className="checkout-success-summary-title artisan-font-serif">
        Order summary
      </h2>

      <dl className="checkout-summary-lines">

        <div className="checkout-summary-line">

          <dt>
            {
              offerDiscountNum > 0
                ? "Items"
                : "Subtotal"
            }
          </dt>

          <dd>
            ₹
            {formatMoney(
              offerDiscountNum > 0
                ? (
                    order.subtotal_gross
                    ?? order.subtotal
                  )
                : order.subtotal,
            )}
          </dd>
        </div>

        {
          offerDiscountNum > 0 && (

            <div className="checkout-summary-line">

              <dt>
                Offer savings
              </dt>

              <dd>
                −₹
                {formatMoney(
                  offerDiscountNum,
                )}
              </dd>
            </div>
          )
        }

        {
          offerDiscountNum > 0 && (

            <div className="checkout-summary-line">

              <dt>
                Subtotal
              </dt>

              <dd>
                ₹
                {formatMoney(
                  order.subtotal,
                )}
              </dd>
            </div>
          )
        }

        <div className="checkout-summary-line">

          <dt>
            GST
          </dt>

          <dd>
            ₹
            {formatMoney(
              order.tax_total,
            )}
          </dd>
        </div>

        <div className="checkout-summary-line">

          <dt>
            Shipping
          </dt>

          <dd>
            {
              Number(
                order.shipping_total,
              ) === 0
                ? "Free"
                : (
                  <>
                    ₹
                    {formatMoney(
                      order.shipping_total,
                    )}
                  </>
                )
            }
          </dd>
        </div>

        {
          couponDiscountNum > 0 && (

            <div className="checkout-summary-line">

              <dt>
                {
                  order.coupon_code
                    ? "Coupon"
                    : "Discounts"
                }
              </dt>

              <dd>
                −₹
                {formatMoney(
                  couponDiscountNum,
                )}
                {
                  order.coupon_code && (
                    <span className="checkout-summary-muted">
                      {" "}
                      (
                      {order.coupon_code}
                      )
                    </span>
                  )
                }
              </dd>
            </div>
          )
        }

        {
          offerDiscountNum <= 0 &&
          couponDiscountNum <= 0 && (

            <div className="checkout-summary-line">

              <dt>
                Discounts
              </dt>

              <dd>
                ₹
                {formatMoney(
                  0,
                )}
              </dd>
            </div>
          )
        }
      </dl>

      <div className="checkout-summary-divider" />

      <div className="checkout-summary-total">

        <span>
          Total
        </span>

        <span>
          ₹
          {formatMoney(
            order.grand_total,
          )}
        </span>
      </div>

      <p className="checkout-success-payment-line">

        <strong>
          Payment:
        </strong>
        {" "}
        {paymentLabel}
        {
          statusLine && (
            <>
              {" "}
              ·
              {" "}
              {statusLine}
            </>
          )
        }
      </p>

    </section>
  );
}
