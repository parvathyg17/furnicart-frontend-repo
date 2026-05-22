import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import {

  // CATEGORY
  getAdminCategoriesAPI,
  createCategoryAPI,
  updateCategoryAPI,
  deleteCategoryAPI,

  // ROOM TYPES
  getAdminRoomTypesAPI,
  createRoomTypeAPI,
  updateRoomTypeAPI,
  deleteRoomTypeAPI,

} from "./catalogAPI";

// ==========================================
// CATEGORY THUNKS
// ==========================================

export const getAdminCategories =
  createAsyncThunk(

    "catalog/getAdminCategories",

    async (
      params,
      { rejectWithValue }
    ) => {

      try {

        return await getAdminCategoriesAPI(
          params
        );

      } catch (err) {

        return rejectWithValue(

          err.response?.data || {

            error:
              "Failed to fetch categories",
          }
        );
      }
    }
  );

export const createCategory =
  createAsyncThunk(

    "catalog/createCategory",

    async (
      data,
      { rejectWithValue }
    ) => {

      try {

        return await createCategoryAPI(
          data
        );

      } catch (err) {

        return rejectWithValue(

          err.response?.data || {

            error:
              "Failed to create category",
          }
        );
      }
    }
  );

export const updateCategory =
  createAsyncThunk(

    "catalog/updateCategory",

    async (
      {
        categoryId,
        data,
      },
      { rejectWithValue }
    ) => {

      try {

        return await updateCategoryAPI(
          categoryId,
          data
        );

      } catch (err) {

        return rejectWithValue(

          err.response?.data || {

            error:
              "Failed to update category",
          }
        );
      }
    }
  );

export const deleteCategory =
  createAsyncThunk(

    "catalog/deleteCategory",

    async (
      categoryId,
      { rejectWithValue }
    ) => {

      try {

        await deleteCategoryAPI(
          categoryId
        );

        return categoryId;

      } catch (err) {

        return rejectWithValue(

          err.response?.data || {

            error:
              "Failed to delete category",
          }
        );
      }
    }
  );

// ==========================================
// ROOM TYPE THUNKS
// ==========================================

export const getAdminRoomTypes =
  createAsyncThunk(

    "catalog/getAdminRoomTypes",

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

    "catalog/createRoomType",

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

    "catalog/updateRoomType",

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

    "catalog/deleteRoomType",

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

  // CATEGORY

  categories: [],

  categoryPagination: null,

  categoryLoading: false,

  categoryError: null,

  categorySuccess: null,

  // ROOM TYPES

  roomTypes: [],

  roomTypePagination: null,

  roomTypeLoading: false,

  roomTypeError: null,

  roomTypeSuccess: null,
};

// ==========================================
// SLICE
// ==========================================

const catalogSlice = createSlice({

  name: "catalog",

  initialState,

  reducers: {

    clearCatalogMessages: (
      state
    ) => {

      state.categoryError = null;

      state.categorySuccess = null;

      state.roomTypeError = null;

      state.roomTypeSuccess = null;
    },
  },

  extraReducers: (builder) => {

    // ==========================================
    // GET CATEGORIES
    // ==========================================

    builder

      .addCase(
        getAdminCategories.pending,

        (state) => {

          state.categoryLoading = true;

          state.categoryError = null;
        }
      )

      .addCase(
        getAdminCategories.fulfilled,

        (state, action) => {

          state.categoryLoading = false;

          state.categories =
            action.payload.results;

          state.categoryPagination = {

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
        getAdminCategories.rejected,

        (state, action) => {

          state.categoryLoading = false;

          state.categoryError =
            action.payload?.error ||
            "Failed to fetch categories";
        }
      );

    // ==========================================
    // CREATE CATEGORY
    // ==========================================

    builder

      .addCase(
        createCategory.pending,

        (state) => {

          state.categoryLoading = true;

          state.categoryError = null;
        }
      )

      .addCase(
        createCategory.fulfilled,

        (state) => {

          state.categoryLoading = false;

          state.categorySuccess =
            "Category created successfully";
        }
      )

      .addCase(
        createCategory.rejected,

        (state, action) => {

          state.categoryLoading = false;

          state.categoryError =
            action.payload?.error ||
            "Failed to create category";
        }
      );

    // ==========================================
    // UPDATE CATEGORY
    // ==========================================

    builder

      .addCase(
        updateCategory.pending,

        (state) => {

          state.categoryLoading = true;

          state.categoryError = null;
        }
      )

      .addCase(
        updateCategory.fulfilled,

        (state, action) => {

          state.categoryLoading = false;

          state.categorySuccess =
            "Category updated successfully";

          state.categories =
            state.categories.map(
              (category) =>

                category.id ===
                action.payload.id

                  ? action.payload

                  : category
            );
        }
      )

      .addCase(
        updateCategory.rejected,

        (state, action) => {

          state.categoryLoading = false;

          state.categoryError =
            action.payload?.error ||
            "Failed to update category";
        }
      );

    // ==========================================
    // DELETE CATEGORY
    // ==========================================

    builder

      .addCase(
        deleteCategory.pending,

        (state) => {

          state.categoryLoading = true;

          state.categoryError = null;
        }
      )

      .addCase(
        deleteCategory.fulfilled,

        (state, action) => {

          state.categoryLoading = false;

          state.categorySuccess =
            "Category deleted successfully";

          state.categories =
            state.categories.map(
              (category) =>

                category.id === action.payload

                  ? {
                      ...category,
                      is_active: false,
                    }

                  : category
            );
        }
      )

      .addCase(
        deleteCategory.rejected,

        (state, action) => {

          state.categoryLoading = false;

          state.categoryError =
            action.payload?.error ||
            "Failed to delete category";
        }
      );

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

  clearCatalogMessages,

} = catalogSlice.actions;

export default catalogSlice.reducer;