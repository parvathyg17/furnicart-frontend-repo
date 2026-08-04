import api from "../../services/api";

export async function fetchCart() {
  const response = await api.get("cart/");

  return response.data;
}

// export function getProductCountFromCart(data) {
//   if (!data?.items?.length) {
//     return 0;
//   }

//   return new Set(
//     data.items.map((row) => row.product_id),
//   ).size;
// }

export async function addToCartApi({ variantId, quantity = 1 }) {
  const response = await api.post("cart/", {
    variant_id: variantId,

    quantity,
  });

  return response.data;
}

export async function updateCartItemApi(itemId, quantity) {
  const response = await api.patch(`cart/items/${itemId}/`, {
    quantity,
  });

  return response.data;
}

export async function removeCartItemApi(itemId) {
  const response = await api.delete(`cart/items/${itemId}/`);

  return response.data;
}

export async function validateCheckoutApi() {
  const response = await api.post("cart/validate-checkout/", {});

  return response.data;
}

export async function fetchCheckoutPreview() {
  const response = await api.get("cart/checkout-preview/");

  return response.data;
}
