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
  downloadOrderInvoicePdf,
} from "../../features/orders/orderAPI";

import OrderSuccessSummary from "../../features/orders/components/OrderSuccessSummary.jsx";

import {
  formatProductApiError,
} from "../../utils/productApiErrors.js";

function SuccessIllustration() {

  return (

    <svg
      className="checkout-success-illus"
      viewBox="0 0 280 200"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >

      <defs>

        <linearGradient
          id="chk-bg"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >

          <stop
            offset="0%"
            stopColor="#efe8df"
          />

          <stop
            offset="100%"
            stopColor="#e0d5c8"
          />

        </linearGradient>

      </defs>

      <rect
        x="20"
        y="24"
        width="240"
        height="152"
        rx="18"
        fill="url(#chk-bg)"
        stroke="#d4c9bc"
        strokeWidth="1.5"
      />

      <path
        d="M72 118 L118 162 L208 72"
        fill="none"
        stroke="#3d6b4a"
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle
        cx="210"
        cy="48"
        r="22"
        fill="#fdfcfa"
        stroke="#8b7355"
        strokeWidth="2"
      />

      <path
        d="M200 48 L208 56 L224 38"
        fill="none"
        stroke="#5c4a3a"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

    </svg>
  );
}

export default function OrderSuccess() {

  const { orderNumber } = useParams();

  const [
    error,
    setError,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    order,
    setOrder,
  ] = useState(null);

  const [
    invoiceBusy,
    setInvoiceBusy,
  ] = useState(false);

  const [
    invoiceError,
    setInvoiceError,
  ] = useState(null);

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

  const detailPath = order
    ? `/orders/${encodeURIComponent(order.order_number)}`
    : "#";

  const handleDownloadInvoice = async () => {

    if (
      !order?.order_number
    ) {

      return;
    }

    setInvoiceBusy(
      true,
    );

    setInvoiceError(
      null,
    );

    try {

      await downloadOrderInvoicePdf(
        order.order_number,
      );
    } catch (err) {

      setInvoiceError(

        err.message ||

          "Could not download invoice.",
      );
    } finally {

      setInvoiceBusy(
        false,
      );
    }
  };

  return (

    <div className="artisan-shop checkout-shell">

      <main className="checkout-success-wrap">

        <SuccessIllustration />

        {
          loading ? (

            <p className="cart-bag-muted">
              Loading confirmation…
            </p>
          ) : error ? (

            <>

              <h1 className="checkout-success-title artisan-font-serif">

                Something went wrong
              </h1>

              <p className="checkout-success-lead">

                {error}
              </p>

              <div className="checkout-success-actions">

                <Link
                  className="checkout-btn-secondary"
                  to="/shop"
                >
                  Continue shopping
                </Link>

              </div>

            </>
          ) : (

            <>

              <h1 className="checkout-success-title artisan-font-serif">

                Thank you for your order
              </h1>

              <p className="checkout-success-lead">

                {
                  order.payment_method === "razorpay"
                    ? (
                      order.payment_status === "paid"
                        ? "Your payment was successful. We are preparing your pieces with care."
                        : "We are confirming your payment. This usually takes a moment."
                    )
                    : order.payment_method === "wallet"
                      ? "Your wallet payment was successful. We are preparing your pieces with care."
                      : "We are preparing your pieces with care. You will pay by cash on delivery when your shipment arrives."
                }
              </p>

              <p className="checkout-success-order">

                Order ID:
                {" "}

                <code>

                  {order.order_number}
                </code>

              </p>

              <OrderSuccessSummary
                order={order}
              />

              {
                invoiceError && (

                  <p
                    className="checkout-success-invoice-err"
                    role="alert"
                  >

                    {invoiceError}
                  </p>
                )
              }

              <div className="checkout-success-actions">

                <Link
                  className="checkout-btn-primary"
                  to={detailPath}
                >
                  View order details
                </Link>

                <button
                  type="button"
                  className="checkout-btn-secondary"
                  disabled={
                    invoiceBusy
                  }
                  onClick={
                    handleDownloadInvoice
                  }
                >

                  {
                    invoiceBusy
                      ? "Preparing PDF…"
                      : "Download invoice (PDF)"
                  }
                </button>

                <Link
                  className="checkout-btn-secondary"
                  to="/shop"
                >
                  Continue shopping
                </Link>

              </div>

            </>
          )
        }

      </main>

    </div>
  );
}
