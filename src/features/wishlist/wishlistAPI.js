import api from "../../services/api";

export async function fetchWishlist({ page = 1, pageSize = 5 } = {}) {
  const params = new URLSearchParams();

  params.set("page", String(page));

  params.set("page_size", String(pageSize));

  const response = await api.get(`wishlist/?${params.toString()}`);

  return response.data;
}

export async function toggleWishlistApi(variantId) {
  const response = await api.post("wishlist/toggle/", {
    variant_id: variantId,
  });

  return response.data;
}
