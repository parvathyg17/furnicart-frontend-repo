// ==========================================
// src/features/admin/adminSlice.js
// ==========================================

import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import {
  adminLoginAPI,
  adminMeAPI,
  getUsersAPI,
  toggleUserBlockAPI,
  adminLogoutAPI,
} from "./adminAPI";


// ==========================================
// ADMIN LOGIN
// ==========================================

export const adminLogin = createAsyncThunk(
  "admin/login",
  async (data, { rejectWithValue }) => {

    try {

      return await adminLoginAPI(data);

    } catch (err) {

      return rejectWithValue(
        err.response?.data
      );

    }
  }
);


// ==========================================
// ADMIN ME
// ==========================================

export const adminMe = createAsyncThunk(
  "admin/me",
  async (_, { rejectWithValue }) => {

    try {

      return await adminMeAPI();

    } catch (err) {

      return rejectWithValue(null);

    }
  }
);


// ==========================================
// GET USERS
// ==========================================

export const getUsers = createAsyncThunk(
  "admin/users",
  async ({ page, search }, { rejectWithValue }) => {

    try {

      return await getUsersAPI(
        page,
        search
      );

    } catch (err) {

      return rejectWithValue(
        err.response?.data
      );

    }
  }
);


// ==========================================
// BLOCK / UNBLOCK USER
// ==========================================

export const toggleUserBlock = createAsyncThunk(
  "admin/blockUser",
  async (userId, { rejectWithValue }) => {

    try {

      return await toggleUserBlockAPI(
        userId
      );

    } catch (err) {

      return rejectWithValue(
        err.response?.data
      );

    }
  }
);


// ==========================================
// ADMIN LOGOUT
// ==========================================

export const adminLogout = createAsyncThunk(
  "admin/logout",
  async (_, { rejectWithValue }) => {

    try {

      return await adminLogoutAPI();

    } catch (err) {

      return rejectWithValue(
        err.response?.data
      );

    }
  }
);


// ==========================================
// INITIAL STATE
// ==========================================

const initialState = {

  admin: null,

  isAuthenticated: false,

  checkingAuth: false,

  users: [],

  totalPages: 1,

  currentPage: 1,
};


// ==========================================
// SLICE
// ==========================================

const adminSlice = createSlice({

  name: "admin",

  initialState,

  reducers: {},

  extraReducers: (builder) => {

    builder

      // ==========================================
      // LOGIN
      // ==========================================

      .addCase(
        adminLogin.fulfilled,
        (state, action) => {

          state.admin =
            action.payload.user;

          state.isAuthenticated =
            true;

        }
      )


      // ==========================================
      // ADMIN ME
      // ==========================================

      .addCase(
        adminMe.pending,
        (state) => {

          state.checkingAuth =
            true;

        }
      )

      .addCase(
        adminMe.fulfilled,
        (state, action) => {

          state.admin =
            action.payload;

          state.isAuthenticated =
            true;

          state.checkingAuth =
            false;

        }
      )

      .addCase(
        adminMe.rejected,
        (state) => {

          state.admin = null;

          state.isAuthenticated =
            false;

          state.checkingAuth =
            false;

        }
      )


      // ==========================================
      // GET USERS
      // ==========================================

      .addCase(
        getUsers.fulfilled,
        (state, action) => {

          state.users =
            action.payload.users;

          state.totalPages =
            action.payload.total_pages;

          state.currentPage =
            action.payload.current_page;

        }
      )


      // ==========================================
      // BLOCK / UNBLOCK USER
      // ==========================================

      .addCase(
        toggleUserBlock.fulfilled,
        (state, action) => {

          const updated =
            action.payload;

          state.users =
            state.users.map((u) =>

              u.id === updated.id

                ? {
                    ...u,

                    is_active:
                      updated.is_active,

                    status:
                      updated.status,
                  }

                : u
            );

        }
      )


      // ==========================================
      // LOGOUT
      // ==========================================

      .addCase(
        adminLogout.fulfilled,
        (state) => {

          state.admin = null;

          state.isAuthenticated =
            false;

          state.users = [];

        }
      );
  },
});

export default adminSlice.reducer;