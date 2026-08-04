import { Routes, Route, Navigate } from "react-router-dom";

import AdminLogin from "../../pages/admin/AdminLogin";

import AdminDashboard from "../../pages/admin/AdminDashboard";

import AdminUsers from "../../pages/admin/AdminUsers";

import AdminPrivateRoute from "./AdminPrivateRoute";

import AdminPublicRoute from "./AdminPublicRoute";

import AdminLayout from "../../components/AdminLayout";

import AdminCategories from "../../pages/admin/categories/AdminCategories";

import AdminRoomType from "../../pages/admin/roomtype/AdminRoomTypes";

import AdminProducts from "../../pages/admin/products/AdminProducts";
import AdminVariantMediaLibrary from "../../pages/admin/products/AdminVariantMediaLibrary";
import AdminProductDetail from "../../pages/admin/products/AdminProductDetail";
import AdminOrders from "../../pages/admin/AdminOrders";
import AdminOrderDetail from "../../pages/admin/AdminOrderDetail";
import AdminReturns from "../../pages/admin/AdminReturns";
import AdminReviews from "../../pages/admin/AdminReviews";
import AdminInventory from "../../pages/admin/AdminInventory";
import AdminCoupons from "../../pages/admin/AdminCoupons";
import AdminOffers from "../../pages/admin/AdminOffers";
import AdminReferral from "../../pages/admin/AdminReferral";
import AdminSalesReport from "../../pages/admin/AdminSalesReport";
import AdminContactMessages from "../../pages/admin/AdminContactMessages";

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
        <Route index element={<Navigate to="dashboard" replace />} />

        <Route path="dashboard" element={<AdminDashboard />} />

        <Route path="reports/sales" element={<AdminSalesReport />} />

        <Route path="users" element={<AdminUsers />} />

        {/* CATEGORIES */}

        <Route path="categories" element={<AdminCategories />} />

        <Route path="room-types" element={<AdminRoomType />} />

        <Route path="orders/returns" element={<AdminReturns />} />

        <Route path="reviews" element={<AdminReviews />} />

        <Route path="coupons" element={<AdminCoupons />} />

        <Route path="offers" element={<AdminOffers />} />

        <Route path="referral" element={<AdminReferral />} />

        <Route path="contact-messages" element={<AdminContactMessages />} />

        <Route path="orders/:orderNumber" element={<AdminOrderDetail />} />

        <Route path="orders" element={<AdminOrders />} />

        <Route path="inventory" element={<AdminInventory />} />

        <Route path="products" element={<AdminProducts />} />

        <Route path="products/:id" element={<AdminProductDetail />} />

        <Route
          path="products/:productId/variants/:variantId/media"
          element={<AdminVariantMediaLibrary />}
        />
      </Route>

      <Route path="*" element={<h1>404 Not Found</h1>} />
    </Routes>
  );
}
