import api from "../../services/api";



export async function fetchUserProducts(params = {}) {

  const response = await api.get(
    "products/",
    {
      params,
    }
  );

  return response.data;
}

export async function fetchFeaturedProducts(
  pageSize = 8
) {

  return fetchUserProducts(
    {
      featured: true,
      page_size: pageSize,
      page: 1,
    }
  );
}

export async function fetchUserProduct(productId) {

  const response = await api.get(
    `products/${productId}/`,
  );

  return response.data;
}

export async function fetchUserCategories() {

  const response = await api.get(
    "categories/",
  );

  return response.data;
}

export async function fetchUserRoomTypes() {

  const response = await api.get(
    "room-types/",
  );

  return response.data;
}
