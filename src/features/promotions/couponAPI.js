import api from "../../services/api";

/**
 * Admin coupon API (`/api/admin/coupons/`).
 * Customer checkout coupon calls will live here when added.
 */

export async function fetchAdminCoupons({
  page = 1,
  pageSize = 10,
  search = "",
  isActive = "",
} = {}) {
  const params = new URLSearchParams();

  params.set("page", String(page));

  params.set("page_size", String(pageSize));

  if (search.trim()) {
    params.set("search", search.trim());
  }

  if (isActive === "true" || isActive === "false") {
    params.set("is_active", isActive);
  }

  const res = await api.get(`admin/coupons/?${params.toString()}`);

  return res.data;
}

export async function postAdminCoupon(body) {
  const res = await api.post("admin/coupons/", body);

  return res.data;
}

export async function getAdminCoupon(couponId) {
  const res = await api.get(`admin/coupons/${couponId}/`);

  return res.data;
}

export async function patchAdminCoupon(couponId, body) {
  const res = await api.patch(`admin/coupons/${couponId}/`, body);

  return res.data;
}

export async function deleteAdminCoupon(couponId) {
  const res = await api.delete(`admin/coupons/${couponId}/`);

  return res.data;
}

/** Customer checkout — apply / remove cart coupon (`/api/cart/coupon/`). */

export async function fetchAvailableCoupons() {
  const res = await api.get("cart/available-coupons/");

  return res.data;
}

export async function applyCartCoupon(code) {
  const res = await api.post("cart/coupon/", {
    code,
  });

  return res.data;
}

export async function removeCartCoupon() {
  const res = await api.delete("cart/coupon/");

  return res.data;
}
