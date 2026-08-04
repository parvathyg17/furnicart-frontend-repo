import { Link } from "react-router-dom";

export default function CheckoutPageHeader() {
  return (
    <header className="checkout-head">
      <div>
        <h1 className="checkout-title artisan-font-serif">Checkout</h1>

        <p className="checkout-sub">
          Choose a delivery address, payment method, and confirm. Tax (GST) and
          shipping are calculated on our servers — totals here match what you
          pay.
        </p>
      </div>

      <Link className="checkout-back" to="/cart">
        Back to cart
      </Link>
    </header>
  );
}
