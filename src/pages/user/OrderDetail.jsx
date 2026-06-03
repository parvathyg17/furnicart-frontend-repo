import "../../styles/shop.css";
import "../../styles/checkout.css";

import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  fetchOrderApi,
} from "../../features/orders/orderAPI.js";

import {
  formatProductApiError,
} from "../../utils/productApiErrors.js";

function formatMoney(value) {

  const n = Number(value);

  if (Number.isNaN(n)) {

    return String(value ?? "—");
  }

  return n.toLocaleString(
    undefined,
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  );
}

const PAYMENT_LABELS = {
  cod: "Cash on delivery",
  razorpay: "Razorpay",
  wallet: "Wallet",
  other: "Other",
};

const STATUS_LABELS = {
  pending: "Pending",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function OrderDetail() {

  const { orderNumber } = useParams();

  const [
    order,
    setOrder,
  ] = useState(null);

  const [
    error,
    setError,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  useEffect(() => {

    let cancelled = false;

    if (!orderNumber) {

      setLoading(false);

      setError("Missing order reference.");

      return;
    }

    (
      async () => {

        setLoading(true);

        setError(null);

        try {

          const data = await fetchOrderApi(
            decodeURIComponent(orderNumber),
          );

          if (!cancelled) {

            setOrder(data);
          }
        } catch (err) {

          if (!cancelled) {

            setError(

              formatProductApiError(
                err.response?.data,
              ) ||

                "Could not load this order.",
            );
          }
        } finally {

          if (!cancelled) {

            setLoading(false);
          }
        }
      }
    )();

    return () => {

      cancelled = true;
    };
  }, [orderNumber]);

  return (

    <div className="artisan-shop order-detail-shell">

      <main className="order-detail-main">

        <header className="checkout-head">

          <div>

            <h1 className="checkout-title artisan-font-serif">

              Order details
            </h1>

            <p className="checkout-sub">

              Confirmation and line items for your purchase.
            </p>
          </div>

          <Link
            className="checkout-back"
            to="/shop"
          >
            Continue shopping
          </Link>

        </header>

        {
          loading ? (

            <p className="cart-bag-muted">
              Loading…
            </p>
          ) : error ? (

            <div
              className="shop-banner error cart-bag-banner"
              role="alert"
            >

              {error}
            </div>
          ) : order ? (

            <div className="checkout-panel">

              <p style={{ margin: "0 0 0.75rem", color: "#5c534a" }}>

                <strong>
                  Order ID:
                </strong>

                {" "}

                {order.order_number}

                {" "}
                ·
                {" "}

                <strong>
                  Status:
                </strong>

                {" "}

                {
                  STATUS_LABELS[order.status] ||
                  order.status
                }

                {" "}
                ·
                {" "}

                <strong>
                  Payment:
                </strong>

                {" "}

                {
                  PAYMENT_LABELS[order.payment_method] ||
                  order.payment_method
                }

              </p>

              <p style={{ margin: "0 0 1rem", fontSize: "0.9rem", color: "#5c534a" }}>

                <strong>
                  Ship to:
                </strong>

                {" "}

                {order.shipping_name}
                ,
                {" "}

                {order.shipping_phone}
                <br />

                {
                  [
                    order.shipping_address_line,
                    order.shipping_city,
                    `${order.shipping_state} ${order.shipping_pincode}`,
                  ].join(
                    ", ",
                  )
                }

              </p>

              <h2 className="checkout-panel-title artisan-font-serif">

                Items
              </h2>

              <table className="order-detail-table">

                <thead>

                  <tr>

                    <th>
                      Product
                    </th>

                    <th>
                      Qty
                    </th>

                    <th style={{ textAlign: "right" }}>
                      Line total
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {
                    (order.lines || []).map(
                      (line) => (

                        <tr key={line.id}>

                          <td>

                            <div style={{ fontWeight: 600 }}>

                              {line.product_name}
                            </div>

                            <div style={{ fontSize: "0.82rem", color: "#6b635c" }}>

                              {line.variant_name}

                              {" "}
                              ·
                              {" "}

                              {line.sku}
                            </div>

                          </td>

                          <td>

                            {line.quantity}
                          </td>

                          <td style={{ textAlign: "right" }}>

                            ₹
                            {formatMoney(line.line_total)}
                          </td>

                        </tr>
                      ),
                    )
                  }

                </tbody>

              </table>

              <div className="checkout-summary-divider" />

              <dl className="checkout-summary-lines">

                <div className="checkout-summary-line">

                  <dt>
                    Subtotal
                  </dt>

                  <dd>

                    ₹
                    {formatMoney(order.subtotal)}
                  </dd>

                </div>

                <div className="checkout-summary-line">

                  <dt>
                    Taxes
                  </dt>

                  <dd>

                    ₹
                    {formatMoney(order.tax_total)}
                  </dd>

                </div>

                <div className="checkout-summary-line">

                  <dt>
                    Shipping
                  </dt>

                  <dd>

                    ₹
                    {formatMoney(order.shipping_total)}
                  </dd>

                </div>

                <div className="checkout-summary-line">

                  <dt>
                    Discounts
                  </dt>

                  <dd>

                    ₹
                    {formatMoney(order.discount_total)}
                  </dd>

                </div>

              </dl>

              <div className="checkout-summary-total">

                <span>
                  Grand total
                </span>

                <span>

                  ₹
                  {formatMoney(order.grand_total)}
                </span>

              </div>

            </div>
          ) : null
        }

      </main>

    </div>
  );
}
