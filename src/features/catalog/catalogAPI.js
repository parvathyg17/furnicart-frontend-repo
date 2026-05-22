import api from "../../services/api";

// ==========================================
// ADMIN CATEGORY
// ==========================================

export const getAdminCategoriesAPI = async (params) => {

  const response = await api.get(
    "admin/categories/",
    {
      params,
    }
  );

  return response.data;
};

export const createCategoryAPI = async (data) => {

  const response = await api.post(
    "admin/categories/",
    data,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const updateCategoryAPI = async (
  categoryId,
  data
) => {

  const response = await api.put(
    `admin/categories/${categoryId}/`,
    data,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const deleteCategoryAPI = async (
  categoryId
) => {

  const response = await api.patch(
    `admin/categories/${categoryId}/delete/`
  );

  return response.data;
};


// ==========================================
// ADMIN ROOM TYPES
// ==========================================

export const getAdminRoomTypesAPI =
  async (params) => {

    const response = await api.get(
      "admin/room-types/",
      {
        params,
      }
    );

    return response.data;
  };

export const createRoomTypeAPI =
  async (data) => {

    const response = await api.post(
      "admin/room-types/",
      data,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

    return response.data;
  };

export const updateRoomTypeAPI =
  async (
    roomTypeId,
    data
  ) => {

    const response = await api.put(
      `admin/room-types/${roomTypeId}/`,
      data,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

    return response.data;
  };

export const deleteRoomTypeAPI =
  async (roomTypeId) => {

    const response = await api.patch(
      `admin/room-types/${roomTypeId}/delete/`
    );

    return response.data;
  };


  // ==========================================
// ADMIN PRODUCTS
// ==========================================

export const getAdminProductsAPI =
  async (params) => {

    const response = await api.get(
      "admin/products/",
      {
        params,
      }
    );

    return response.data;
  };

export const getAdminProductDetailAPI =
  async (productId) => {

    const response = await api.get(
      `admin/products/${productId}/`
    );

    return response.data;
  };

export const createProductAPI =
  async (data) => {

    const response = await api.post(
      "admin/products/",
      data
    );

    return response.data;
  };

export const updateProductAPI =
  async (
    productId,
    data
  ) => {

    const response = await api.put(
      `admin/products/${productId}/`,
      data
    );

    return response.data;
  };

export const deleteProductAPI =
  async (productId) => {

    const response = await api.patch(
      `admin/products/${productId}/delete/`
    );

    return response.data;
  };

export const toggleProductStatusAPI =
  async (productId) => {

    const response = await api.patch(
      `admin/products/${productId}/toggle-status/`
    );

    return response.data;
  };


  // ==========================================
// PRODUCT VARIANTS
// ==========================================

export const updateVariantAPI =
  async (
    variantId,
    data
  ) => {

    const response = await api.put(
      `admin/products/variants/${variantId}/`,
      data
    );

    return response.data;
  };

export const toggleVariantStatusAPI =
  async (variantId) => {

    const response = await api.patch(
      `admin/products/variants/${variantId}/toggle-status/`
    );

    return response.data;
  };


  // ==========================================
// VARIANT IMAGES
// ==========================================

export const uploadVariantImageAPI =
  async (data) => {

    const response = await api.post(
      "admin/product-images/",
      data,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

    return response.data;
  };

export const deleteVariantImageAPI =
  async (imageId) => {

    const response = await api.delete(
      `admin/products/variant-images/${imageId}/`
    );

    return response.data;
  };