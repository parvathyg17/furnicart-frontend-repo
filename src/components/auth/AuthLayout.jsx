import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ShoppingCart } from "lucide-react";
import "../../styles/auth.css";
import img1 from "../../assets/images/img1.png";
import logofc from "../../assets/images/logofc.png";
import { resolveMediaUrl } from "../../utils/mediaUrl";

function AuthLayout({
  children,
  title = "Crafted for your lifestyle.",
  subtitle = "Join our community of discerning collectors and interior design enthusiasts.",
}) {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="auth-page">
      
      {/* NAVBAR */}
      <header className="auth-navbar">
        <Link to="/" className="auth-logo">
          <img src={logofc} alt="Furnicart Logo" />
        </Link>

        <nav className="auth-nav-links">
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </nav>

        <div className="auth-nav-icons">
          <Link to="/cart">
            <ShoppingCart size={20} />
          </Link>
          
          <Link
            to={user ? "/profile" : "/login"}
            className="profile-nav-link"
          >
            {user ? (
              user.profile_image ? (
                <img
                  src={resolveMediaUrl(user.profile_image) || ""}
                  alt="profile"
                  className="nav-profile-image"
                />
              ) : (
                <div className="nav-profile-avatar">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
              )
            ) : (
              <span className="login-nav-btn">Login</span>
            )}
          </Link>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="auth-container">
        
        {/* LEFT IMAGE PANEL */}
        <div className="auth-image-section">
          <div className="auth-image-wrapper">
            <img src={img1} alt="Luxury furniture" />
            <div className="auth-overlay-content">
              <h2>{title}</h2>
              <p>{subtitle}</p>
            </div>
          </div>
        </div>

        {/* RIGHT FORM PANEL */}
        <div className="auth-form-section">
          <div className="auth-form-card">
            {children}
          </div>
        </div>

      </main>
      
    </div>
  );
}

export default AuthLayout;