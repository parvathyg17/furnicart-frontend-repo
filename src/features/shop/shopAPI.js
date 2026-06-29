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
  pageSize = 5
) {

  return fetchUserProducts(
    {
      featured: true,
      page_size: pageSize,
      page: 1,
    }
  );
}

export async function fetchUserProduct(
  productRef,
) {

  const enc =
    encodeURIComponent(
      String(
        productRef,
      ),
    );

  const response = await api.get(
    `products/${enc}/`,
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
