import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  getProfileAPI,
  updateProfileAPI,
  emailRequestAPI,
  emailVerifyAPI,
} from "./profileAPI";


// ================= GET PROFILE =================
export const getProfile = createAsyncThunk(
  "profile/get",
  async (_, { rejectWithValue }) => {
    try {
      return await getProfileAPI();
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { error: "Failed to load profile" }
      );
    }
  }
);


// ================= UPDATE PROFILE =================
export const updateProfile = createAsyncThunk(
  "profile/update",
  async (data, { rejectWithValue }) => {
    try {
      return await updateProfileAPI(data);
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { error: "Profile update failed" }
      );
    }
  }
);


// ================= SEND EMAIL OTP =================
export const sendEmailOTP = createAsyncThunk(
  "profile/emailRequest",
  async (data, { rejectWithValue }) => {
    try {
      return await emailRequestAPI(data);
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { error: "Failed to send OTP" }
      );
    }
  }
);


// ================= VERIFY EMAIL OTP =================
export const verifyEmailOTP = createAsyncThunk(
  "profile/emailVerify",
  async (data, { rejectWithValue }) => {
    try {
      return await emailVerifyAPI(data);
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { error: "OTP verification failed" }
      );
    }
  }
);


const profileSlice = createSlice({
  name: "profile",

  initialState: {
    profile: null,
    loading: false,
    error: null,
    success: null,
  },

  reducers: {
    clearProfileState: (state) => {
      state.error = null;
      state.success = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ================= GET PROFILE =================
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
      })

      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })

      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


      // ================= UPDATE PROFILE =================
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
      })

      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.success = "Profile updated successfully";
      })

      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


      // ================= SEND OTP =================
      .addCase(sendEmailOTP.pending, (state) => {
        state.loading = true;
      })

      .addCase(sendEmailOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
      })

      .addCase(sendEmailOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


      // ================= VERIFY OTP =================
      .addCase(verifyEmailOTP.pending, (state) => {
        state.loading = true;
      })

      .addCase(verifyEmailOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
      })

      .addCase(verifyEmailOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProfileState } = profileSlice.actions;

export default profileSlice.reducer;