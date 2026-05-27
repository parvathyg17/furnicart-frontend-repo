import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import getErrorMessage from "../../../utils/getErrorMessage";

import {

  getAdminCategoriesAPI,
  createCategoryAPI,
  updateCategoryAPI,
  deleteCategoryAPI,
  restoreCategoryAPI,

} from "./categoryAPI";



export const getAdminCategories =
  createAsyncThunk(

    "category/getAdminCategories",

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

    "category/createCategory",

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

    "category/updateCategory",

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

    "category/deleteCategory",

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



export const restoreCategory =
  createAsyncThunk(

    "category/restoreCategory",

    async (
      categoryId,
      { rejectWithValue }
    ) => {

      try {

        await restoreCategoryAPI(
          categoryId
        );

        return categoryId;

      } catch (err) {

        return rejectWithValue(

          err.response?.data || {

            error:
              "Failed to restore category",
          }
        );
      }
    }
  );



const initialState = {

  categories: [],

  categoryPagination: null,

  categoryLoading: false,

  categoryError: null,

  categorySuccess: null,
};



const categorySlice = createSlice({

  name: "category",

  initialState,

  reducers: {

    clearCategoryMessages:
      (state) => {

        state.categoryError = null;

        state.categorySuccess = null;
      },
  },

  extraReducers: (builder) => {

    

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
            getErrorMessage(
              action.payload
            );
        }
      );

    

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

        (state, action) => {

          state.categoryLoading = false;

          state.categorySuccess =
            "Category created successfully";

          state.categories.unshift(
            action.payload
          );
        }
      )

      .addCase(
        createCategory.rejected,

        (state, action) => {

          state.categoryLoading = false;

          state.categoryError =
            getErrorMessage(
              action.payload
            );
        }
      );


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
            getErrorMessage(
              action.payload
            );
        }
      );

    

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
            getErrorMessage(
              action.payload
            );
        }
      );

    

    builder

      .addCase(
        restoreCategory.pending,

        (state) => {

          state.categoryLoading = true;

          state.categoryError = null;
        }
      )

      .addCase(
        restoreCategory.fulfilled,

        (state, action) => {

          state.categoryLoading = false;

          state.categorySuccess =
            "Category restored successfully";

          state.categories =
            state.categories.map(
              (category) =>

                category.id === action.payload

                  ? {
                      ...category,
                      is_active: true,
                    }

                  : category
            );
        }
      )

      .addCase(
        restoreCategory.rejected,

        (state, action) => {

          state.categoryLoading = false;

          state.categoryError =
            getErrorMessage(
              action.payload
            );
        }
      );
  },
});

export const {

  clearCategoryMessages,

} = categorySlice.actions;

export default categorySlice.reducer;