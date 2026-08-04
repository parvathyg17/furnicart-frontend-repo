import "../../styles/home.css";

import { useCallback, useEffect, useRef, useState } from "react";

import { ArrowRight, Star, Truck, ShieldCheck } from "lucide-react";

import { Link } from "react-router-dom";

import { useSelector } from "react-redux";

import { fetchFeaturedProducts } from "../../features/shop/shopAPI";

import { fetchPublicOffers } from "../../features/promotions/offerAPI";

import { useBackgroundServerSync } from "../../hooks/useBackgroundServerSync.js";

import { stableStringify } from "../../utils/stableStringify.js";

import { shopProductPathFrom } from "../../utils/shopProductPath.js";

import OfferBadge, {
  ProductPriceDisplay,
} from "../../features/promotions/components/OfferBadge.jsx";

import { catalogVariantForSort } from "../../features/shop/shopListUtils.js";

import PublicNavbar from "../../components/common/PublicNavbar.jsx";

function featuredProductBlurb(product) {
  const t = (product.description || "").trim();

  if (!t) return product.category_name || "";

  return t.length > 120 ? `${t.slice(0, 117)}…` : t;
}

function featuredProductSoldOut(product) {
  const variants = product?.variants || [];

  if (!variants.length) {
    return product?.stock_status === "out_of_stock";
  }

  return !variants.some((v) => v.is_active && (v.stock || 0) > 0);
}

export default function Home() {
  const { checkingAuth } = useSelector((state) => state.auth);

  const [featuredProducts, setFeaturedProducts] = useState([]);

  const [featuredLoading, setFeaturedLoading] = useState(true);

  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(true);

  const carouselRef = useRef(null);

  useEffect(() => {
    if (!offersLoading && offers.length > 1 && carouselRef.current) {
      const interval = setInterval(() => {
        const container = carouselRef.current;
        if (!container) return;
        const scrollLeft = container.scrollLeft;
        const clientWidth = container.clientWidth;
        const scrollWidth = container.scrollWidth;

        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          container.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          container.scrollBy({ left: clientWidth, behavior: "smooth" });
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [offersLoading, offers]);

  const lastFeaturedSigRef = useRef(null);

  const loadFeatured = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) {
        setFeaturedLoading(true);
      }

      try {
        const data = await fetchFeaturedProducts(6);

        const rows = Array.isArray(data?.results) ? data.results : [];

        const snap = stableStringify(rows);

        if (silent && lastFeaturedSigRef.current === snap) {
          return;
        }

        lastFeaturedSigRef.current = snap;

        setFeaturedProducts(rows);
      } catch {
        if (!silent) {
          setFeaturedProducts([]);
        }
      } finally {
        if (!silent) {
          setFeaturedLoading(false);
        }
      }
    },

    [],
  );

  const loadOffers = useCallback(async () => {
    try {
      const data = await fetchPublicOffers();
      setOffers(data || []);
    } catch {
      setOffers([]);
    } finally {
      setOffersLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeatured();
    loadOffers();
  }, [loadFeatured, loadOffers]);

  useBackgroundServerSync({
    enabled: true,

    pollIntervalMs: 120_000,

    onRefresh: () =>
      loadFeatured({
        silent: true,
      }),
  });

  if (checkingAuth) {
    return <div className="home-loading">Loading...</div>;
  }

  return (
    <div className="home-page">
      <PublicNavbar />

      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-tag">Luxury Interior Collection</span>

          <h1>
            Crafted Comfort
            <br />
            For Timeless Living.
          </h1>

          <p>
            Discover furnicart-crafted furniture designed for modern elegance
            and everyday luxury.
          </p>

          <div className="hero-buttons">
            <Link to="/shop" className="hero-primary-btn">
              Shop Collection
              <ArrowRight size={18} />
            </Link>

            <Link to="/about" className="hero-secondary-btn">
              Explore
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

      {!offersLoading && offers.length > 0 && (
        <section
          className="offers-banner-carousel"
          style={{
            width: "100%",
            margin: "2rem 0",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            ref={carouselRef}
            style={{
              display: "flex",
              overflowX: "auto",
              scrollSnapType: "x mandatory",
              scrollBehavior: "smooth",
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none" /* Firefox */,
              msOverflowStyle: "none" /* IE */,
            }}
            className="fc-hide-scrollbar"
          >
            {(Array.isArray(offers) ? offers : offers.results || []).map(
              (offer) => (
                <div
                  key={offer.id}
                  style={{
                    flex: "0 0 100%",
                    scrollSnapAlign: "start",
                    padding: "0 5%",
                    boxSizing: "border-box",
                  }}
                >
                  <Link
                    to={
                      offer.offer_type === "product" && offer.product
                        ? `/shop/product/${offer.product_slug || offer.product}`
                        : offer.offer_type === "category" && offer.category
                          ? `/shop?category=${offer.category_slug || offer.category}`
                          : "/shop"
                    }
                    style={{
                      display: "block",
                      position: "relative",
                      borderRadius: "16px",
                      overflow: "hidden",
                      cursor: "pointer",
                      textDecoration: "none",
                    }}
                  >
                    <img
                      src={
                        offer.image?.startsWith("http")
                          ? offer.image
                          : `${import.meta.env.VITE_API_URL}${offer.image}`
                      }
                      alt={offer.title}
                      style={{
                        width: "100%",
                        height: "350px",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        padding: "2rem",
                        color: "white",
                      }}
                    >
                      <span
                        style={{
                          background: "white",
                          color: "black",
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "0.8rem",
                          fontWeight: "bold",
                          width: "fit-content",
                          marginBottom: "12px",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                        }}
                      >
                        {offer.discount_type === "percent"
                          ? `${offer.discount_value}% OFF`
                          : `₹${offer.discount_value} OFF`}
                      </span>
                      <h2
                        style={{
                          margin: "0 0 8px 0",
                          fontSize: "2rem",
                          fontWeight: "600",
                          textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                        }}
                      >
                        {offer.title}
                      </h2>
                      {offer.description && (
                        <p
                          style={{
                            margin: 0,
                            fontSize: "1.1rem",
                            opacity: 0.9,
                            textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                          }}
                        >
                          {offer.description}
                        </p>
                      )}
                    </div>
                  </Link>
                </div>
              ),
            )}
          </div>
        </section>
      )}

      <section className="features-section">
        <div className="feature-card">
          <Truck size={34} />

          <h3>White Glove Delivery</h3>

          <p>Premium delivery with expert installation.</p>
        </div>

        <div className="feature-card">
          <ShieldCheck size={34} />

          <h3>Premium Craftsmanship</h3>

          <p>Handcrafted materials built for timeless homes.</p>
        </div>

        <div className="feature-card">
          <Star size={34} />

          <h3>Luxury Experience</h3>

          <p>Elegant furniture designed for sophisticated living.</p>
        </div>
      </section>

      <section className="collection-section">
        <div className="section-head">
          <div>
            <span>Featured</span>

            <h2>Hand-picked for you</h2>
          </div>

          <Link to="/shop" className="view-all-btn">
            View All
          </Link>
        </div>

        <div className="collection-grid">
          {featuredLoading && (
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
          )}

          {!featuredLoading &&
            featuredProducts.length > 0 &&
            featuredProducts.map((p) => {
              const featuredVariant = catalogVariantForSort(p, "price_low");

              const soldOut = featuredProductSoldOut(p);

              const productPath = shopProductPathFrom(p);

              return (
                <Link
                  key={p.id}
                  className="collection-card"
                  to={productPath || "/shop"}
                >
                  <div className="collection-card-media">
                    {soldOut && (
                      <span className="fc-sold-out-badge">Sold out</span>
                    )}

                    <OfferBadge product={p} />

                    {p.thumbnail ? (
                      <img src={p.thumbnail} alt={p.name} />
                    ) : (
                      <div className="collection-card-ph">No image</div>
                    )}
                  </div>

                  <div className="collection-info">
                    <h3>{p.name}</h3>

                    <p>{featuredProductBlurb(p)}</p>

                    {featuredVariant && (
                      <ProductPriceDisplay
                        variant={featuredVariant}
                        product={p}
                        className="collection-price"
                        as="span"
                        minFractionDigits={2}
                        maxFractionDigits={2}
                      />
                    )}
                  </div>
                </Link>
              );
            })}

          {!featuredLoading && featuredProducts.length === 0 && (
            <p className="collection-empty">
              No featured products yet. Browse the full collection in the shop,
              or ask an admin to mark items as featured in the catalog.
            </p>
          )}
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <span>Designed For Elegant Homes</span>

          <h2>Elevate your interior with furnicart furniture.</h2>

          <Link to="/shop" className="hero-primary-btn">
            Explore Collection
          </Link>
        </div>
      </section>

      <footer className="home-footer">
        <div className="home-footer-inner">
          <div className="footer-logo">FURNICART</div>

          <div className="footer-links">
            <Link to="/">Privacy Policy</Link>

            <Link to="/">Terms of Service</Link>

            <Link to="/">Shipping Information</Link>

            <Link to="/">Return Policy</Link>
          </div>

          <div className="footer-copy">
            © 2026 Furnicart. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
