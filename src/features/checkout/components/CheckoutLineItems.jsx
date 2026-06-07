import {
  Link,
} from "react-router-dom";

import {
  formatMoney,
} from "../../../utils/currency.js";

import {
  lineImageUrl,
} from "../checkoutUtils.js";

export default function CheckoutLineItems(
  {
    items,
  },
) {

  return (

    <section className="checkout-panel checkout-items">

      <h2 className="checkout-panel-title artisan-font-serif">
        Items
      </h2>

      {
        items.map(
          (row) => {

            const url = lineImageUrl(
              row.variant,
            );

            const productTo =
              row.product_id
                ? `/shop/product/${row.product_id}`
                : null;

            const thumbEl =
              url
                ? (

                  <img
                    className="checkout-item-thumb"
                    src={url}
                    alt=""
                  />
                )
                : (

                  <div className="checkout-item-thumb checkout-item-thumb-ph">
                    No image
                  </div>
                );

            return (

              <div
                key={row.id}
                className="checkout-item-row"
              >

                {
                  productTo
                    ? (

                      <Link
                        to={productTo}
                        className="checkout-item-thumb-link"
                        aria-label={`View ${row.product_name || "product"}`}
                      >
                        {thumbEl}
                      </Link>
                    )
                    : thumbEl
                }

                <div>

                  <div className="checkout-item-title">

                    {
                      productTo
                        ? (

                          <Link to={productTo}>
                            {row.product_name}
                          </Link>
                        )
                        : row.product_name
                    }
                  </div>

                  <div className="checkout-item-sub">
                    {row.variant?.variant_name}
                  </div>

                  <div className="checkout-item-qty">
                    Qty {row.quantity}
                  </div>
                </div>

                <div className="checkout-item-price">
                  ₹
                  {formatMoney(
                    row.line_subtotal,
                  )}
                </div>
              </div>
            );
          },
        )
      }
    </section>
  );
}
