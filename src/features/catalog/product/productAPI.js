import api from "../../../services/api";

export const getAdminProductsAPI = async (params) => {
  const response = await api.get("admin/products/", {
    params,
  });

  return response.data;
};

export const getAdminProductDetailAPI = async (productId) => {
  const response = await api.get(`admin/products/${productId}/`);

  return response.data;
};

export const createProductAPI = async (data) => {
  const response = await api.post("admin/products/", data);

  return response.data;
};

export const updateProductAPI = async (productId, data) => {
  const response = await api.put(`admin/products/${productId}/`, data);

  return response.data;
};

export const deleteProductAPI = async (productId) => {
  const response = await api.patch(`admin/products/${productId}/delete/`);

  return response.data;
};

export const toggleProductStatusAPI = async (productId) => {
  const response = await api.patch(
    `admin/products/${productId}/toggle-status/`,
  );

  return response.data;
};

export const updateVariantAPI = async (variantId, data) => {
  const response = await api.put(`admin/products/variants/${variantId}/`, data);

  return response.data;
};

export const createVariantAPI = async (productId, data) => {
  const response = await api.post(
    `admin/products/${productId}/variants/`,
    data,
  );

  return response.data;
};

export const toggleVariantStatusAPI = async (variantId) => {
  const response = await api.patch(
    `admin/products/variants/${variantId}/toggle-status/`,
  );

  return response.data;
};

export const uploadVariantImageAPI = async ({ variant, images }) => {
  const formData = new FormData();

  formData.append("variant", variant);

  images.forEach((image) => {
    formData.append("images", image);
  });

  const response = await api.post("admin/product-images/", formData);

  return response.data;
};

export const deleteVariantImageAPI = async (imageId) => {
  const response = await api.delete(
    `admin/products/variant-images/${imageId}/`,
  );

  return response.data;
};
