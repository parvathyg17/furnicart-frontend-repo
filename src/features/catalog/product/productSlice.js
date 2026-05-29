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
  createVariantAPI,
  updateVariantAPI,
  toggleVariantStatusAPI,

  // IMAGES
  uploadVariantImageAPI,
  deleteVariantImageAPI,

} from "./productAPI";

import {
  formatProductApiError,
} from "../../../utils/productApiErrors.js";



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

export const createVariant =
  createAsyncThunk(

    "product/createVariant",

    async (
      {
        productId,
        data,
      },
      { rejectWithValue }
    ) => {

      try {

        return await createVariantAPI(
          productId,
          data
        );

      } catch (err) {

        return rejectWithValue(

          err.response?.data || {

            error:
              "Failed to create variant",
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



const initialState = {

  products: [],

  productDetail: null,

  productPagination: null,

  productLoading: false,

  productError: null,

  productSuccess: null,
};



const productSlice = createSlice({

  name: "product",

  initialState,

  reducers: {

    clearProductMessages:
      (state) => {

        state.productError = null;

        state.productSuccess = null;
      },

    clearProductSuccess:
      (state) => {

        state.productSuccess = null;
      },

    clearProductError:
      (state) => {

        state.productError = null;
      },
  },

  extraReducers: (builder) => {

    

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
            action.payload.results || [];

          state.productPagination = {

            count:
              action.payload.count || 0,

            totalPages:
              action.payload.total_pages || 0,

            currentPage:
              action.payload.current_page || 1,

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
            formatProductApiError(
              action.payload
            ) || "Failed to fetch products";
        }
      );

    

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
            formatProductApiError(
              action.payload
            ) || "Failed to fetch product";
        }
      );

   

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

        (state, action) => {

          state.productLoading = false;

          state.productError = null;

          state.productSuccess =
            "Product created successfully";

          const alreadyExists =
            state.products.some(
              (product) =>
                product.id === action.payload.id
            );

          if (!alreadyExists) {

            state.products = [

              action.payload,

              ...state.products,
            ];
          }

          if (state.productPagination) {

            state.productPagination.count += 1;
          }
        }
      )

      .addCase(
        createProduct.rejected,

        (state, _action) => {

          state.productLoading = false;

          state.productSuccess = null;

          /* Validation + field errors are shown inside CreateProductModal */
          state.productError = null;
        }
      );

    
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

          state.productError = null;

          state.productSuccess =
            "Product updated successfully";

          state.productDetail =
            action.payload;

          state.products =
            state.products.map(
              (product) =>

                product.id ===
                action.payload.id

                  ? {

                      ...product,

                      ...action.payload,
                    }

                  : product
            );
        }
      )

      .addCase(
        updateProduct.rejected,

        (state, _action) => {

          state.productLoading = false;

          state.productSuccess = null;

          /* Validation + field errors are shown inside EditProductModal */
          state.productError = null;
        }
      );

  

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
            state.products.filter(
              (product) =>
                product.id !== action.payload
            );

          if (state.productPagination) {

            state.productPagination.count -= 1;
          }

          if (
            state.productDetail &&
            state.productDetail.id === action.payload
          ) {

            state.productDetail = null;
          }
        }
      )

      .addCase(
        deleteProduct.rejected,

        (state, action) => {

          state.productLoading = false;

          state.productError =
            formatProductApiError(
              action.payload
            ) || "Failed to delete product";
        }
      );

    

    builder

      .addCase(
        toggleProductStatus.pending,

        (state) => {

          state.productLoading = true;

          state.productError = null;
        }
      )

      .addCase(
        toggleProductStatus.fulfilled,

        (state, action) => {

          state.productLoading = false;

          state.productError = null;

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
      )

      .addCase(
        toggleProductStatus.rejected,

        (state, action) => {

          state.productLoading = false;

          state.productError =
            formatProductApiError(
              action.payload
            ) ||
            "Failed to toggle product status";
        }
      );

    
    builder

      .addCase(
        createVariant.pending,

        (state) => {

          state.productLoading = true;

          state.productError = null;
        }
      )

      .addCase(
        createVariant.fulfilled,

        (state, action) => {

          state.productLoading = false;

          state.productError = null;

          state.productSuccess =
            "Variant created successfully";

          if (state.productDetail) {

            state.productDetail.variants.push(
              action.payload
            );
          }
        }
      )

      .addCase(
        createVariant.rejected,

        (state, action) => {

          state.productLoading = false;

          state.productSuccess = null;

          state.productError =
            formatProductApiError(
              action.payload
            ) || "Failed to create variant";
        }
      );

    

    builder

      .addCase(
        updateVariant.pending,

        (state) => {

          state.productLoading = true;

          state.productError = null;
        }
      )

      .addCase(
        updateVariant.fulfilled,

        (state, action) => {

          state.productLoading = false;

          state.productSuccess =
            "Variant updated successfully";

          state.productError = null;

          if (!state.productDetail)
            return;

          state.productDetail.variants =
            state.productDetail.variants.map(
              (variant) =>

                variant.id ===
                action.payload.id

                  ? {

                      ...variant,

                      ...action.payload,
                    }

                  : variant
            );
        }
      )

      .addCase(
        updateVariant.rejected,

        (state, action) => {

          state.productLoading = false;

          state.productSuccess = null;

          state.productError =
            formatProductApiError(
              action.payload
            ) || "Failed to update variant";
        }
      );

   

    builder

      .addCase(
        toggleVariantStatus.pending,

        (state) => {

          state.productLoading = true;

          state.productError = null;
        }
      )

      .addCase(
        toggleVariantStatus.fulfilled,

        (state, action) => {

          state.productLoading = false;

          state.productError = null;

          state.productSuccess =
            action.payload.message;

          if (state.productDetail) {

            state.productDetail.variants =
              state.productDetail.variants.map(
                (variant) =>

                  variant.id === action.payload.id

                    ? {
                        ...variant,
                        is_active:
                          action.payload.is_active,
                      }

                    : variant
              );
          }
        }
      )

      .addCase(
        toggleVariantStatus.rejected,

        (state, action) => {

          state.productLoading = false;

          state.productError =
            formatProductApiError(
              action.payload
            ) || "Failed to toggle variant status";
        }
      );

    

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
                action.payload[0]?.variant
            );

          if (variant) {

            variant.images = [

              ...variant.images,

              ...action.payload,
            ];
          }
        }
      );

    

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

  clearProductSuccess,

  clearProductError,

} = productSlice.actions;

export default productSlice.reducer;