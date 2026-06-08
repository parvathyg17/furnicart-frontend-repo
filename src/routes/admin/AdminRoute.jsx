import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AdminLogin
from "../../pages/admin/AdminLogin";

import AdminDashboard
from "../../pages/admin/AdminDashboard";

import AdminUsers
from "../../pages/admin/AdminUsers";

import AdminPrivateRoute
from "./AdminPrivateRoute";

import AdminPublicRoute
from "./AdminPublicRoute";

import AdminLayout
from "../../components/AdminLayout";

import AdminCategories
from "../../pages/admin/categories/AdminCategories";

import AdminRoomType
from "../../pages/admin/roomtype/AdminRoomTypes";

import AdminProducts
from "../../pages/admin/products/AdminProducts";
import AdminVariantMediaLibrary from "../../pages/admin/products/AdminVariantMediaLibrary"
import AdminProductDetail
from "../../pages/admin/products/AdminProductDetail";
import AdminOrders from "../../pages/admin/AdminOrders";
import AdminOrderDetail from "../../pages/admin/AdminOrderDetail";
import AdminReturns from "../../pages/admin/AdminReturns";
import AdminInventory from "../../pages/admin/AdminInventory";


export default function AdminRoutes() {

  return (

    <Routes>

      {/* LOGIN */}

      <Route
        path="/login"
        element={

          <AdminPublicRoute>

            <AdminLogin />

          </AdminPublicRoute>
        }
      />

      

      {/* ADMIN LAYOUT */}

      <Route
        path="/"
        element={

          <AdminPrivateRoute>

            <AdminLayout />

          </AdminPrivateRoute>
        }
      >

        {/* REDIRECT */}

        <Route
          index
          element={
            <Navigate
              to="dashboard"
              replace
            />
          }
        />

        {/* DASHBOARD */}

        <Route
          path="dashboard"
          element={
            <AdminDashboard />
          }
        />

       

        {/* USERS */}

        <Route
          path="users"
          element={
            <AdminUsers />
          }
        />

        {/* CATEGORIES */}

        <Route
          path="categories"
          element={
            <AdminCategories />
          }
        />

        {/* ROOM TYPES */}

        <Route
          path="room-types"
          element={
            <AdminRoomType />
          }
        />

        <Route
          path="orders/returns"
          element={
            <AdminReturns />
          }
        />

        <Route
          path="orders/:orderNumber"
          element={
            <AdminOrderDetail />
          }
        />

        <Route
          path="orders"
          element={
            <AdminOrders />
          }
        />

        <Route
          path="inventory"
          element={
            <AdminInventory />
          }
        />

        {/* PRODUCTS */}

        <Route
          path="products"
          element={
            <AdminProducts />
          }
        />

        {/* PRODUCT DETAIL */}

        <Route
          path="products/:id"
          element={
            <AdminProductDetail />
          }
        />

       <Route
          path="products/:productId/variants/:variantId/media"
          element={
            <AdminVariantMediaLibrary />
          }
        />

      </Route>

      {/* 404 */}

      <Route
        path="*"
        element={
          <h1>
            404 Not Found
          </h1>
        }
      />

    </Routes>
  );
}