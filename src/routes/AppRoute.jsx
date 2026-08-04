// routes/AppRoute.jsx

import { BrowserRouter, Routes, Route } from "react-router-dom";

import UserRoutes from "../routes/user/UserRoute";

import AdminRoutes from "../routes/admin/AdminRoute";

export default function AppRoute() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<AdminRoutes />} />

        <Route path="/*" element={<UserRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}
