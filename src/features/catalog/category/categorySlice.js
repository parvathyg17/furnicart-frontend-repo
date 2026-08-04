import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import getErrorMessage from "../../../utils/getErrorMessage";

import {
  getAdminCategoriesAPI,
  createCategoryAPI,
  updateCategoryAPI,
  deleteCategoryAPI,
  restoreCategoryAPI,
} from "./categoryAPI";

export const getAdminCategories = createAsyncThunk(
  "category/getAdminCategories",

  async (params, { rejectWithValue }) => {
    try {
      return await getAdminCategoriesAPI(params);
    } catch (err) {
      return rejectWithValue(
        err.response?.data || {
          error: "Failed to fetch categories",
        },
      );
    }
  },
);

export const getCategoryOptions = createAsyncThunk(
  "category/getCategoryOptions",

  async (_, { rejectWithValue }) => {
    try {
      const response = await getAdminCategoriesAPI({
        page: 1,

        page_size: 1000,

        is_active: true,
      });

      return response.results;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || {
          error: "Failed to fetch category options",
        },
      );
    }
  },
);

export const createCategory = createAsyncThunk(
  "category/createCategory",

  async (data, { rejectWithValue }) => {
    try {
      return await createCategoryAPI(data);
    } catch (err) {
      return rejectWithValue(
        err.response?.data || {
          error: "Failed to create category",
        },
      );
    }
  },
);

export const updateCategory = createAsyncThunk(
  "category/updateCategory",

  async ({ categoryId, data }, { rejectWithValue }) => {
    try {
      return await updateCategoryAPI(categoryId, data);
    } catch (err) {
      return rejectWithValue(
        err.response?.data || {
          error: "Failed to update category",
        },
      );
    }
  },
);

export const deleteCategory = createAsyncThunk(
  "category/deleteCategory",

  async (categoryId, { rejectWithValue }) => {
    try {
      await deleteCategoryAPI(categoryId);

      return categoryId;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || {
          error: "Failed to delete category",
        },
      );
    }
  },
);

export const restoreCategory = createAsyncThunk(
  "category/restoreCategory",

  async (categoryId, { rejectWithValue }) => {
    try {
      await restoreCategoryAPI(categoryId);

      return categoryId;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || {
          error: "Failed to restore category",
        },
      );
    }
  },
);

const initialState = {
  categories: [],

  categoryOptions: [],

  categoryPagination: {
    count: 0,

    totalPages: 1,

    currentPage: 1,

    next: null,

    previous: null,
  },

  categoryListLoading: false,

  categoryCreateLoading: false,

  categoryUpdateLoading: false,

  categoryDeleteLoading: false,

  categoryRestoreLoading: false,

  categoryError: null,

  categorySuccess: null,
};

const categorySlice = createSlice({
  name: "category",

  initialState,

  reducers: {
    clearCategoryMessages: (state) => {
      state.categoryError = null;

      state.categorySuccess = null;
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(
        getAdminCategories.pending,

        (state) => {
          state.categoryListLoading = true;

          state.categoryError = null;
        },
      )

      .addCase(
        getAdminCategories.fulfilled,

        (state, action) => {
          state.categoryListLoading = false;

          state.categories = action.payload.results || [];

          state.categoryPagination = {
            count: action.payload.count || 0,

            totalPages: action.payload.total_pages || 1,

            currentPage: action.payload.current_page || 1,

            next: action.payload.next || null,

            previous: action.payload.previous || null,
          };
        },
      )

      .addCase(
        getAdminCategories.rejected,

        (state, action) => {
          state.categoryListLoading = false;

          const errorMessage = getErrorMessage(action.payload);

          if (
            errorMessage &&
            errorMessage.toLowerCase().includes("invalid page")
          ) {
            state.categoryError = null;

            return;
          }

          state.categoryError = errorMessage;
        },
      );

    builder

      .addCase(
        getCategoryOptions.fulfilled,

        (state, action) => {
          state.categoryOptions = action.payload || [];
        },
      )

      .addCase(
        getCategoryOptions.rejected,

        (state, action) => {
          state.categoryError = getErrorMessage(action.payload);
        },
      );

    builder

      .addCase(
        createCategory.pending,

        (state) => {
          state.categoryCreateLoading = true;

          state.categoryError = null;
        },
      )

      .addCase(
        createCategory.fulfilled,

        (state) => {
          state.categoryCreateLoading = false;

          state.categorySuccess = "Category created successfully";
        },
      )

      .addCase(
        createCategory.rejected,

        (state, action) => {
          state.categoryCreateLoading = false;

          state.categoryError = getErrorMessage(action.payload);
        },
      );

    builder

      .addCase(
        updateCategory.pending,

        (state) => {
          state.categoryUpdateLoading = true;

          state.categoryError = null;
        },
      )

      .addCase(
        updateCategory.fulfilled,

        (state) => {
          state.categoryUpdateLoading = false;

          state.categorySuccess = "Category updated successfully";
        },
      )

      .addCase(
        updateCategory.rejected,

        (state, action) => {
          state.categoryUpdateLoading = false;

          state.categoryError = getErrorMessage(action.payload);
        },
      );

    builder

      .addCase(
        deleteCategory.pending,

        (state) => {
          state.categoryDeleteLoading = true;

          state.categoryError = null;
        },
      )

      .addCase(
        deleteCategory.fulfilled,

        (state) => {
          state.categoryDeleteLoading = false;

          state.categorySuccess = "Category deleted successfully";
        },
      )

      .addCase(
        deleteCategory.rejected,

        (state, action) => {
          state.categoryDeleteLoading = false;

          state.categoryError = getErrorMessage(action.payload);
        },
      );

    builder

      .addCase(
        restoreCategory.pending,

        (state) => {
          state.categoryRestoreLoading = true;

          state.categoryError = null;
        },
      )

      .addCase(
        restoreCategory.fulfilled,

        (state) => {
          state.categoryRestoreLoading = false;

          state.categorySuccess = "Category restored successfully";
        },
      )

      .addCase(
        restoreCategory.rejected,

        (state, action) => {
          state.categoryRestoreLoading = false;

          state.categoryError = getErrorMessage(action.payload);
        },
      );
  },
});

export const { clearCategoryMessages } = categorySlice.actions;

export default categorySlice.reducer;
