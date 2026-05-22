import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import profileReducer from "../features/profile/profileSlice";
import addressReducer from "../features/address/addressSlice";
import adminReducer from "../features/admin/adminSlice";
import catalogReducer from "../features/catalog/catalogSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    address: addressReducer,
    admin: adminReducer,
    catalog:catalogReducer,
    
  },
});