import api from "../../../services/api";



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




export const restoreRoomTypeAPI =
  async (roomTypeId) => {

    const response = await api.patch(
      `admin/room-types/${roomTypeId}/restore/`
    );

    return response.data;
  };