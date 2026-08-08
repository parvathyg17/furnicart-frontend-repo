import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import profileReducer from "../features/profile/profileSlice";
import addressReducer from "../features/address/addressSlice";
import adminReducer from "../features/admin/adminSlice";
import categoryReducer from "../features/catalog/category/categorySlice";
import roomTypeReducer from "../features/catalog/roomtype/roomTypeSlice";
import productReducer from "../features/catalog/product/productSlice";
import cartReducer from "../features/cart/cartSlice";
import wishlistReducer from "../features/wishlist/wishlistSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    address: addressReducer,
    admin: adminReducer,
    category: categoryReducer,
    roomType: roomTypeReducer,
    product: productReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
  },
});
