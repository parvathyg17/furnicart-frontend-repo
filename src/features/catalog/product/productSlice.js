import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import {

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

} from "./productAPI";

// ==========================================
// PRODUCT THUNKS
// ==========================================

export const getAdminProducts =
  createAsyncThunk(

    "product/getAdminProducts",

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

    "product/getAdminProductDetail",

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

    "product/createProduct",

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

    "product/updateProduct",

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

    "product/deleteProduct",

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

    "product/toggleProductStatus",

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

    "product/updateVariant",

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

    "product/toggleVariantStatus",

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

    "product/uploadVariantImage",

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

    "product/deleteVariantImage",

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

const productSlice = createSlice({

  name: "product",

  initialState,

  reducers: {

    clearProductMessages:
      (state) => {

        state.productError = null;

        state.productSuccess = null;
      },
  },

  extraReducers: (builder) => {

    // reducers here
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

  // ==========================================
// UPDATE VARIANT
// ==========================================

builder

  .addCase(
    updateVariant.fulfilled,

    (state, action) => {

      if (!state.productDetail)
        return;

      state.productDetail.variants =
        state.productDetail.variants.map(
          (variant) =>

            variant.id ===
            action.payload.id

              ? action.payload

              : variant
        );
    }
  );

// ==========================================
// TOGGLE VARIANT STATUS
// ==========================================

builder

  .addCase(
    toggleVariantStatus.fulfilled,

    (state, action) => {

      if (!state.productDetail)
        return;

      state.productDetail.variants =
        state.productDetail.variants.map(
          (variant) =>

            variant.id ===
            action.payload.id

              ? {
                  ...variant,
                  is_active:
                    action.payload.is_active,
                }

              : variant
        );
    }
  );

  // ==========================================
// UPLOAD VARIANT IMAGE
// ==========================================

builder

  .addCase(
    uploadVariantImage.fulfilled,

    (state, action) => {

      if (!state.productDetail)
        return;

      const variant =
        state.productDetail.variants.find(
          (item) =>
            item.id ===
            action.payload.variant
        );

      if (variant) {

        variant.images.push(
          action.payload
        );
      }
    }
  );

// ==========================================
// DELETE VARIANT IMAGE
// ==========================================

builder

  .addCase(
    deleteVariantImage.fulfilled,

    (state, action) => {

      if (!state.productDetail)
        return;

      state.productDetail.variants.forEach(
        (variant) => {

          variant.images =
            variant.images.filter(
              (image) =>
                image.id !==
                action.payload
            );
        }
      );
    }
  );
  
  },
});

export const {

  clearProductMessages,

} = productSlice.actions;

export default productSlice.reducer;