

import "../../styles/home.css";
import logofc from "../../assets/images/logofc.png";

import {
  ArrowRight,
  ShoppingCart,
  User,
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

export default function Home() {

  const {
    user,
    checkingAuth,
  } = useSelector(
    (state) => state.auth
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

      {/* =====================================
          NAVBAR
      ===================================== */}

      <header className="home-navbar">

        <div className="home-nav-inner">

          <Link
            to="/"
            className="home-logo"
          >
            
             <div className="auth-logo">
                      <img src={logofc} alt="logo" />
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

            

            <button>
              <ShoppingCart size={20} />
            </button>

            <Link
  to={
    user
      ? "/profile"
      : "/login"
  }
  className="profile-nav-link"
>

  {user ? (

    user.profile_image ? (

      <img
        src={`http://127.0.0.1:8000${user.profile_image}`}
        alt="profile"
        className="nav-profile-image"
      />

    ) : (

      <div className="nav-profile-avatar">

        {user.username?.charAt(0).toUpperCase()}

      </div>
    )

  ) : (

    <button className="login-nav-btn">

      Login

    </button>

  )}

</Link>

          </div>

        </div>

      </header>

      {/* =====================================
          HERO
      ===================================== */}

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

      {/* =====================================
          FEATURES
      ===================================== */}

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

      {/* =====================================
          COLLECTION
      ===================================== */}

      <section className="collection-section">

        <div className="section-head">

          <div>

            <span>
              Curated Collection
            </span>

            <h2>
              Signature Pieces
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

          <div className="collection-card">

            <img
              src="https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=1200&auto=format&fit=crop"
              alt=""
            />

            <div className="collection-info">

              <h3>
                Premium Chair
              </h3>

              <p>
                Modern handcrafted
                seating collection.
              </p>

            </div>

          </div>

          <div className="collection-card">

            <img
              src="https://images.unsplash.com/photo-1484101403633-562f891dc89a?q=80&w=1200&auto=format&fit=crop"
              alt=""
            />

            <div className="collection-info">

              <h3>
                Luxe Sofa
              </h3>

              <p>
                Elegant comfort for
                refined interiors.
              </p>

            </div>

          </div>

          <div className="collection-card">

            <img
              src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop"
              alt=""
            />

            <div className="collection-info">

              <h3>
                Minimal Table
              </h3>

              <p>
                Contemporary furniture
                with timeless appeal.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================
          CTA
      ===================================== */}

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

      {/* =====================================
          FOOTER
      ===================================== */}

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