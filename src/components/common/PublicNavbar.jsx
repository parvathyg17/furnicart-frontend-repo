import {
  Link,
} from "react-router-dom";

import {
  useSelector,
} from "react-redux";

import {
  Heart,
} from "lucide-react";

import logofc from "../../assets/images/logofc.png";

import NavCartLink from "./NavCartLink.jsx";

import {
  resolveMediaUrl,
} from "../../utils/mediaUrl.js";

export default function PublicNavbar() {

  const {
    user,
  } = useSelector(
    (state) => state.auth,
  );

  return (

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

          <NavCartLink user={user} />

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

                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                )
              ) : (

                <button
                  type="button"
                  className="login-nav-btn"
                >
                  Login
                </button>
              )
            }
          </Link>
        </div>
      </div>
    </header>
  );
}
