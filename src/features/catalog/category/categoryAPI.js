import api from "../../../services/api";



export const getAdminCategoriesAPI =
  async (params) => {

    const response = await api.get(
      "admin/categories/",
      {
        params,
      }
    );

    return response.data;
  };


export const createCategoryAPI =
  async (data) => {

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


export const updateCategoryAPI =
  async (
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



export const deleteCategoryAPI =
  async (categoryId) => {

    const response = await api.patch(
      `admin/categories/${categoryId}/delete/`
    );

    return response.data;
  };

export const restoreCategoryAPI =
  async (categoryId) => {

    const response = await api.patch(
      `admin/categories/${categoryId}/restore/`
    );

    return response.data;
  };