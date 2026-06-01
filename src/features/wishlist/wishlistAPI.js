import api from "../../services/api";

export async function fetchWishlist() {

  const response = await api.get(
    "wishlist/",
  );

  return response.data;
}

export async function toggleWishlistApi(variantId) {

  const response = await api.post(
    "wishlist/toggle/",
    {
      variant_id: variantId,
    }
  );

  return response.data;
}