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
    placeError,
    setPlaceError,
  ] = useState(null);

  const [
    placeBusy,
    setPlaceBusy,
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

          const res = await fetchCart();

          if (!cancelled) {

            setCartData(res);
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
    cartData?.subtotal ?? 0,
  );

  const taxDisplay = 0;

  const shipDisplay = 0;

  const discountDisplay = 0;

  const grandPreview = (
    subtotalNum + taxDisplay + shipDisplay - discountDisplay
  );

  const canPlace =
    Boolean(
      cartData?.items?.length &&
      cartData?.can_checkout &&
      selectedAddressId &&
      !placeBusy,
    );

  const handlePlaceOrder = async () => {

    setPlaceError(null);

    setPlaceBusy(true);

    try {

      const order = await createOrderApi(
        {
          address_id: selectedAddressId,
        },
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

      setPlaceBusy(false);
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

              Choose a delivery address and confirm your order. Payment is
              cash on delivery.
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

                        return (

                          <div
                            key={row.id}
                            className="checkout-item-row"
                          >

                            {
                              url ? (

                                <img
                                  className="checkout-item-thumb"
                                  src={url}
                                  alt=""
                                />
                              ) : (

                                <div
                                  className="checkout-item-thumb checkout-item-thumb-ph"
                                >

                                  No image
                                </div>
                              )
                            }

                            <div>

                              <div className="checkout-item-title">

                                {row.product_name}
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
                      Taxes
                    </dt>

                    <dd className="checkout-summary-muted">

                      ₹
                      {formatMoney(taxDisplay)}

                      {" "}
                      (optional — not charged yet)
                    </dd>

                  </div>

                  <div className="checkout-summary-line">

                    <dt>
                      Shipping
                    </dt>

                    <dd className="checkout-summary-muted">

                      ₹
                      {formatMoney(shipDisplay)}

                    </dd>

                  </div>

                  <div className="checkout-summary-line">

                    <dt>
                      Discounts
                    </dt>

                    <dd className="checkout-summary-muted">

                      ₹
                      {formatMoney(discountDisplay)}

                    </dd>

                  </div>

                </dl>

                <div className="checkout-summary-divider" />

                <div className="checkout-summary-total">

                  <span>
                    Total (preview)
                  </span>

                  <span>

                    ₹
                    {formatMoney(grandPreview)}
                  </span>

                </div>

                <div className="checkout-cod">

                  <strong>
                    Cash on delivery
                  </strong>

                  Pay when your order arrives. You will receive confirmation on
                  this order number after placing the order.
                </div>

                <button
                  type="button"
                  className="checkout-place"
                  disabled={!canPlace}
                  onClick={handlePlaceOrder}
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

    </div>
  );
}
