// ==========================================
// src/components/common/Navbar.jsx
// ==========================================
import "../../styles/common.css";
import {
  Link,
} from "react-router-dom";

import {
  useSelector,
} from "react-redux";

import {
  ShoppingCart,
} from "lucide-react";

import logofc from "../../assets/images/logofc.png";


export default function Navbar() {

  // ==========================================
  // AUTH STATE
  // ==========================================

  const {
    user,
  } = useSelector(
    (state) => state.auth
  );

  return (

    <header className="main-navbar">

      <div className="main-nav-inner">

        {/* LOGO */}
        <Link
          to="/"
          className="main-logo"
        >

          <div className="auth-logo">

            <img
              src={logofc}
              alt="logo"
            />

          </div>

        </Link>


        {/* NAV LINKS */}
        <nav className="main-nav-links">

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


        {/* NAV ICONS */}
        <div className="main-nav-icons">

          {/* CART */}
          <button>

            <ShoppingCart size={20} />

          </button>


          {/* PROFILE / LOGIN */}
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

      </div>

    </header>
  );
}