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