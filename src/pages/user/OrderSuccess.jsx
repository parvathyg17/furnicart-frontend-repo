import "../../styles/order-success.css";

import { useEffect, useState } from "react";

import { Link, useParams } from "react-router-dom";

import { Check, CircleCheck, Truck } from "lucide-react";

import {
  fetchOrderApi,
  downloadOrderInvoicePdf,
} from "../../features/orders/orderAPI";

import OrderSuccessSummary from "../../features/orders/components/OrderSuccessSummary.jsx";

import { formatProductApiError } from "../../utils/productApiErrors.js";

import {
  PAYMENT_LABELS,
  paymentStatusFollowLine,
} from "../../features/orders/orderUi.js";

function formatDeliveryWindow(placedAt) {
  if (!placedAt) {
    return "We will share delivery dates soon.";
  }

  const placed = new Date(placedAt);

  if (Number.isNaN(placed.getTime())) {
    return "We will share delivery dates soon.";
  }

  const start = new Date(placed);

  start.setDate(start.getDate() + 12);

  const end = new Date(placed);

  end.setDate(end.getDate() + 15);

  const fmt = (d) =>
    d.toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  return `Between ${fmt(start)} and ${fmt(end)}`;
}

function formatShippingAddress(order) {
  const lines = [
    order.shipping_address_line,
    [order.shipping_city, order.shipping_pincode].filter(Boolean).join(" - "),
    [order.shipping_state, "India"].filter(Boolean).join(", "),
  ].filter(Boolean);

  return lines.join("\n");
}

function paymentMessage(order) {
  if (order.payment_method === "razorpay") {
    return order.payment_status === "paid"
      ? "Your payment was successful. We are preparing your pieces with care."
      : "We are confirming your payment. This usually takes a moment.";
  }

  if (order.payment_method === "wallet") {
    return "Your wallet payment was successful. We are preparing your pieces with care.";
  }

  return "We are preparing your pieces with care. You will pay by cash on delivery when your shipment arrives.";
}

export default function OrderSuccess() {
  const { orderNumber } = useParams();

  const [error, setError] = useState(null);

  const [loading, setLoading] = useState(true);

  const [order, setOrder] = useState(null);

  const [invoiceBusy, setInvoiceBusy] = useState(false);

  const [invoiceError, setInvoiceError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    if (!orderNumber) {
      setLoading(false);

      setError("Missing order reference.");

      return;
    }

    (async () => {
      setLoading(true);

      setError(null);

      try {
        const data = await fetchOrderApi(decodeURIComponent(orderNumber));

        if (!cancelled) {
          setOrder(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            formatProductApiError(err.response?.data) ||
              "Could not load this order.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orderNumber]);

  const detailPath = order
    ? `/orders/${encodeURIComponent(order.order_number)}`
    : "#";

  const handleDownloadInvoice = async () => {
    if (!order?.order_number) {
      return;
    }

    setInvoiceBusy(true);

    setInvoiceError(null);

    try {
      await downloadOrderInvoicePdf(order.order_number);
    } catch (err) {
      setInvoiceError(err.message || "Could not download invoice.");
    } finally {
      setInvoiceBusy(false);
    }
  };

  const paymentLabel = order
    ? PAYMENT_LABELS[order.payment_method] || order.payment_method
    : "";

  const statusLine = order ? paymentStatusFollowLine(order) : null;

  return (
    <div className="order-success-page">
      <main className="order-success-main">
        {loading ? (
          <p className="order-success-muted">Loading confirmation…</p>
        ) : error ? (
          <>
            <h1 className="order-success-error-title">Something went wrong</h1>

            <p className="order-success-error-lead">{error}</p>

            <div className="order-success-actions">
              <Link className="order-success-btn-secondary" to="/shop">
                Continue shopping
              </Link>
            </div>
          </>
        ) : (
          <>
            <header className="order-success-hero">
              <div className="order-success-check">
                <Check size={28} strokeWidth={2.5} />
              </div>

              <h1 className="order-success-title">Thank you for your order</h1>

              <p className="order-success-lead">{paymentMessage(order)}</p>

              <p className="order-success-order-pill">
                Order ID: <strong>{order.order_number}</strong>
              </p>
            </header>

            <div className="order-success-grid">
              <OrderSuccessSummary order={order} />

              <aside className="order-success-sidebar">
                <div className="order-success-status-card">
                  <p className="order-success-status-label">Payment Status</p>

                  <p className="order-success-status-value">
                    <span>
                      Payment: {paymentLabel}
                      {statusLine && <> · {statusLine}</>}
                    </span>

                    {order.payment_status === "paid" && (
                      <CircleCheck size={18} aria-hidden />
                    )}
                  </p>
                </div>

                <div className="order-success-card order-success-address-card">
                  <p className="order-success-address-label">
                    Delivery Address
                  </p>

                  <address className="order-success-address-text">
                    {order.shipping_name && (
                      <>
                        {order.shipping_name}
                        <br />
                      </>
                    )}

                    {formatShippingAddress(order)
                      .split("\n")
                      .map((line, i) => (
                        <span key={i}>
                          {line}
                          <br />
                        </span>
                      ))}
                  </address>
                </div>

                {invoiceError && (
                  <p className="order-success-invoice-err" role="alert">
                    {invoiceError}
                  </p>
                )}

                <div className="order-success-actions">
                  <Link className="order-success-btn-primary" to={detailPath}>
                    View order details
                  </Link>

                  <button
                    type="button"
                    className="order-success-btn-secondary"
                    disabled={invoiceBusy}
                    onClick={handleDownloadInvoice}
                  >
                    {invoiceBusy ? "Preparing PDF…" : "Download invoice (PDF)"}
                  </button>
                </div>

                <Link className="order-success-continue" to="/shop">
                  Continue shopping →
                </Link>
              </aside>
            </div>

            <section
              className="order-success-delivery"
              aria-label="Estimated delivery"
            >
              <div className="order-success-delivery-icon">
                <Truck size={28} strokeWidth={1.5} />
              </div>

              <h2 className="order-success-delivery-title">
                Estimated Delivery
              </h2>

              <p className="order-success-delivery-dates">
                {formatDeliveryWindow(order.placed_at)}
              </p>

              <p className="order-success-delivery-note">
                Our artisans are currently preparing your order for dispatch. We
                will notify you once it ships.
              </p>
            </section>
          </>
        )}
      </main>

      <footer className="order-success-footer">
        <p className="order-success-footer-brand">FurniCart</p>

        <nav className="order-success-footer-links" aria-label="Footer">
          <Link to="/about">Sustainability</Link>

          <Link to="/shop">Craftsmanship</Link>

          <Link to="/contact">Shipping Policy</Link>

          <Link to="/contact">Terms of Service</Link>

          <Link to="/contact">Privacy</Link>

          <Link to="/shop">Care Guide</Link>
        </nav>

        <p className="order-success-footer-copy">
          © {new Date().getFullYear()} FurniCart. Crafted for Longevity.
        </p>
      </footer>
    </div>
  );
}
