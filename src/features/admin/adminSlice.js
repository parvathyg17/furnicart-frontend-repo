import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  adminLoginAPI,
  adminMeAPI,
  getUsersAPI,
  toggleUserBlockAPI,
  adminLogoutAPI,
} from "./adminAPI";


// ================= LOGIN =================
export const adminLogin = createAsyncThunk(
  "admin/login",
  async (data, { rejectWithValue }) => {
    
    try {
      return await adminLoginAPI(data);
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);


// ================= ADMIN ME =================
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


// ================= GET USERS =================
export const getUsers = createAsyncThunk(
  "admin/users",
  async ({ page, search }, { rejectWithValue }) => {
    try {
      return await getUsersAPI(page, search);
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);


// ================= BLOCK USER =================
export const toggleUserBlock = createAsyncThunk(
  "admin/blockUser",
  async (userId, { rejectWithValue }) => {
    try {
      return await toggleUserBlockAPI(userId);
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);


// ================= LOGOUT =================
export const adminLogout = createAsyncThunk(
  "admin/logout",
  async (_, { rejectWithValue }) => {
    try {
      return await adminLogoutAPI();
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

const initialState = {
  admin: null,
  isAuthenticated: false,

  checkingAuth: true,

  users: [],
  totalPages: 1,
  currentPage: 1,

  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,

  reducers: {
    clearAdminState: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {

    // ================= LOGIN =================
    builder
      .addCase(adminLogin.fulfilled, (state) => {
        
        state.error = null;
      })


    
.addCase(adminMe.pending, (state) => {
  state.checkingAuth = true;
})

.addCase(adminMe.fulfilled, (state, action) => {
  state.admin = action.payload;
  state.isAuthenticated = true;
  state.checkingAuth = false;
})

.addCase(adminMe.rejected, (state) => {
  state.admin = null;
  state.isAuthenticated = false;
  state.checkingAuth = false;
})


    // ================= USERS LIST =================
      .addCase(getUsers.fulfilled, (state, action) => {
        state.users = action.payload.users;
        state.totalPages = action.payload.total_pages;
        state.currentPage = action.payload.current_page;
        state.loading = false;
      })


    // ================= BLOCK USER =================
      .addCase(toggleUserBlock.fulfilled, (state, action) => {
        const updated = action.payload;

        state.users = state.users.map((u) =>
          u.id === updated.id
            ? { ...u, is_active: updated.is_active }
            : u
        );
      })


    // ================= LOGOUT =================
      .addCase(adminLogout.fulfilled, (state) => {
        state.admin = null;
        state.isAuthenticated = false;
        state.users = [];
      })


    // ================= GLOBAL LOADING =================
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      )

      .addMatcher(
        (action) => action.type.endsWith("/fulfilled"),
        (state) => {
          state.loading = false;
        }
      );
  },
});

export const { clearAdminState } = adminSlice.actions;
export default adminSlice.reducer;