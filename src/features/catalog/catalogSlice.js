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

  // PRODUCTS
  getAdminProductsAPI,
  getAdminProductDetailAPI,
  createProductAPI,
  updateProductAPI,
  deleteProductAPI,
  toggleProductStatusAPI,

  // VARIANTS
  updateVariantAPI,
  toggleVariantStatusAPI,

  // IMAGES
  uploadVariantImageAPI,
  deleteVariantImageAPI,

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
// PRODUCT THUNKS
// ==========================================

export const getAdminProducts =
  createAsyncThunk(

    "catalog/getAdminProducts",

    async (
      params,
      { rejectWithValue }
    ) => {

      try {

        return await getAdminProductsAPI(
          params
        );

      } catch (err) {

        return rejectWithValue(

          err.response?.data || {

            error:
              "Failed to fetch products",
          }
        );
      }
    }
  );

export const getAdminProductDetail =
  createAsyncThunk(

    "catalog/getAdminProductDetail",

    async (
      productId,
      { rejectWithValue }
    ) => {

      try {

        return await getAdminProductDetailAPI(
          productId
        );

      } catch (err) {

        return rejectWithValue(

          err.response?.data || {

            error:
              "Failed to fetch product",
          }
        );
      }
    }
  );

export const createProduct =
  createAsyncThunk(

    "catalog/createProduct",

    async (
      data,
      { rejectWithValue }
    ) => {

      try {

        return await createProductAPI(
          data
        );

      } catch (err) {

        return rejectWithValue(

          err.response?.data || {

            error:
              "Failed to create product",
          }
        );
      }
    }
  );

export const updateProduct =
  createAsyncThunk(

    "catalog/updateProduct",

    async (
      {
        productId,
        data,
      },
      { rejectWithValue }
    ) => {

      try {

        return await updateProductAPI(
          productId,
          data
        );

      } catch (err) {

        return rejectWithValue(

          err.response?.data || {

            error:
              "Failed to update product",
          }
        );
      }
    }
  );

export const deleteProduct =
  createAsyncThunk(

    "catalog/deleteProduct",

    async (
      productId,
      { rejectWithValue }
    ) => {

      try {

        await deleteProductAPI(
          productId
        );

        return productId;

      } catch (err) {

        return rejectWithValue(

          err.response?.data || {

            error:
              "Failed to delete product",
          }
        );
      }
    }
  );

export const toggleProductStatus =
  createAsyncThunk(

    "catalog/toggleProductStatus",

    async (
      productId,
      { rejectWithValue }
    ) => {

      try {

        return await toggleProductStatusAPI(
          productId
        );

      } catch (err) {

        return rejectWithValue(

          err.response?.data || {

            error:
              "Failed to toggle product status",
          }
        );
      }
    }
  );

// ==========================================
// VARIANT THUNKS
// ==========================================

export const updateVariant =
  createAsyncThunk(

    "catalog/updateVariant",

    async (
      {
        variantId,
        data,
      },
      { rejectWithValue }
    ) => {

      try {

        return await updateVariantAPI(
          variantId,
          data
        );

      } catch (err) {

        return rejectWithValue(

          err.response?.data || {

            error:
              "Failed to update variant",
          }
        );
      }
    }
  );

export const toggleVariantStatus =
  createAsyncThunk(

    "catalog/toggleVariantStatus",

    async (
      variantId,
      { rejectWithValue }
    ) => {

      try {

        return await toggleVariantStatusAPI(
          variantId
        );

      } catch (err) {

        return rejectWithValue(

          err.response?.data || {

            error:
              "Failed to toggle variant status",
          }
        );
      }
    }
  );

// ==========================================
// IMAGE THUNKS
// ==========================================

export const uploadVariantImage =
  createAsyncThunk(

    "catalog/uploadVariantImage",

    async (
      data,
      { rejectWithValue }
    ) => {

      try {

        return await uploadVariantImageAPI(
          data
        );

      } catch (err) {

        return rejectWithValue(

          err.response?.data || {

            error:
              "Failed to upload image",
          }
        );
      }
    }
  );

export const deleteVariantImage =
  createAsyncThunk(

    "catalog/deleteVariantImage",

    async (
      imageId,
      { rejectWithValue }
    ) => {

      try {

        await deleteVariantImageAPI(
          imageId
        );

        return imageId;

      } catch (err) {

        return rejectWithValue(

          err.response?.data || {

            error:
              "Failed to delete image",
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

  // PRODUCTS

  products: [],

  productDetail: null,

  productPagination: null,

  productLoading: false,

  productError: null,

  productSuccess: null,
};

// ==========================================
// SLICE
// ==========================================
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

      state.productError = null;

      state.productSuccess = null;
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

    // ==========================================
    // GET PRODUCTS
    // ==========================================

    builder

      .addCase(
        getAdminProducts.pending,

        (state) => {

          state.productLoading = true;

          state.productError = null;
        }
      )

      .addCase(
        getAdminProducts.fulfilled,

        (state, action) => {

          state.productLoading = false;

          state.products =
            action.payload.results;

          state.productPagination = {

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
        getAdminProducts.rejected,

        (state, action) => {

          state.productLoading = false;

          state.productError =
            action.payload?.error ||
            "Failed to fetch products";
        }
      );

    // ==========================================
    // GET PRODUCT DETAIL
    // ==========================================

    builder

      .addCase(
        getAdminProductDetail.pending,

        (state) => {

          state.productLoading = true;

          state.productError = null;
        }
      )

      .addCase(
        getAdminProductDetail.fulfilled,

        (state, action) => {

          state.productLoading = false;

          state.productDetail =
            action.payload;
        }
      )

      .addCase(
        getAdminProductDetail.rejected,

        (state, action) => {

          state.productLoading = false;

          state.productError =
            action.payload?.error ||
            "Failed to fetch product";
        }
      );

    // ==========================================
    // CREATE PRODUCT
    // ==========================================

    builder

      .addCase(
        createProduct.pending,

        (state) => {

          state.productLoading = true;

          state.productError = null;
        }
      )

      .addCase(
        createProduct.fulfilled,

        (state) => {

          state.productLoading = false;

          state.productSuccess =
            "Product created successfully";
        }
      )

      .addCase(
        createProduct.rejected,

        (state, action) => {

          state.productLoading = false;

          state.productError =
            action.payload?.error ||
            "Failed to create product";
        }
      );

    // ==========================================
    // UPDATE PRODUCT
    // ==========================================

    builder

      .addCase(
        updateProduct.pending,

        (state) => {

          state.productLoading = true;

          state.productError = null;
        }
      )

      .addCase(
        updateProduct.fulfilled,

        (state, action) => {

          state.productLoading = false;

          state.productSuccess =
            "Product updated successfully";

          state.productDetail =
            action.payload;

          state.products =
            state.products.map(
              (product) =>

                product.id ===
                action.payload.id

                  ? action.payload

                  : product
            );
        }
      )

      .addCase(
        updateProduct.rejected,

        (state, action) => {

          state.productLoading = false;

          state.productError =
            action.payload?.error ||
            "Failed to update product";
        }
      );

    // ==========================================
    // DELETE PRODUCT
    // ==========================================

    builder

      .addCase(
        deleteProduct.pending,

        (state) => {

          state.productLoading = true;

          state.productError = null;
        }
      )

      .addCase(
        deleteProduct.fulfilled,

        (state, action) => {

          state.productLoading = false;

          state.productSuccess =
            "Product deleted successfully";

          state.products =
            state.products.map(
              (product) =>

                product.id === action.payload

                  ? {
                      ...product,
                      is_active: false,
                    }

                  : product
            );
        }
      )

      .addCase(
        deleteProduct.rejected,

        (state, action) => {

          state.productLoading = false;

          state.productError =
            action.payload?.error ||
            "Failed to delete product";
        }
      );

    // ==========================================
    // TOGGLE PRODUCT STATUS
    // ==========================================

    builder

      .addCase(
        toggleProductStatus.fulfilled,

        (state, action) => {

          state.products =
            state.products.map(
              (product) =>

                product.id ===
                action.payload.id

                  ? {
                      ...product,
                      is_active:
                        action.payload.is_active,
                    }

                  : product
            );

          if (
            state.productDetail &&
            state.productDetail.id ===
              action.payload.id
          ) {

            state.productDetail.is_active =
              action.payload.is_active;
          }
        }
      );
  },
});

export const {

  clearCatalogMessages,

} = catalogSlice.actions;

export default catalogSlice.reducer;