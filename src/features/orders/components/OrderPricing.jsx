import {
  formatMoney,
} from "../../../utils/currency.js";

export default function OrderPricing(
  {
    order,
  },
) {

  return (

    <div className="odl-totals">

      <div>

        <div className="odl-total-row">

          <span>
            Subtotal
          </span>

          <span>
            ₹
            {formatMoney(order.subtotal)}
          </span>
        </div>

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

        <div className="odl-total-row">

          <span>
            Discounts
          </span>

          <span>
            ₹
            {formatMoney(order.discount_total)}
          </span>
        </div>

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
