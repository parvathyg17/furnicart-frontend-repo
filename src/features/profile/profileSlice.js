
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




const initialState = {
  profile: null,
};


const profileSlice = createSlice({

  name: "profile",

  initialState,

  reducers: {},

  extraReducers: (builder) => {

    builder

      

      .addCase(
        getProfile.fulfilled,
        (state, action) => {

          state.profile =
            action.payload;

        }
      )


      

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