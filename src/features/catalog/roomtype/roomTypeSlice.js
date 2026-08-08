import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import getErrorMessage from "../../../utils/getErrorMessage";

import {
  getAdminRoomTypesAPI,
  createRoomTypeAPI,
  updateRoomTypeAPI,
  deleteRoomTypeAPI,
  restoreRoomTypeAPI,
} from "./roomTypeAPI";

export const getAdminRoomTypes = createAsyncThunk(
  "roomType/getAdminRoomTypes",

  async (params, { rejectWithValue }) => {
    try {
      return await getAdminRoomTypesAPI(params);
    } catch (err) {
      return rejectWithValue(
        err.response?.data || {
          error: "Failed to fetch room types",
        },
      );
    }
  },
);

export const createRoomType = createAsyncThunk(
  "roomType/createRoomType",

  async (data, { rejectWithValue }) => {
    try {
      return await createRoomTypeAPI(data);
    } catch (err) {
      return rejectWithValue(
        err.response?.data || {
          error: "Failed to create room type",
        },
      );
    }
  },
);

export const updateRoomType = createAsyncThunk(
  "roomType/updateRoomType",

  async ({ roomTypeId, data }, { rejectWithValue }) => {
    try {
      return await updateRoomTypeAPI(roomTypeId, data);
    } catch (err) {
      return rejectWithValue(
        err.response?.data || {
          error: "Failed to update room type",
        },
      );
    }
  },
);

export const deleteRoomType = createAsyncThunk(
  "roomType/deleteRoomType",

  async (roomTypeId, { rejectWithValue }) => {
    try {
      await deleteRoomTypeAPI(roomTypeId);

      return roomTypeId;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || {
          error: "Failed to delete room type",
        },
      );
    }
  },
);

export const restoreRoomType = createAsyncThunk(
  "roomType/restoreRoomType",

  async (roomTypeId, { rejectWithValue }) => {
    try {
      await restoreRoomTypeAPI(roomTypeId);

      return roomTypeId;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || {
          error: "Failed to restore room type",
        },
      );
    }
  },
);

const initialState = {
  roomTypes: [],

  roomTypePagination: {
    count: 0,

    totalPages: 1,

    currentPage: 1,

    next: null,

    previous: null,
  },

  roomTypeListLoading: false,

  roomTypeCreateLoading: false,

  roomTypeUpdateLoading: false,

  roomTypeDeleteLoading: false,

  roomTypeRestoreLoading: false,

  roomTypeError: null,

  roomTypeSuccess: null,
};

const roomTypeSlice = createSlice({
  name: "roomType",

  initialState,

  reducers: {
    clearRoomTypeMessages: (state) => {
      state.roomTypeError = null;

      state.roomTypeSuccess = null;
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(
        getAdminRoomTypes.pending,

        (state) => {
          state.roomTypeListLoading = true;

          state.roomTypeError = null;

          state.roomTypeSuccess = null;
        },
      )

      .addCase(
        getAdminRoomTypes.fulfilled,

        (state, action) => {
          state.roomTypeListLoading = false;

          state.roomTypes = action.payload.results || [];

          state.roomTypePagination = {
            count: action.payload.count || 0,

            totalPages: action.payload.total_pages || 1,

            currentPage: action.payload.current_page || 1,

            next: action.payload.next || null,

            previous: action.payload.previous || null,
          };
        },
      )

      .addCase(
        getAdminRoomTypes.rejected,

        (state, action) => {
          state.roomTypeListLoading = false;

          const errorMessage = getErrorMessage(action.payload);

          if (
            errorMessage &&
            errorMessage.toLowerCase().includes("invalid page")
          ) {
            state.roomTypeError = null;

            return;
          }

          state.roomTypeSuccess = null;

          state.roomTypeError = errorMessage;
        },
      );

    builder

      .addCase(
        createRoomType.pending,

        (state) => {
          state.roomTypeCreateLoading = true;

          state.roomTypeError = null;

          state.roomTypeSuccess = null;
        },
      )

      .addCase(
        createRoomType.fulfilled,

        (state) => {
          state.roomTypeCreateLoading = false;

          state.roomTypeError = null;

          state.roomTypeSuccess = "Room type created successfully";
        },
      )

      .addCase(
        createRoomType.rejected,

        (state, action) => {
          state.roomTypeCreateLoading = false;

          state.roomTypeSuccess = null;

          state.roomTypeError = getErrorMessage(action.payload);
        },
      );

    builder

      .addCase(
        updateRoomType.pending,

        (state) => {
          state.roomTypeUpdateLoading = true;

          state.roomTypeError = null;

          state.roomTypeSuccess = null;
        },
      )

      .addCase(
        updateRoomType.fulfilled,

        (state) => {
          state.roomTypeUpdateLoading = false;

          state.roomTypeError = null;

          state.roomTypeSuccess = "Room type updated successfully";
        },
      )

      .addCase(
        updateRoomType.rejected,

        (state, action) => {
          state.roomTypeUpdateLoading = false;

          state.roomTypeSuccess = null;

          state.roomTypeError = getErrorMessage(action.payload);
        },
      );

    builder

      .addCase(
        deleteRoomType.pending,

        (state) => {
          state.roomTypeDeleteLoading = true;

          state.roomTypeError = null;

          state.roomTypeSuccess = null;
        },
      )

      .addCase(
        deleteRoomType.fulfilled,

        (state) => {
          state.roomTypeDeleteLoading = false;

          state.roomTypeError = null;

          state.roomTypeSuccess = "Room type deleted successfully";
        },
      )

      .addCase(
        deleteRoomType.rejected,

        (state, action) => {
          state.roomTypeDeleteLoading = false;

          state.roomTypeSuccess = null;

          state.roomTypeError = getErrorMessage(action.payload);
        },
      );

    builder

      .addCase(
        restoreRoomType.pending,

        (state) => {
          state.roomTypeRestoreLoading = true;

          state.roomTypeError = null;

          state.roomTypeSuccess = null;
        },
      )

      .addCase(
        restoreRoomType.fulfilled,

        (state) => {
          state.roomTypeRestoreLoading = false;

          state.roomTypeError = null;

          state.roomTypeSuccess = "Room type restored successfully";
        },
      )

      .addCase(
        restoreRoomType.rejected,

        (state, action) => {
          state.roomTypeRestoreLoading = false;

          state.roomTypeSuccess = null;

          state.roomTypeError = getErrorMessage(action.payload);
        },
      );
  },
});

export const { clearRoomTypeMessages } = roomTypeSlice.actions;

export default roomTypeSlice.reducer;
