import "../../styles/home.css";

import "../../styles/shop.css";

import logofc from "../../assets/images/logofc.png";

import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useSelector,
} from "react-redux";

import {
  Heart,
  ShoppingCart,
} from "lucide-react";

import {
  fetchWishlist,
  toggleWishlistApi,
} from "../../features/wishlist/wishlistAPI.js";

import {
  addToCartApi,
} from "../../features/cart/cartAPI";

import {
  formatProductApiError,
} from "../../utils/productApiErrors.js";

function formatWishlistMoney(
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

function wishlistVariantImage(
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

function wishlistVariantSubtitle(
  variant,
) {

  if (!variant)
    return "";

  const parts =
    [

      variant.material,

      variant.color,

      variant.size,
    ]

      .map(
        (s) =>
          (s || "")
            .trim(),
      )

      .filter(Boolean);

  if (parts.length)
    return parts.join(
      " / ",
    );

  return (
    (variant.variant_name || "")
      .trim()
  );
}

export default function Wishlist() {

  const navigate =
    useNavigate();

  const {
    user,
    checkingAuth,
  } = useSelector(
    (state) =>
      state.auth,
  );

  const [
    items,
    setItems,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState(null);

  const load =
    async () => {

      setLoading(true);

      setError(null);

      try {

        const res =
          await fetchWishlist();

        setItems(
          res.results || [],
        );
      } catch (err) {

        if (
          err.response?.status ===
          401
        ) {

          navigate(
            "/login",
          );

          return;
        }

        setError(

          formatProductApiError(
            err.response?.data,
          ) ||

            "Could not load wishlist.",
        );
      } finally {

        setLoading(false);
      }
    };

  useEffect(() => {

    load();
  }, []);

  const remove =
    async (variantId) => {

      try {

        await toggleWishlistApi(
          variantId,
        );

        await load();
      } catch (err) {

        setError(

          formatProductApiError(
            err.response?.data,
          ) ||

            "Could not update wishlist.",
        );
      }
    };

  const moveToCart =
    async (
      variantId,
    ) => {

      setError(null);

      try {

        await addToCartApi({
          variantId,

          quantity: 1,
        });

        await load();
      } catch (err) {

        setError(

          formatProductApiError(
            err.response?.data,
          ) ||

            "Could not add to cart.",
        );
      }
    };

  if (checkingAuth) {

    return (

      <div className="home-loading">
        Loading...
      </div>
    );
  }

  const count =
    items.length;

  const countLabel =
    count === 1
      ? "1 item"
      : `${count} items`;

  return (

    <div className="home-page wishlist-page">

      <header className="home-navbar">

        <div className="home-nav-inner">

          <Link
            to="/"
            className="home-logo"
          >

            <div className="auth-logo">

              <img
                src={logofc}
                alt="logo"
              />

            </div>

          </Link>

          <nav className="home-nav-links">

            <Link to="/">
              Home
            </Link>

            <Link to="/shop">
              Shop
            </Link>

            <Link to="/about">
              About
            </Link>

            <Link to="/contact">
              Contact
            </Link>

          </nav>

          <div className="home-nav-icons">

            <Link
              to={
                user
                  ? "/wishlist"
                  : "/login"
              }
              className="profile-nav-link"
              aria-label="Wishlist"
            >

              <Heart size={20} />
            </Link>

            <Link
              to={
                user
                  ? "/cart"
                  : "/login"
              }
              className="profile-nav-link"
              aria-label="Cart"
            >

              <ShoppingCart size={20} />
            </Link>

            <Link
              to={
                user
                  ? "/profile"
                  : "/login"
              }
              className="profile-nav-link"
            >

              {
                user ? (

                  user.profile_image ? (

                    <img
                      src={`http://127.0.0.1:8000${user.profile_image}`}
                      alt="profile"
                      className="nav-profile-image"
                    />

                  ) : (

                    <div className="nav-profile-avatar">

                      {
                        user.username?.charAt(0).toUpperCase()
                      }

                    </div>
                  )

                ) : (

                  <button className="login-nav-btn">

                    Login

                  </button>
                )
              }

            </Link>

          </div>

        </div>

      </header>

      <main className="wishlist-main">

        <nav
          className="wishlist-bc"
          aria-label="Breadcrumb"
        >

          <Link to="/">
            Home
          </Link>

          <span
            className="wishlist-bc-sep"
            aria-hidden="true"
          >
            ›
          </span>

          <Link to="/profile">
            My Account
          </Link>

          <span
            className="wishlist-bc-sep"
            aria-hidden="true"
          >
            ›
          </span>

          <span
            className="wishlist-bc-current"
            aria-current="page"
          >
            Wishlist
          </span>

        </nav>

        <h1 className="wishlist-title">

          My Wishlist
        </h1>

        {
          !loading && (

            <p className="wishlist-lead">

              {
                count === 0
                  ? "Save pieces you love — they will appear here."
                  : `You have ${countLabel} curated for your home.`
              }

            </p>
          )
        }

        {
          error && (

            <div
              className="shop-banner error wishlist-banner"
              role="alert"
            >

              {error}
            </div>
          )
        }

        {
          loading ? (

            <p className="wishlist-muted">
              Loading…
            </p>
          ) : count === 0 ? (

            <div className="wishlist-empty">

              <p className="wishlist-muted">

                Your wishlist is empty.
              </p>

              <Link
                className="wishlist-empty-cta"
                to="/shop"
              >
                Browse shop
              </Link>

            </div>
          ) : (

            <ul className="wishlist-grid">

              {
                items.map(
                  (row) => {

                    const v =
                      row.variant;

                    const p =
                      v?.product;

                    const imgUrl =
                      wishlistVariantImage(
                        v,
                      );

                    const sub =
                      wishlistVariantSubtitle(
                        v,
                      );

                    const pid =
                      p?.id || "";

                    return (

                      <li
                        key={row.id}
                        className="wishlist-card"
                      >

                        <Link
                          className="wishlist-card-media"
                          to={`/shop/product/${pid}`}
                        >

                          {
                            imgUrl ? (

                              <img
                                src={imgUrl}
                                alt=""
                              />
                            ) : (

                              <div
                                className="wishlist-card-ph"
                                aria-hidden="true"
                              />
                            )
                          }

                        </Link>

                        <div className="wishlist-card-body">

                          <Link
                            className="wishlist-card-title-link"
                            to={`/shop/product/${pid}`}
                          >

                            <h2 className="wishlist-card-title">

                              {
                                p?.name ||
                                "Product"
                              }

                            </h2>

                          </Link>

                          {
                            sub && (

                              <p className="wishlist-card-meta">

                                {sub}
                              </p>
                            )
                          }

                          <p className="wishlist-card-price">

                            ₹
                            {formatWishlistMoney(
                              v?.price,
                            )}
                          </p>

                          <button
                            type="button"
                            className="wishlist-move-btn"
                            onClick={() =>
                              moveToCart(
                                v.id,
                              )
                            }
                          >
                            Move to bag
                          </button>

                          <button
                            type="button"
                            className="wishlist-remove-link"
                            onClick={() =>
                              remove(
                                v.id,
                              )
                            }
                          >
                            Remove from wishlist
                          </button>

                        </div>

                      </li>
                    );
                  },
                )
              }

            </ul>
          )
        }

      </main>

      <footer className="home-footer">

        <div className="home-footer-inner">

          <div className="footer-logo">
            FURNICART
          </div>

          <div className="footer-links">

            <Link to="/">
              Privacy Policy
            </Link>

            <Link to="/">
              Terms of Service
            </Link>

            <Link to="/">
              Shipping Information
            </Link>

            <Link to="/">
              Return Policy
            </Link>

          </div>

          <div className="footer-copy">
            © 2026 Furnicart.
            All rights reserved.
          </div>

        </div>

      </footer>

    </div>
  );
}
