import {
  PAYMENT_LABELS,
  paymentStatusFollowLine,
} from "../orderUi.js";

export default function OrderSideInfo(
  {
    order,
  },
) {

  const paymentLabel =
    PAYMENT_LABELS[order.payment_method] ||
    order.payment_method;

  const paymentStatus = paymentStatusFollowLine(
    order,
  );

  return (

    <div className="odl-info-card">

      <section className="odl-info-section">

        <h3>
          Shipping address
        </h3>

        <p className="odl-info-name">
          {order.shipping_name}
        </p>

        <p className="odl-info-detail">
          {[
            order.shipping_address_line,
            order.shipping_city,
            `${order.shipping_state} ${order.shipping_pincode}`,
          ].filter(Boolean).join(", ")}
        </p>

        {
          order.shipping_phone
            ? (
              <p className="odl-info-detail">
                {order.shipping_phone}
              </p>
            )
            : null
        }
      </section>

      <div className="odl-info-divider" />

      <section className="odl-info-section">

        <h3>
          Payment method
        </h3>

        <div className="odl-payment-row">

          {
            order.payment_method === "razorpay"
              ? (
                <span className="odl-razorpay-badge" aria-hidden>
                  Razorpay
                </span>
              )
              : null
          }

          <span className="odl-info-name">
            {paymentLabel}
          </span>
        </div>

        {
          paymentStatus
            ? (
              <p className="odl-info-detail">
                Payment status:
                {" "}
                {paymentStatus}
              </p>
            )
            : order.payment_method === "cod"
              ? (
                <p className="odl-info-detail">
                  Payment is collected when your order is delivered.
                </p>
              )
              : null
        }

        {
          order.gateway_payment_id
            ? (
              <p className="odl-info-txn">
                Transaction ID:
                {" "}
                {order.gateway_payment_id}
              </p>
            )
            : null
        }
      </section>
    </div>
  );
}
