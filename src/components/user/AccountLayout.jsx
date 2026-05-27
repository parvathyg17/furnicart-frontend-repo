import "../../styles/account.css";
import logofc from "../../assets/images/logofc.png";

import {
  User,
  MapPin,
  Lock,
  LogOut,
  ShoppingCart,
} from "lucide-react";

import {
  NavLink,
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useDispatch,
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

      

      <header className="account-navbar">

        <div className="account-nav-inner">

          <Link
            to="/"
            className="account-logo"
          >
           <div className="auth-logo">
                     <img src={logofc} alt="logo" />
                   </div>
          </Link>

          <nav className="account-nav-links">

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

          <div className="account-nav-icons">

            

            <button>
              <ShoppingCart size={20} />
            </button>

            <button>
              <User size={20} />
            </button>

          </div>

        </div>

      </header>



      <div className="account-page">

        

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