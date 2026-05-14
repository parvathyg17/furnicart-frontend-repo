// routes/UserRoutes.jsx

import {
  Routes,
  Route,
} from "react-router-dom";

import Login from "../../pages/user/Login";
import Signup from "../../pages/user/Signup";
import OtpVerify from "../../pages/user/OtpVerify";
import ForgotPassword from "../../pages/user/ForgotPassword";
import ResetPassword from "../../pages/user/ResetPassword";

import Home from "../../pages/user/Home";

import ProfilePage from "../../pages/user/ProfilePage";
import EditProfile from "../../pages/user/EditProfile";
import ChangePasswordPage from "../../pages/user/ChangePassword";
import AddressPage from "../../pages/user/AddressPage";
import EditEmailPage from "../../pages/user/EditEmailPage";

import PrivateRoute from "../user/PrivateRoute";
import PublicRoute from "../user/PublicRoute";

export default function UserRoutes() {

  return (

    <Routes>

      <Route
        path="/"
        element={<Home />}
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
        path="*"
        element={<h1>404 Not Found</h1>}
      />

    </Routes>
  );
}