import "../../styles/shop.css";
import "../../styles/checkout.css";

import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  getAddresses,
} from "../../features/address/addressSlice";

import {
  fetchCart,
  fetchCheckoutPreview,
} from "../../features/cart/cartAPI";

import {
  createOrderApi,
} from "../../features/orders/orderAPI";

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

function lineImageUrl(variant) {

  if (!variant) {

    return null;
  }

  const imgs = variant.images || [];

  const primary = imgs.find(
    (i) => i.is_primary,
  );

  const pick = primary || imgs[0];

  if (!pick) {

    return null;
  }

  return pick.image_url || pick.image || null;
}

function gstPercentLabel(
  gstRateStr,
) {

  const n = Number(
    gstRateStr,
  );

  if (
    Number.isNaN(
      n,
    ) ||
    n <= 0
  ) {

    return null;
  }

  return Math.round(
    n * 100,
  );
}

export default function Checkout() {

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { addresses } = useSelector(
    (state) => state.address,
  );

  const [
    cartData,
    setCartData,
  ] = useState(null);

  const [
    cartLoading,
    setCartLoading,
  ] = useState(true);

  const [
    cartError,
    setCartError,
  ] = useState(null);

  const [
    selectedAddressId,
    setSelectedAddressId,
  ] = useState(null);

  const [
    pricingPreview,
    setPricingPreview,
  ] = useState(null);

  const [
    pricingError,
    setPricingError,
  ] = useState(null);

  const [
    selectedPaymentMethod,
    setSelectedPaymentMethod,
  ] = useState(
    "cod",
  );

  const [
    placeError,
    setPlaceError,
  ] = useState(null);

  const [
    placeBusy,
    setPlaceBusy,
  ] = useState(false);

  const [
    confirmPlaceOpen,
    setConfirmPlaceOpen,
  ] = useState(false);

  useEffect(() => {

    dispatch(
      getAddresses(),
    );
  }, [dispatch]);

  useEffect(() => {

    let cancelled = false;

    (
      async () => {

        setCartLoading(true);

        setCartError(null);

        try {

          const cartRes = await fetchCart();

          if (!cancelled) {

            setCartData(
              cartRes,
            );
          }

          try {

            const preview = await fetchCheckoutPreview();

            if (!cancelled) {

              setPricingPreview(
                preview,
              );

              setPricingError(
                null,
              );
            }
          } catch (prevErr) {

            if (!cancelled) {

              setPricingPreview(
                null,
              );

              setPricingError(

                formatProductApiError(
                  prevErr.response?.data,
                ) ||

                  "Could not load checkout totals.",
              );
            }
          }
        } catch (err) {

          if (!cancelled) {

            setCartError(

              formatProductApiError(
                err.response?.data,
              ) ||

                "Could not load cart.",
            );
          }
        } finally {

          if (!cancelled) {

            setCartLoading(false);
          }
        }
      }
    )();

    return () => {

      cancelled = true;
    };
  }, []);

  useEffect(() => {

    if (!addresses.length || selectedAddressId != null) {

      return;
    }

    const def = addresses.find(
      (a) => a.is_default,
    );

    setSelectedAddressId(
      def?.id ?? addresses[0].id,
    );
  }, [addresses, selectedAddressId]);

  const subtotalNum = Number(
    pricingPreview?.subtotal ??
      cartData?.subtotal ??
      0,
  );

  const taxNum = Number(
    pricingPreview?.tax_total ?? 0,
  );

  const shipNum = Number(
    pricingPreview?.shipping_total ?? 0,
  );

  const discountNum = Number(
    pricingPreview?.discount_total ?? 0,
  );

  const grandNum = Number(
    pricingPreview?.grand_total ??
      (
        subtotalNum + taxNum + shipNum - discountNum
      ),
  );

  const gstPct = gstPercentLabel(
    pricingPreview?.gst_rate,
  );

  const freeShipMin = pricingPreview?.free_shipping_min_subtotal;

  const orderReady =
    Boolean(
      cartData?.items?.length &&
      cartData?.can_checkout &&
      pricingPreview &&
      !pricingError &&
      selectedAddressId &&
      selectedPaymentMethod === "cod",
    );

  const canPlace =
    Boolean(
      orderReady &&
      !placeBusy,
    );

  const openPlaceConfirm = () => {

    if (
      !orderReady ||
      placeBusy
    ) {

      return;
    }

    setPlaceError(
      null,
    );

    setConfirmPlaceOpen(
      true,
    );
  };

  const runPlaceOrder = async () => {

    setPlaceError(
      null,
    );

    setPlaceBusy(
      true,
    );

    try {

      const order = await createOrderApi(
        {
          address_id: selectedAddressId,

          payment_method: selectedPaymentMethod,
        },
      );

      setConfirmPlaceOpen(
        false,
      );

      navigate(
        `/checkout/success/${encodeURIComponent(order.order_number)}`,
        {
          replace: true,
        },
      );
    } catch (err) {

      setPlaceError(

        formatProductApiError(
          err.response?.data,
        ) ||

          "Could not place order. Please try again.",
      );
    } finally {

      setPlaceBusy(
        false,
      );
    }
  };

  return (

    <div className="artisan-shop checkout-shell">

      <main className="checkout-main">

        <header className="checkout-head">

          <div>

            <h1 className="checkout-title artisan-font-serif">

              Checkout
            </h1>

            <p className="checkout-sub">

              Choose a delivery address, payment method, and confirm. Tax
              (GST) and shipping are calculated on our servers — totals here
              match what you pay.
            </p>
          </div>

          <Link
            className="checkout-back"
            to="/cart"
          >
            Back to bag
          </Link>

        </header>

        {
          pricingError && (

            <div
              className="shop-banner error cart-bag-banner"
              role="alert"
            >

              {pricingError}
            </div>
          )
        }

        {
          cartError && (

            <div
              className="shop-banner error cart-bag-banner"
              role="alert"
            >

              {cartError}
            </div>
          )
        }

        {
          placeError && (

            <div
              className="shop-banner error cart-bag-banner"
              role="alert"
            >

              {placeError}
            </div>
          )
        }

        {
          cartLoading ? (

            <p className="cart-bag-muted">
              Loading…
            </p>
          ) : !cartData?.items?.length ? (

            <div className="checkout-panel">

              <p className="cart-bag-muted">

                Your bag is empty. Add something from the shop before checkout.
              </p>

              <Link
                className="cart-bag-empty-cta"
                style={{ marginTop: "1rem", display: "inline-block" }}
                to="/shop"
              >
                Browse shop
              </Link>

            </div>
          ) : (

            <div className="checkout-layout">

              <div>

                <section className="checkout-panel">

                  <h2 className="checkout-panel-title artisan-font-serif">

                    Delivery address
                  </h2>

                  {
                    !addresses.length ? (

                      <div>

                        <p className="cart-bag-muted">

                          You need a saved address to place an order.
                        </p>

                        <div className="checkout-address-actions">

                          <Link
                            to="/profile/addresses"
                            className="cart-bag-empty-cta"
                            style={{ display: "inline-block" }}
                          >
                            Add or manage addresses
                          </Link>

                        </div>

                      </div>
                    ) : (

                      <div className="checkout-address-list">

                        {
                          addresses.map(
                            (addr) => {

                              const selected =
                                selectedAddressId === addr.id;

                              return (

                                <label
                                  key={addr.id}
                                  className={
                                    `checkout-address-row${

                                      selected
                                        ? " selected"
                                        : ""
                                    }`
                                  }
                                >

                                  <input
                                    type="radio"
                                    name="ship-addr"
                                    checked={selected}
                                    onChange={() => {

                                      setSelectedAddressId(
                                        addr.id,
                                      );
                                    }}
                                  />

                                  <div className="checkout-address-body">

                                    <div className="checkout-address-name">

                                      {addr.name}

                                    </div>

                                    <div className="checkout-address-meta">

                                      {addr.phone}

                                      <br />

                                      {
                                        [
                                          addr.address_line,
                                          addr.city,
                                          `${addr.state} ${addr.pincode}`,
                                        ].filter(Boolean).join(
                                          ", ",
                                        )
                                      }

                                    </div>

                                    {
                                      addr.is_default && (

                                        <span className="checkout-address-badge">

                                          Default
                                        </span>
                                      )
                                    }

                                  </div>

                                </label>
                              );
                            },
                          )
                        }

                        <div className="checkout-address-actions">

                          <Link to="/profile/addresses">

                            Add or edit addresses
                          </Link>

                        </div>

                      </div>
                    )
                  }

                </section>

                <section className="checkout-panel checkout-items">

                  <h2 className="checkout-panel-title artisan-font-serif">

                    Items
                  </h2>

                  {
                    cartData.items.map(
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

                              <div
                                className="checkout-item-thumb checkout-item-thumb-ph"
                              >

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

              </div>

              <aside className="checkout-panel">

                <h2 className="checkout-panel-title artisan-font-serif">

                  Summary
                </h2>

                <dl className="checkout-summary-lines">

                  <div className="checkout-summary-line">

                    <dt>
                      Subtotal
                    </dt>

                    <dd>

                      ₹
                      {formatMoney(
                        cartData.subtotal,
                      )}
                    </dd>

                  </div>

                  <div className="checkout-summary-line">

                    <dt>

                      {
                        gstPct != null
                          ? `GST (${gstPct}%)`
                          : "GST"
                      }

                    </dt>

                    <dd>

                      ₹
                      {formatMoney(
                        taxNum,
                      )}

                    </dd>

                  </div>

                  <div className="checkout-summary-line">

                    <dt>
                      Shipping
                    </dt>

                    <dd>

                      {
                        pricingPreview?.shipping_tier ===
                        "free_over_threshold"
                          ? (

                              <span>

                                Free
                              </span>
                            )
                          : (

                              <>
                                ₹
                                {formatMoney(
                                  shipNum,
                                )}
                              </>
                            )
                      }

                    </dd>

                  </div>

                  {
                    freeShipMin && (

                      <p className="checkout-pricing-note">

                        Free shipping on subtotals of ₹
                        {formatMoney(
                          freeShipMin,
                        )}
                        {" "}
                        or more; otherwise a flat delivery fee applies.
                      </p>
                    )
                  }

                  <div className="checkout-summary-line">

                    <dt>
                      Discounts
                    </dt>

                    <dd>

                      ₹
                      {formatMoney(
                        discountNum,
                      )}

                      {" "}

                      <span className="checkout-summary-muted">

                        (coupons coming later)
                      </span>

                    </dd>

                  </div>

                </dl>

                <div className="checkout-summary-divider" />

                <div className="checkout-summary-total">

                  <span>
                    Total
                  </span>

                  <span>

                    ₹
                    {formatMoney(
                      grandNum,
                    )}
                  </span>

                </div>

                <section
                  className="checkout-payment-block"
                  aria-label="Payment method"
                >

                  <h3 className="checkout-payment-title artisan-font-serif">

                    Payment
                  </h3>

                  <label className="checkout-payment-option">

                    <input
                      type="radio"
                      name="pay-method"
                      value="cod"
                      checked={
                        selectedPaymentMethod ===
                        "cod"
                      }
                      onChange={() => {

                        setSelectedPaymentMethod(
                          "cod",
                        );
                      }}
                    />

                    <div>

                      <div className="checkout-payment-option-head">

                        <strong>
                          Cash on delivery
                        </strong>

                      </div>

                      <p className="checkout-payment-option-desc">

                        Pay when your order arrives. Your order total above is
                        final.
                      </p>

                    </div>

                  </label>

                  <div
                    className="checkout-payment-option checkout-payment-option--disabled"
                    aria-disabled
                  >

                    <input
                      type="radio"
                      name="pay-method"
                      value="razorpay"
                      disabled
                    />

                    <div>

                      <div className="checkout-payment-option-head">

                        <strong>
                          Razorpay
                        </strong>

                        <span className="checkout-payment-soon">
                          Coming soon
                        </span>

                      </div>

                      <p className="checkout-payment-option-desc">

                        Card, UPI, and net banking — not available yet.
                      </p>

                    </div>

                  </div>

                  <div
                    className="checkout-payment-option checkout-payment-option--disabled"
                    aria-disabled
                  >

                    <input
                      type="radio"
                      name="pay-method"
                      value="wallet"
                      disabled
                    />

                    <div>

                      <div className="checkout-payment-option-head">

                        <strong>
                          Wallet
                        </strong>

                        <span className="checkout-payment-soon">
                          Coming soon
                        </span>

                      </div>

                      <p className="checkout-payment-option-desc">

                        Pay with your Furnicart wallet — not available yet.
                      </p>

                    </div>

                  </div>

                </section>

                <button
                  type="button"
                  className="checkout-place"
                  disabled={!canPlace}
                  onClick={openPlaceConfirm}
                >

                  {
                    placeBusy
                      ? "Placing order…"
                      : "Place order"
                  }
                </button>

                {
                  !cartData.can_checkout && (

                    <p className="cart-bag-summary-note">

                      Some items are unavailable or exceed stock. Update your
                      bag and try again.
                    </p>
                  )
                }

                <p className="checkout-trust">

                  Secure checkout · Questions? Visit your profile for account
                  help.
                </p>

              </aside>

            </div>
          )
        }

      </main>

      {
        confirmPlaceOpen &&
        cartData?.items?.length && (

          <div
            className="order-cancel-overlay"
            role="presentation"
            onClick={() => {

              if (
                !placeBusy
              ) {

                setConfirmPlaceOpen(
                  false,
                );
              }
            }}
          >

            <div
              className="order-cancel-dialog"
              role="dialog"
              aria-modal
              aria-labelledby="checkout-confirm-title"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <h2
                id="checkout-confirm-title"
                className="checkout-panel-title artisan-font-serif"
                style={{ marginTop: 0 }}
              >
                Confirm your order
              </h2>

              <p className="order-cancel-dialog-hint">
                Are you sure you want to place this order? You will pay cash on
                delivery when your furniture arrives.
              </p>

              {
                (() => {

                  const addr = addresses.find(
                    (
                      a,
                    ) =>
                      a.id === selectedAddressId,
                  );

                  return addr
                    ? (

                      <div className="checkout-confirm-block">

                        <strong>
                          Deliver to
                        </strong>

                        <p className="checkout-confirm-address">

                          {addr.name}
                          {" · "}
                          {addr.phone}

                          <br />

                          {
                            [
                              addr.address_line,
                              addr.city,
                              `${addr.state} ${addr.pincode}`,
                            ].filter(Boolean).join(
                              ", ",
                            )
                          }

                        </p>
                      </div>
                    )
                    : null;
                })()
              }

              <div className="checkout-confirm-block">

                <strong>
                  Items
                </strong>

                <ul className="checkout-confirm-items">

                  {
                    cartData.items.map(
                      (
                        row,
                      ) => (

                        <li
                          key={row.id}
                          className="checkout-confirm-item"
                        >

                          <span>
                            {row.product_name}
                            {" "}
                            ×
                            {" "}
                            {row.quantity}
                          </span>

                          <span>
                            ₹
                            {formatMoney(
                              row.line_subtotal,
                            )}
                          </span>
                        </li>
                      ),
                    )
                  }
                </ul>
              </div>

              <div className="checkout-confirm-totals">

                <div className="checkout-confirm-total-row">

                  <span>
                    Subtotal
                  </span>

                  <span>
                    ₹
                    {formatMoney(
                      cartData.subtotal,
                    )}
                  </span>
                </div>

                <div className="checkout-confirm-total-row">

                  <span>

                    {
                      gstPct != null
                        ? `GST (${gstPct}%)`
                        : "GST"
                    }

                  </span>

                  <span>
                    ₹
                    {formatMoney(
                      taxNum,
                    )}
                  </span>
                </div>

                <div className="checkout-confirm-total-row">

                  <span>
                    Shipping
                  </span>

                  <span>

                    {
                      pricingPreview?.shipping_tier ===
                      "free_over_threshold"
                        ? "Free"
                        : `₹${formatMoney(
                          shipNum,
                        )}`
                    }

                  </span>
                </div>

                {
                  discountNum > 0 && (

                    <div className="checkout-confirm-total-row">

                      <span>
                        Discounts
                      </span>

                      <span>
                        −₹
                        {formatMoney(
                          discountNum,
                        )}
                      </span>
                    </div>
                  )
                }

                <div className="checkout-confirm-total-row checkout-confirm-grand">

                  <span>
                    Order total
                  </span>

                  <span>
                    ₹
                    {formatMoney(
                      grandNum,
                    )}
                  </span>
                </div>
              </div>

              {
                placeError && (

                  <p
                    className="shop-banner error cart-bag-banner"
                    style={{ marginBottom: "0.75rem" }}
                    role="alert"
                  >
                    {placeError}
                  </p>
                )
              }

              <div className="order-cancel-dialog-actions">

                <button
                  type="button"
                  className="checkout-btn-secondary"
                  disabled={placeBusy}
                  onClick={() =>
                    setConfirmPlaceOpen(
                      false,
                    )
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="checkout-btn-primary"
                  disabled={placeBusy}
                  onClick={runPlaceOrder}
                >
                  {placeBusy ? "Placing order…" : "Yes, place order"}
                </button>
              </div>
            </div>
          </div>
        )
      }

    </div>
  );
}
