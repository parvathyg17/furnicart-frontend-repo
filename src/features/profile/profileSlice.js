// ==========================================
// src/features/profile/profileSlice.js
// ==========================================

import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import {
  getProfileAPI,
  updateProfileAPI,
  emailRequestAPI,
  emailVerifyAPI,
} from "./profileAPI";


// ==========================================
// GET PROFILE
// ==========================================

export const getProfile = createAsyncThunk(
  "profile/get",
  async (_, { rejectWithValue }) => {

    try {

      return await getProfileAPI();

    } catch (err) {

      return rejectWithValue(
        err.response?.data || {
          error: "Failed to load profile",
        }
      );

    }
  }
);


// ==========================================
// UPDATE PROFILE
// ==========================================

export const updateProfile = createAsyncThunk(
  "profile/update",
  async (data, { rejectWithValue }) => {

    try {

      return await updateProfileAPI(data);

    } catch (err) {

      return rejectWithValue(
        err.response?.data || {
          error: "Profile update failed",
        }
      );

    }
  }
);


// ==========================================
// SEND EMAIL OTP
// ==========================================

export const sendEmailOTP = createAsyncThunk(
  "profile/emailRequest",
  async (data, { rejectWithValue }) => {

    try {

      return await emailRequestAPI(data);

    } catch (err) {

      return rejectWithValue(
        err.response?.data || {
          error: "Failed to send OTP",
        }
      );

    }
  }
);


// ==========================================
// VERIFY EMAIL OTP
// ==========================================

export const verifyEmailOTP = createAsyncThunk(
  "profile/emailVerify",
  async (data, { rejectWithValue }) => {

    try {

      return await emailVerifyAPI(data);

    } catch (err) {

      return rejectWithValue(
        err.response?.data || {
          error: "OTP verification failed",
        }
      );

    }
  }
);


// ==========================================
// INITIAL STATE
// ==========================================

const initialState = {
  profile: null,
};


// ==========================================
// SLICE
// ==========================================

const profileSlice = createSlice({

  name: "profile",

  initialState,

  reducers: {},

  extraReducers: (builder) => {

    builder

      // ==========================================
      // GET PROFILE
      // ==========================================

      .addCase(
        getProfile.fulfilled,
        (state, action) => {

          state.profile =
            action.payload;

        }
      )


      // ==========================================
      // UPDATE PROFILE
      // ==========================================

      .addCase(
        updateProfile.fulfilled,
        (state, action) => {

          state.profile =
            action.payload;

        }
      );
  },
});

export default profileSlice.reducer;