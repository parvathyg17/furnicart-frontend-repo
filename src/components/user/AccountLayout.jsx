import "../../styles/account.css";
import "../../styles/home.css";
import logofc from "../../assets/images/logofc.png";

import {
  User,
  MapPin,
  Lock,
  LogOut,
  ShoppingCart,
  Heart,
} from "lucide-react";

import {
  NavLink,
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  useState,
} from "react";

import {
  logoutUser,
} from "../../features/auth/authSlice";

export default function AccountLayout({
  children,
}) {

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const {
    user,
  } = useSelector(
    (state) => state.auth
  );

  const [
    showLogoutModal,
    setShowLogoutModal,
  ] = useState(false);

  const handleLogout =
    async () => {

      const res =
        await dispatch(
          logoutUser()
        );

      if (!res.error) {

        navigate("/login");

      }

    };

  return (
    <>

      

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
                        user.username?.charAt(
                          0
                        ).toUpperCase()
                      }

                    </div>
                  )

                ) : (

                  <span className="login-nav-btn">

                    Login

                  </span>
                )
              }

            </Link>

          </div>

        </div>

      </header>

      <div className="account-page account-page--below-home-navbar">

        

        <aside className="account-sidebar">

          <div>

            <h2>
              My Account
            </h2>

            <p>
              Manage your settings
            </p>

            <NavLink
              to="/profile"
              end
              className={({
                isActive,
              }) =>
                isActive
                  ? "account-menu active"
                  : "account-menu"
              }
            >
              <User size={18} />
              Profile
            </NavLink>

            <NavLink
              to="/profile/addresses"
              className={({
                isActive,
              }) =>
                isActive
                  ? "account-menu active"
                  : "account-menu"
              }
            >
              <MapPin size={18} />
              Address
            </NavLink>

            <NavLink
              to="/profile/change-password"
              className={({
                isActive,
              }) =>
                isActive
                  ? "account-menu active"
                  : "account-menu"
              }
            >
              <Lock size={18} />
              Change Password
            </NavLink>

          </div>

          <button
            className="logout-btn"
            onClick={() =>
              setShowLogoutModal(
                true
              )
            }
          >
            <LogOut size={18} />
            Logout
          </button>

        </aside>

        

        <main className="account-content">
          {children}
        </main>

      </div>

     

      <footer className="account-footer">

        <div className="account-footer-inner">

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

   

      {showLogoutModal && (

        <div className="logout-overlay">

          <div className="logout-modal">

            <h2>
              Logout Account
            </h2>

            <p>
              Are you sure you want
              to logout from your
              account?
            </p>

            <div className="logout-actions">

              <button
                className="cancel-btn"
                onClick={() =>
                  setShowLogoutModal(
                    false
                  )
                }
              >
                Cancel
              </button>

              <button
                className="confirm-btn"
                onClick={
                  handleLogout
                }
              >
                Logout
              </button>

            </div>

          </div>

        </div>

      )}

    </>
  );
}