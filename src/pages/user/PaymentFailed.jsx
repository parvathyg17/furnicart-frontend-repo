import "../../styles/shop.css";
import "../../styles/checkout.css";

import {
  Link,
  useLocation,
} from "react-router-dom";

function FailedIllustration() {

  return (

    <svg
      className="checkout-success-illus checkout-payment-failed-illus"
      viewBox="0 0 280 200"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >

      <defs>

        <linearGradient
          id="chk-fail-bg"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >

          <stop
            offset="0%"
            stopColor="#f5ebe8"
          />

          <stop
            offset="100%"
            stopColor="#ead9d4"
          />

        </linearGradient>

      </defs>

      <rect
        x="20"
        y="24"
        width="240"
        height="152"
        rx="18"
        fill="url(#chk-fail-bg)"
        stroke="#d4b8b8"
        strokeWidth="1.5"
      />

      <circle
        cx="140"
        cy="100"
        r="44"
        fill="#fdfcfa"
        stroke="#9a5a5a"
        strokeWidth="3"
      />

      <path
        d="M118 78 L162 122 M162 78 L118 122"
        fill="none"
        stroke="#8b4545"
        strokeWidth="10"
        strokeLinecap="round"
      />

    </svg>
  );
}

function resolveCopy(
  reason,
  message,
) {

  if (
    reason === "cancelled"
  ) {

    return {
      title: "Payment cancelled",
      lead:
        message ||

        "You closed the payment window. No order was placed and your cart is unchanged.",
    };
  }

  if (
    reason === "verify_failed"
  ) {

    return {
      title: "Payment could not be confirmed",
      lead:
        message ||

        "We could not confirm your payment. If money was deducted, it will be refunded automatically.",
    };
  }

  return {
    title: "Payment failed",
    lead:
      message ||

      "Your payment did not go through. No order was placed and your cart is unchanged.",
  };
}

export default function PaymentFailed() {

  const location = useLocation();

  const state = location.state || {};

  const reason = state.reason || "failed";

  const {
    title,
    lead,
  } = resolveCopy(
    reason,
    state.message,
  );

  return (

    <div className="artisan-shop checkout-shell">

      <main className="checkout-success-wrap checkout-payment-failed-wrap">

        <FailedIllustration />

        <h1 className="checkout-success-title checkout-payment-failed-title artisan-font-serif">

          {title}
        </h1>

        <p className="checkout-success-lead">

          {lead}
        </p>

        <p className="checkout-payment-failed-note">

          You can return to checkout and try again, or keep browsing the shop.
        </p>

        <div className="checkout-success-actions">

          <Link
            className="checkout-btn-primary"
            to="/checkout"
          >
            Try checkout again
          </Link>

          <Link
            className="checkout-btn-secondary"
            to="/cart"
          >
            View cart
          </Link>

          <Link
            className="checkout-btn-secondary"
            to="/shop"
          >
            Continue shopping
          </Link>

        </div>

      </main>

    </div>
  );
}
