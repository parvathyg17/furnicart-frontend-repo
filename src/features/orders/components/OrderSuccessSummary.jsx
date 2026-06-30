import {
  formatMoney,
} from "../../../utils/currency.js";

import {
  resolveMediaUrl,
} from "../../../utils/mediaUrl.js";

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

  const lines = (
    order.lines || []
  ).filter(
    (line) =>
      line.status !== "cancelled",
  );

  return (

    <section
      className="order-success-card"
      aria-label="Order summary"
    >

      <h2 className="order-success-card-title">
        Order Summary
      </h2>

      {
        lines.length > 0 && (

          <div className="order-success-items">

            {
              lines.map(
                (line) => {

                  const img =
                    resolveMediaUrl(
                      line.image_url,
                    );

                  const meta =
                    line.variant_name
                      ? `Material: ${line.variant_name}`
                      : line.sku
                        ? `SKU: ${line.sku}`
                        : null;

                  return (

                    <div
                      key={line.id}
                      className="order-success-item"
                    >

                      <div className="order-success-item-thumb-wrap">

                        {
                          img ? (

                            <img
                              className="order-success-item-thumb"
                              src={img}
                              alt=""
                            />
                          ) : (

                            <div
                              className="order-success-item-thumb-ph"
                              aria-hidden
                            />
                          )
                        }

                      </div>

                      <div>

                        <p className="order-success-item-name">
                          {line.product_name}
                        </p>

                        {
                          meta && (

                            <p className="order-success-item-meta">
                              {meta}
                            </p>
                          )
                        }

                        {
                          line.quantity > 1 && (

                            <p className="order-success-item-meta">
                              Qty: {line.quantity}
                            </p>
                          )
                        }

                      </div>

                      <div className="order-success-item-price">
                        ₹
                        {formatMoney(
                          line.line_total,
                        )}
                      </div>

                    </div>
                  );
                },
              )
            }

          </div>
        )
      }

      <dl className="order-success-lines">

        <div className="order-success-line">

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

            <div className="order-success-line order-success-line--savings">

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

            <div className="order-success-line">

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

        <div className="order-success-line">

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

        <div className="order-success-line">

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

            <div className="order-success-line order-success-line--savings">

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
              </dd>

            </div>
          )
        }

      </dl>

      <div className="order-success-divider" />

      <div className="order-success-grand-total">

        <span>
          Grand Total
        </span>

        <span>
          ₹
          {formatMoney(
            order.grand_total,
          )}
        </span>

      </div>

    </section>
  );
}
