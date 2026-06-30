import "../../styles/shop.css";
import "../../styles/home.css";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useDispatch,
} from "react-redux";

import {
  fetchCart,
  updateCartItemApi,
  removeCartItemApi,
  validateCheckoutApi,
} from "../../features/cart/cartAPI";

import {
  setCartItemCount,
} from "../../features/cart/cartSlice";

import {
  useBackgroundServerSync,
} from "../../hooks/useBackgroundServerSync.js";

import {
  stableStringify,
} from "../../utils/stableStringify.js";

import {
  formatCheckoutValidationError,
  formatProductApiError,
} from "../../utils/productApiErrors.js";

import {
  Trash2,
} from "lucide-react";

import PublicNavbar from "../../components/common/PublicNavbar.jsx";

function formatCartMoney(
  value,
) {

  const n =
    Number(value);

  if (
    Number.isNaN(
      n,
    )
  ) {

    return String(
      value ?? "—",
    );
  }

  return n.toLocaleString(
    undefined,
    {

      minimumFractionDigits: 2,

      maximumFractionDigits: 2,
    },
  );
}

function cartLineImageUrl(
  variant,
) {

  if (!variant)
    return null;

  const imgs =
    variant.images || [];

  const primary =
    imgs.find(
      (i) =>
        i.is_primary,
    );

 

  const pick =
    primary || imgs[0];

  if (!pick)
    return null;

  return (
    pick.image_url ||
    pick.image ||
    null
  );
}

export default function Cart() {

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const [
    data,
    setData,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState(null);

  const [
    checkoutErr,
    setCheckoutErr,
  ] = useState(null);

  const [
    checkoutBusy,
    setCheckoutBusy,
  ] = useState(false);

  const lastCartSigRef =
    useRef(
      null,
    );

  const load =
    useCallback(
      async (
        { silent = false } = {},
      ) => {

        if (!silent) {

          setLoading(true);

          setError(null);
        }

        try {

          const res =
            await fetchCart();

          const snap =
            stableStringify(
              res,
            );

          dispatch(
            setCartItemCount(
              res.item_count,
              
            ),
          );

          if (
            silent &&
            lastCartSigRef.current ===
              snap
          ) {

            return;
          }

          lastCartSigRef.current =
            snap;

          setData(res);
        } catch (err) {

          if (!silent) {

            setError(

              formatProductApiError(
                err.response?.data
              ) ||

                "Could not load cart."
            );
          }
        } finally {

          if (!silent) {

            setLoading(false);
          }
        }
      },

      [dispatch],
    );

  useEffect(() => {

    load();
  }, [load]);

  useBackgroundServerSync(
    {

      enabled: true,

      pollIntervalMs: 90_000,

      onRefresh:
        () =>
          load(
            {
              silent: true,
            },
          ),
    },
  );

  const changeQty =
    async (
      itemId,
      nextQty,
      maxQ,
    ) => {

      setCheckoutErr(null);

      try {

       
// if (nextQty <=1) {

//           await removeCartItemApi(itemId);

//         } else{
        await updateCartItemApi(
          itemId,
          nextQty
        );
      
      
      

        setError(null);

        await load(
          { silent: true },
        );
      } catch (err) {

        setError(

          formatProductApiError(
            err.response?.data
          ) ||

            "Could not update quantity."
        );
      }
    };

  const remove =
    async (itemId) => {

      setCheckoutErr(null);

      try {

        const res =
          await removeCartItemApi(
            itemId,
          );

        lastCartSigRef.current =
          stableStringify(
            res,
          );

        setData(res);

        dispatch(
          setCartItemCount(
            res.item_count,
            
          ),
        );
      } catch (err) {

        setError(

          formatProductApiError(
            err.response?.data
          ) ||

            "Could not remove item."
        );
      }
    };

  // const productCount = data?.items
  // ? new Set(data.items.map((row) => row.product_id)).size
  // : 0;

  const handleCheckout =
    async () => {

      setCheckoutErr(null);

      setCheckoutBusy(true);

      try {

        const res =
          await validateCheckoutApi();

        if (res.valid) {

          await load(
            { silent: true },
          );

          navigate(
            "/checkout",
          );
        }
      } catch (err) {

        const body =
          err.response?.data;

        setCheckoutErr(

          formatCheckoutValidationError(
            body
          ) ||

            formatProductApiError(
              body
            ) ||

            "Checkout cannot proceed with the current cart."
        );

        await load(
          { silent: true },
        );
      } finally {

        setCheckoutBusy(false);
      }
    };

  return (

    <div className="artisan-shop cart-bag-shell">

      <PublicNavbar />

      <main className="artisan-main-wrap cart-bag-main">

        <header className="cart-bag-page-head">

          <div className="cart-bag-page-head-text">

            <h1 className="cart-bag-page-title artisan-font-serif">

              Shopping Bag
            </h1>
             

            <p className="cart-bag-page-sub">

              Review your selection of hand-crafted heirlooms.
            </p>
          </div>

          <Link
            className="cart-bag-continue"
            to="/shop"
          >
            Continue shopping
          </Link>

        </header>

        {
          error && (

            <div
              className="shop-banner error cart-bag-banner"
              role="alert"
            >

              {error}
            </div>
          )
        }

        {
          checkoutErr && (

            <div
              className="shop-banner error cart-bag-banner"
              role="alert"
            >

              {checkoutErr}
            </div>
          )
        }

        {
          loading ? (

            <p className="cart-bag-muted">
              Loading cart…
            </p>
          ) : !data?.items?.length ? (

            <div className="cart-bag-empty">

              <p className="cart-bag-empty-title artisan-font-serif">

                Your bag is empty
              </p>

              <p className="cart-bag-muted">

                Discover pieces for your space in the shop.
              </p>

              <Link
                className="cart-bag-empty-cta"
                to="/shop"
              >
                Browse shop
              </Link>

            </div>
          ) : (

            <div className="cart-bag-layout">

              <div className="cart-bag-col-items">

                <ul className="cart-bag-list">

                  {
                    data.items.map(
                      (row) => {

                        const maxQ =
                          typeof row.max_quantity ===
                          "number"
                            ? row.max_quantity
                            : Math.min(
                                row.variant?.stock || 0,
                                10
                              );

                        const avail =
                          row.line_availability;

                        const lineProblem =
                          avail &&
                          avail.status !==
                            "ok" &&
                          avail.message;

                        const v =
                          row.variant;

                        const imgUrl =
                          cartLineImageUrl(
                            v,
                          );

                        const pills =
                          [];

                        if (
                          (v?.material || "")
                            .trim()
                        ) {

                          pills.push({
                            key: "m",
                            label: `Material: ${String(v.material).trim()}`,
                          });
                        }

                        if (
                          (v?.color || "")
                            .trim()
                        ) {

                          pills.push({
                            key: "c",
                            label: `Color: ${String(v.color).trim()}`,
                          });
                        }

                        if (
                          (v?.size || "")
                            .trim()
                        ) {

                          pills.push({
                            key: "s",
                            label: `Size: ${String(v.size).trim()}`,
                          });
                        }

                        if (
                          !pills.length &&
                          (v?.variant_name || "")
                            .trim()
                        ) {

                          pills.push({
                            key: "v",
                            label: String(
                              v.variant_name,
                            ).trim(),
                          });
                        }

                        return (

                          <li
                            key={row.id}
                            className="cart-bag-row"
                          >

                            <div className="cart-bag-row-grid">

                              <div className="cart-bag-thumb-wrap">

                                {
                                  imgUrl ? (

                                    <img
                                      className="cart-bag-thumb"
                                      src={imgUrl}
                                      alt=""
                                    />
                                  ) : (

                                    <div
                                      className="cart-bag-thumb cart-bag-thumb-ph"
                                      aria-hidden="true"
                                    />
                                  )
                                }
                              </div>

                              <div className="cart-bag-mid">

                                <h2 className="cart-bag-line-title artisan-font-serif">

                                  {row.product_name}
                                </h2>

                                {
                                  pills.length > 0 && (

                                    <div className="cart-bag-pills">

                                      {
                                        pills.map(
                                          (p) => (

                                            <span
                                              key={p.key}
                                              className="cart-bag-pill"
                                            >

                                              {p.label}
                                            </span>
                                          )
                                        )
                                      }

                                    </div>
                                  )
                                }

                                <div className="cart-bag-qty">

                                  <button
                                    type="button"
                                    className="cart-bag-qty-btn"
                                    aria-label="Decrease quantity"
                                    disabled={
                                      row.quantity <=
                                      1
                                    }
                                    onClick={() =>
                                      changeQty(
                                        row.id,

                                        row.quantity - 1
                                        
                                      )
                                    }
                                  >
                                    -
                                  </button>

                                  <span className="cart-bag-qty-val">

                                    {row.quantity}
                                  </span>

                                  <button
                                    type="button"
                                    className="cart-bag-qty-btn"
                                    aria-label="Increase quantity"
                                    disabled={
                                      row.quantity >=
                                      maxQ
                                    }
                                    onClick={() =>
                                      changeQty(
                                        row.id,

                                        row.quantity + 1
                                      )
                                    }
                                  >
                                    +
                                  </button>

                                </div>

                                {
                                  row.quantity >=
                                    maxQ && (

                                    <p className="cart-bag-qty-cap-note">

                                      Maximum{" "}

                                      {maxQ}

                                      {" "}

                                      for this item (cart limit or
                                      stock).

                                    </p>
                                  )
                                }

                                {
                                  lineProblem && (

                                    <div
                                      className="shop-banner error cart-bag-line-alert"
                                      role="alert"
                                    >

                                      {lineProblem}
                                    </div>
                                  )
                                }

                              </div>

                              <div className="cart-bag-side">

                                <p className="cart-bag-line-price artisan-font-serif">

                                  ₹
                                  {formatCartMoney(
                                    row.line_subtotal,
                                  )}
                                </p>

                                <button
                                  type="button"
                                  className="cart-bag-remove"
                                  onClick={() =>
                                    remove(
                                      row.id
                                    )
                                  }
                                >

                                  <Trash2
                                    size={16}
                                    strokeWidth={2}
                                    aria-hidden
                                  />

                                  <span>
                                    Remove
                                  </span>

                                </button>

                              </div>

                            </div>

                          </li>
                        );
                      }
                    )
                  }

                </ul>

              </div>

              <aside className="cart-bag-col-summary">

                <div className="cart-bag-summary-card">

                  <h2 className="cart-bag-summary-title artisan-font-serif">

                    Order Summary
                  </h2>

                  <dl className="cart-bag-summary-lines">

                    <div className="cart-bag-summary-line">

                      <dt>
                        Subtotal
                      </dt>

                      <dd>

                        ₹
                        {formatCartMoney(
                          data.subtotal,
                        )}
                      </dd>

                    </div>

                    <div className="cart-bag-summary-line">

                      <dt>
                        Shipping estimate
                      </dt>

                      <dd className="cart-bag-summary-muted">

                        At checkout
                      </dd>

                    </div>

                    <div className="cart-bag-summary-line">

                      <dt>
                        Taxes
                      </dt>

                      <dd className="cart-bag-summary-muted">

                        At checkout
                      </dd>

                    </div>

                  </dl>

                  <div className="cart-bag-summary-divider" />

                  <div className="cart-bag-summary-total-row">

                    <span className="cart-bag-summary-total-label artisan-font-serif">

                      Total
                    </span>

                    <span className="cart-bag-summary-total-val artisan-font-serif">

                      ₹
                      {formatCartMoney(
                        data.subtotal,
                      )}
                    </span>

                  </div>

                  <button
                    type="button"
                    className="cart-bag-checkout"
                    disabled={
                      checkoutBusy ||
                      !data?.items?.length ||
                      !data?.can_checkout
                    }
                    onClick={handleCheckout}
                  >

                    {checkoutBusy
                      ? "Checking…"
                      : "Proceed to checkout"}
                  </button>

                  {
                    !data.can_checkout && (

                      <p className="cart-bag-summary-note">

                        Some items need attention before checkout (stock or
                        availability). Update quantities or remove lines, then
                        try again.
                      </p>
                    )
                  }

                  <p className="cart-bag-summary-trust">

                    Secure SSL encryption · 30-day returns
                  </p>

                </div>

              </aside>

            </div>
          )
        }

      </main>

    </div>
  );
}
