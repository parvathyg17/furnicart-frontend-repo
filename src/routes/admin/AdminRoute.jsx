// routes/AdminRoutes.jsx

import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AdminLogin from "../../pages/admin/AdminLogin";

import AdminDashboard from "../../pages/admin/AdminDashboard";

import AdminUsers from "../../pages/admin/AdminUsers";

import AdminPrivateRoute from "./AdminPrivateRoute";

import AdminPublicRoute from "./AdminPublicRoute";

import AdminLayout from "../../components/AdminLayout";

export default function AdminRoutes() {

  return (

    <Routes>

      <Route
        path="/login"
        element={
          <AdminPublicRoute>
            <AdminLogin />
          </AdminPublicRoute>
        }
      />

      <Route
        path="/"
        element={
          <AdminPrivateRoute>
            <AdminLayout />
          </AdminPrivateRoute>
        }
      >

        <Route
          index
          element={
            <Navigate
              to="dashboard"
              replace
            />
          }
        />

        <Route
          path="dashboard"
          element={<AdminDashboard />}
        />

        <Route
          path="users"
          element={<AdminUsers />}
        />

      </Route>

      <Route
        path="*"
        element={<h1>404 Not Found</h1>}
      />

    </Routes>
  );
}