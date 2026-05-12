// ===============================
// src/components/auth/AuthLayout.jsx
// ===============================

import { Link } from "react-router-dom";

import "../../styles/auth.css";

import img1 from "../../assets/images/img1.png";
import logofc from "../../assets/images/logofc.png";

import {
  Search,
  ShoppingCart,
  User,
} from "lucide-react";

function AuthLayout({
  children,
  title = "Crafted for your lifestyle.",
  subtitle = "Join our community of discerning collectors and interior design enthusiasts.",
}) {
  return (
    <div className="auth-page">

      
      <header className="auth-navbar">
        <div className="auth-logo">
          <img src={logofc} alt="logo" />
        </div>

        <nav className="auth-nav-links">
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </nav>

        <div className="auth-nav-icons">
          
          <ShoppingCart size={20} />
          <User size={20} />
        </div>
      </header>

     
      <div className="auth-container">

        {/* LEFT SIDE */}
        <div className="auth-image-section">

          <img src={img1} alt="furniture" />

          <div className="auth-overlay-content">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="auth-form-section">
          {children}
        </div>

      </div>

      
      <footer className="auth-footer">

        <div className="footer-logo">
          FURNICART
        </div>

        <div className="footer-links">
          <a href="/">Privacy Policy</a>
          <a href="/">Terms of Service</a>
          <a href="/">Shipping & Returns</a>
        </div>

        <div className="footer-copy">
          © 2026 Furnicart Furniture. Crafted with Intent.
        </div>

      </footer>

    </div>
  );
}

export default AuthLayout;