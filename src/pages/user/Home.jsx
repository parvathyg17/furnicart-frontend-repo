

import "../../styles/home.css";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ArrowRight,
  Star,
  Truck,
  ShieldCheck,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  useSelector,
} from "react-redux";

import {
  fetchFeaturedProducts,
} from "../../features/shop/shopAPI";

import {
  useBackgroundServerSync,
} from "../../hooks/useBackgroundServerSync.js";

import {
  stableStringify,
} from "../../utils/stableStringify.js";

import {
  shopProductPathFrom,
} from "../../utils/shopProductPath.js";

import OfferBadge from "../../features/promotions/components/OfferBadge.jsx";

import PublicNavbar from "../../components/common/PublicNavbar.jsx";

function featuredProductPrice(product) {

  const variants = (product.variants || []).filter(
    (v) => v.is_active
  );

  if (!variants.length)
    return null;

  const n = Math.min(
    ...variants.map(
      (v) => Number(v.price)
    )
  );

  if (Number.isNaN(n))
    return null;

  return n.toLocaleString(
    undefined,
    {

      minimumFractionDigits: 2,

      maximumFractionDigits: 2,
    }
  );
}

function featuredProductBlurb(product) {

  const t = (product.description || "").trim();

  if (!t)
    return product.category_name || "";

  return t.length > 120

    ? `${t.slice(0, 117)}…`

    : t;
}

function featuredProductSoldOut(product) {

  const variants =
    product?.variants || [];

  if (!variants.length) {

    return (
      product?.stock_status ===
      "out_of_stock"
    );
  }

  return !variants.some(
    (v) =>
      v.is_active &&
      (v.stock || 0) > 0
  );
}

export default function Home() {

  const {
    checkingAuth,
  } = useSelector(
    (state) => state.auth,
  );

  const [
    featuredProducts,
    setFeaturedProducts,
  ] = useState([]);

  const [
    featuredLoading,
    setFeaturedLoading,
  ] = useState(true);

  const lastFeaturedSigRef =
    useRef(
      null,
    );

  const loadFeatured =
    useCallback(
      async (
        { silent = false } = {},
      ) => {

        if (!silent) {

          setFeaturedLoading(
            true,
          );
        }

        try {

          const data =
            await fetchFeaturedProducts(
              6,
            );

          const rows =
            Array.isArray(
              data?.results,
            )

              ? data.results

              : [];

          const snap =
            stableStringify(
              rows,
            );

          if (
            silent &&
            lastFeaturedSigRef.current ===
              snap
          ) {

            return;
          }

          lastFeaturedSigRef.current =
            snap;

          setFeaturedProducts(
            rows,
          );
        } catch {

          if (!silent) {

            setFeaturedProducts(
              [],
            );
          }
        } finally {

          if (!silent) {

            setFeaturedLoading(
              false,
            );
          }
        }
      },

      [],
    );

  useEffect(
    () => {

      loadFeatured();
    },

    [
      loadFeatured,
    ],
  );

  useBackgroundServerSync(
    {

      enabled: true,

      pollIntervalMs: 120_000,

      onRefresh:
        () =>
          loadFeatured(
            {
              silent: true,
            },
          ),
    },
  );

  if (checkingAuth) {

    return (
      <div className="home-loading">
        Loading...
      </div>
    );

  }

  return (
    <div className="home-page">

      <PublicNavbar />

    

      <section className="hero-section">

        <div className="hero-content">

          <span className="hero-tag">
            Luxury Interior Collection
          </span>

          <h1>
            Crafted Comfort
            <br />
            For Timeless
            Living.
          </h1>

          <p>

            Discover furnicart-crafted
            furniture designed for
            modern elegance and
            everyday luxury.

          </p>

          <div className="hero-buttons">

            <Link
              to="/shop"
              className="hero-primary-btn"
            >
              Shop Collection
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/about"
              className="hero-secondary-btn"
            >
              Explore Brand
            </Link>

          </div>

        </div>

        <div className="hero-image">

          <img
            src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1600&auto=format&fit=crop"
            alt=""
          />

        </div>

      </section>


      <section className="features-section">

        <div className="feature-card">

          <Truck size={34} />

          <h3>
            White Glove Delivery
          </h3>

          <p>
            Premium delivery with
            expert installation.
          </p>

        </div>

        <div className="feature-card">

          <ShieldCheck size={34} />

          <h3>
            Premium Craftsmanship
          </h3>

          <p>
            Handcrafted materials
            built for timeless homes.
          </p>

        </div>

        <div className="feature-card">

          <Star size={34} />

          <h3>
            Luxury Experience
          </h3>

          <p>
            Elegant furniture designed
            for sophisticated living.
          </p>

        </div>

      </section>

 

      <section className="collection-section">

        <div className="section-head">

          <div>

            <span>
              Featured
            </span>

            <h2>
              Hand-picked for you
            </h2>

          </div>

          <Link
            to="/shop"
            className="view-all-btn"
          >
            View All
          </Link>

        </div>

        <div className="collection-grid">

          {
            featuredLoading && (

              <>

                <div className="collection-card collection-card-skeleton">

                  <div className="collection-skeleton-img" />

                  <div className="collection-info">

                    <div className="collection-skeleton-line" />

                    <div className="collection-skeleton-line short" />

                  </div>

                </div>

                <div className="collection-card collection-card-skeleton">

                  <div className="collection-skeleton-img" />

                  <div className="collection-info">

                    <div className="collection-skeleton-line" />

                    <div className="collection-skeleton-line short" />

                  </div>

                </div>

                <div className="collection-card collection-card-skeleton">

                  <div className="collection-skeleton-img" />

                  <div className="collection-info">

                    <div className="collection-skeleton-line" />

                    <div className="collection-skeleton-line short" />

                  </div>

                </div>

              </>
            )
          }

          {
            !featuredLoading &&
            featuredProducts.length > 0 &&
            featuredProducts.map(
              (p) => {

                const price = featuredProductPrice(
                  p
                );

                const soldOut =
                  featuredProductSoldOut(
                    p
                  );

                const productPath =
                  shopProductPathFrom(
                    p,
                  );

                return (

                  <Link
                    key={p.id}
                    className="collection-card"
                    to={
                      productPath ||
                      "/shop"
                    }
                  >

                    <div className="collection-card-media">

                      {
                        soldOut && (

                          <span className="fc-sold-out-badge">
                            Sold out
                          </span>
                        )
                      }

                      <OfferBadge
                        product={p}
                      />

                      {
                        p.thumbnail ? (

                          <img
                            src={p.thumbnail}
                            alt={p.name}
                          />
                        ) : (

                          <div className="collection-card-ph">
                            No image
                          </div>
                        )
                      }

                    </div>

                    <div className="collection-info">

                      <h3>
                        {p.name}
                      </h3>

                      <p>
                        {featuredProductBlurb(
                          p
                        )}
                      </p>

                      {
                        price && (

                          <span className="collection-price">

                          ₹ 
                            {price}
                          </span>
                        )
                      }

                    </div>

                  </Link>
                );
              }
            )
          }

          {
            !featuredLoading &&
            featuredProducts.length === 0 && (

              <p className="collection-empty">

                No featured products yet. Browse the full collection in the
                shop, or ask an admin to mark items as featured in the catalog.
              </p>
            )
          }

        </div>

      </section>

  

      <section className="cta-section">

        <div className="cta-content">

          <span>
            Designed For Elegant Homes
          </span>

          <h2>
            Elevate your interior
            with furnicart furniture.
          </h2>

          <Link
            to="/shop"
            className="hero-primary-btn"
          >
            Explore Collection
          </Link>

        </div>

      </section>

      
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