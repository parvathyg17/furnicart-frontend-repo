// routes/UserRoutes.jsx

import { Routes, Route, useLocation } from "react-router-dom";

import { useEffect } from "react";

import { captureReferralFromSearch } from "../../features/referral/referralAPI";

import Login from "../../pages/user/Login";
import Signup from "../../pages/user/Signup";
import OtpVerify from "../../pages/user/OtpVerify";
import ForgotPassword from "../../pages/user/ForgotPassword";
import ResetPassword from "../../pages/user/ResetPassword";

import Home from "../../pages/user/Home";

import Shop from "../../pages/user/Shop";

import ProductDetail from "../../pages/user/ProductDetail";

import Cart from "../../pages/user/Cart";

import Wishlist from "../../pages/user/Wishlist";

import ProfilePage from "../../pages/user/ProfilePage";
import WalletPage from "../../pages/user/WalletPage";
import EditProfile from "../../pages/user/EditProfile";
import ChangePasswordPage from "../../pages/user/ChangePassword";
import AddressPage from "../../pages/user/AddressPage";
import EditEmailPage from "../../pages/user/EditEmailPage";

import Checkout from "../../pages/user/Checkout";
import OrderSuccess from "../../pages/user/OrderSuccess";
import PaymentFailed from "../../pages/user/PaymentFailed";
import OrdersList from "../../pages/user/OrderList";
import OrderDetail from "../../pages/user/OrderDetail";
import PrivateRoute from "../user/PrivateRoute";
import PublicRoute from "../user/PublicRoute";
import About from "../../pages/user/About";
import Contact from "../../pages/user/Contact";

export default function UserRoutes() {
  const location = useLocation();

  useEffect(() => {
    captureReferralFromSearch(location.search);
  }, [location.search]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/shop" element={<Shop />} />

      <Route path="/about" element={<About />} />

      <Route path="/contact" element={<Contact />} />

      <Route path="/shop/product/:productSlug" element={<ProductDetail />} />

      <Route
        path="/cart"
        element={
          <PrivateRoute>
            <Cart />
          </PrivateRoute>
        }
      />

      <Route
        path="/checkout"
        element={
          <PrivateRoute>
            <Checkout />
          </PrivateRoute>
        }
      />

      <Route
        path="/checkout/success/:orderNumber"
        element={
          <PrivateRoute>
            <OrderSuccess />
          </PrivateRoute>
        }
      />

      <Route
        path="/checkout/payment-failed"
        element={
          <PrivateRoute>
            <PaymentFailed />
          </PrivateRoute>
        }
      />

      <Route
        path="/orders"
        element={
          <PrivateRoute>
            <OrdersList />
          </PrivateRoute>
        }
      />

      <Route
        path="/orders/:orderNumber"
        element={
          <PrivateRoute>
            <OrderDetail />
          </PrivateRoute>
        }
      />

      <Route
        path="/wishlist"
        element={
          <PrivateRoute>
            <Wishlist />
          </PrivateRoute>
        }
      />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />

      <Route
        path="/verify-otp"
        element={
          <PublicRoute>
            <OtpVerify />
          </PublicRoute>
        }
      />

      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />

      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        }
      />

      {/* PRIVATE ROUTES */}

      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        }
      />

      <Route
        path="/profile/edit"
        element={
          <PrivateRoute>
            <EditProfile />
          </PrivateRoute>
        }
      />

      <Route
        path="/profile/email/edit"
        element={
          <PrivateRoute>
            <EditEmailPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/profile/change-password"
        element={
          <PrivateRoute>
            <ChangePasswordPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/profile/addresses"
        element={
          <PrivateRoute>
            <AddressPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/profile/wallet"
        element={
          <PrivateRoute>
            <WalletPage />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<h1>404 Not Found</h1>} />
    </Routes>
  );
}
