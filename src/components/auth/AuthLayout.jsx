import {
  Link,
} from "react-router-dom";

import {
  useSelector,
} from "react-redux";

import "../../styles/auth.css";

import img1 from "../../assets/images/img1.png";

import logofc from "../../assets/images/logofc.png";

import {
  ShoppingCart,
} from "lucide-react";

import {
  resolveMediaUrl,
} from "../../utils/mediaUrl";


function AuthLayout({

  children,

  title = "Crafted for your lifestyle.",

  subtitle =
    "Join our community of discerning collectors and interior design enthusiasts.",

}) {


  const {
    user,
  } = useSelector(
    (state) => state.auth
  );


  return (

    <div className="auth-page">


    
      <header className="auth-navbar">

        <div className="auth-logo">

          <img
            src={logofc}
            alt="logo"
          />

        </div>


        
        <nav className="auth-nav-links">

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


      
        <div className="auth-nav-icons">

          
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
                  src={
                    resolveMediaUrl(
                      user.profile_image,
                    ) || ""
                  }
                  alt="profile"
                  className="nav-profile-image"
                />

              ) : (

                <div className="nav-profile-avatar">

                  {user.username
                    ?.charAt(0)
                    .toUpperCase()}

                </div>
              )

            ) : (

              <button className="login-nav-btn">

                Login

              </button>

            )}

          </Link>

        </div>

      </header>


    
      <div className="auth-container">


        
        <div className="auth-image-section">

          <img
            src={img1}
            alt="furniture"
          />

          <div className="auth-overlay-content">

            <h2>
              {title}
            </h2>

            <p>
              {subtitle}
            </p>

          </div>

        </div>


        
        <div className="auth-form-section">

          {children}

        </div>

      </div>


      
      {/* <footer className="auth-footer">

        <div className="footer-logo">

          FURNICART

        </div>

        <div className="footer-links">

          <a href="/">
            Privacy Policy
          </a>

          <a href="/">
            Terms of Service
          </a>

          <a href="/">
            Shipping & Returns
          </a>

        </div>

        <div className="footer-copy">

          © 2026 Furnicart Furniture.
          Crafted with Intent.

        </div>

      </footer> */}

    </div>
  );
}

export default AuthLayout;