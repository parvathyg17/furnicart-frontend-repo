import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import {

  getAdminRoomTypesAPI,
  createRoomTypeAPI,
  updateRoomTypeAPI,
  deleteRoomTypeAPI,

} from "./roomTypeAPI";

// ==========================================
// THUNKS
// ==========================================

export const getAdminRoomTypes =
  createAsyncThunk(

    "roomType/getAdminRoomTypes",

    async (
      params,
      { rejectWithValue }
    ) => {

      try {

        return await getAdminRoomTypesAPI(
          params
        );

      } catch (err) {

        return rejectWithValue(

          err.response?.data || {

            error:
              "Failed to fetch room types",
          }
        );
      }
    }
  );

export const createRoomType =
  createAsyncThunk(

    "roomType/createRoomType",

    async (
      data,
      { rejectWithValue }
    ) => {

      try {

        return await createRoomTypeAPI(
          data
        );

      } catch (err) {

        return rejectWithValue(

          err.response?.data || {

            error:
              "Failed to create room type",
          }
        );
      }
    }
  );

export const updateRoomType =
  createAsyncThunk(

    "roomType/updateRoomType",

    async (
      {
        roomTypeId,
        data,
      },
      { rejectWithValue }
    ) => {

      try {

        return await updateRoomTypeAPI(
          roomTypeId,
          data
        );

      } catch (err) {

        return rejectWithValue(

          err.response?.data || {

            error:
              "Failed to update room type",
          }
        );
      }
    }
  );

export const deleteRoomType =
  createAsyncThunk(

    "roomType/deleteRoomType",

    async (
      roomTypeId,
      { rejectWithValue }
    ) => {

      try {

        await deleteRoomTypeAPI(
          roomTypeId
        );

        return roomTypeId;

      } catch (err) {

        return rejectWithValue(

          err.response?.data || {

            error:
              "Failed to delete room type",
          }
        );
      }
    }
  );

// ==========================================
// INITIAL STATE
// ==========================================

const initialState = {

  roomTypes: [],

  roomTypePagination: null,

  roomTypeLoading: false,

  roomTypeError: null,

  roomTypeSuccess: null,
};

// ==========================================
// SLICE
// ==========================================

const roomTypeSlice = createSlice({

  name: "roomType",

  initialState,

  reducers: {

    clearRoomTypeMessages:
      (state) => {

        state.roomTypeError = null;

        state.roomTypeSuccess = null;
      },
  },

  extraReducers: (builder) => {

    // ==========================================
    // GET ROOM TYPES
    // ==========================================

    builder

      .addCase(
        getAdminRoomTypes.pending,

        (state) => {

          state.roomTypeLoading = true;

          state.roomTypeError = null;
        }
      )

      .addCase(
        getAdminRoomTypes.fulfilled,

        (state, action) => {

          state.roomTypeLoading = false;

          state.roomTypes =
            action.payload.results;

          state.roomTypePagination = {

            count:
              action.payload.count,

            totalPages:
              action.payload.total_pages,

            currentPage:
              action.payload.current_page,

            next:
              action.payload.next,

            previous:
              action.payload.previous,
          };
        }
      )

      .addCase(
        getAdminRoomTypes.rejected,

        (state, action) => {

          state.roomTypeLoading = false;

          state.roomTypeError =
            action.payload?.error ||
            "Failed to fetch room types";
        }
      );

    // ==========================================
    // CREATE ROOM TYPE
    // ==========================================

    builder

      .addCase(
        createRoomType.pending,

        (state) => {

          state.roomTypeLoading = true;

          state.roomTypeError = null;
        }
      )

      .addCase(
        createRoomType.fulfilled,

        (state) => {

          state.roomTypeLoading = false;

          state.roomTypeSuccess =
            "Room type created successfully";
        }
      )

      .addCase(
        createRoomType.rejected,

        (state, action) => {

          state.roomTypeLoading = false;

          state.roomTypeError =
            action.payload?.error ||
            "Failed to create room type";
        }
      );

    // ==========================================
    // UPDATE ROOM TYPE
    // ==========================================

    builder

      .addCase(
        updateRoomType.pending,

        (state) => {

          state.roomTypeLoading = true;

          state.roomTypeError = null;
        }
      )

      .addCase(
        updateRoomType.fulfilled,

        (state, action) => {

          state.roomTypeLoading = false;

          state.roomTypeSuccess =
            "Room type updated successfully";

          state.roomTypes =
            state.roomTypes.map(
              (roomType) =>

                roomType.id ===
                action.payload.id

                  ? action.payload

                  : roomType
            );
        }
      )

      .addCase(
        updateRoomType.rejected,

        (state, action) => {

          state.roomTypeLoading = false;

          state.roomTypeError =
            action.payload?.error ||
            "Failed to update room type";
        }
      );

    // ==========================================
    // DELETE ROOM TYPE
    // ==========================================

    builder

      .addCase(
        deleteRoomType.pending,

        (state) => {

          state.roomTypeLoading = true;

          state.roomTypeError = null;
        }
      )

      .addCase(
        deleteRoomType.fulfilled,

        (state, action) => {

          state.roomTypeLoading = false;

          state.roomTypeSuccess =
            "Room type deleted successfully";

          state.roomTypes =
            state.roomTypes.map(
              (roomType) =>

                roomType.id === action.payload

                  ? {
                      ...roomType,
                      is_active: false,
                    }

                  : roomType
            );
        }
      )

      .addCase(
        deleteRoomType.rejected,

        (state, action) => {

          state.roomTypeLoading = false;

          state.roomTypeError =
            action.payload?.error ||
            "Failed to delete room type";
        }
      );
  },
});

export const {

  clearRoomTypeMessages,

} = roomTypeSlice.actions;

export default roomTypeSlice.reducer;