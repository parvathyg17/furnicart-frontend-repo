import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  signupAPI,
  verifyOTPAPI,
  resendOTPAPI,
  loginUserAPI,
  getMeAPI,
  forgotPasswordAPI,
  resetPasswordAPI,
  logoutAPI,
  googleLoginAPI,
  changePasswordAPI,
} from "./authAPI";



export const signupUser = createAsyncThunk(
  "auth/signupUser",
  async (data, { rejectWithValue }) => {
    try {
      return await signupAPI(data);
    } catch (err) {
      return rejectWithValue(
        err.response?.data || {
          error: "Signup failed",
        }
      );
    }
  }
);


export const verifyOTP = createAsyncThunk(
  "auth/verifyOTP",
  async (data, { rejectWithValue }) => {
    try {
      return await verifyOTPAPI(data);
    } catch (err) {
      return rejectWithValue(
        err.response?.data || {
          error: "OTP verification failed",
        }
      );
    }
  }
);


export const resendOTP = createAsyncThunk(
  "auth/resendOTP",
  async (data, { rejectWithValue }) => {
    try {
      return await resendOTPAPI(data);
    } catch (err) {
      return rejectWithValue(
        err.response?.data || {
          error: "Resend OTP failed",
        }
      );
    }
  }
);


export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (data, { rejectWithValue }) => {
    try {
      return await loginUserAPI(data);
    } catch (err) {
      return rejectWithValue(
        err.response?.data || {
          error: "Login failed",
        }
      );
    }
  }
);

export const loadUser = createAsyncThunk(
  "auth/loadUser",
  async (arg, { rejectWithValue }) => {
    try {
      return await getMeAPI();
    } catch (err) {
      return rejectWithValue(null);
    }
  }
);


export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (data, { rejectWithValue }) => {
    try {
      return await forgotPasswordAPI(data);
    } catch (err) {
      return rejectWithValue(
        err.response?.data || {
          error: "Forgot password failed",
        }
      );
    }
  }
);


export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (data, { rejectWithValue }) => {
    try {
      return await resetPasswordAPI(data);
    } catch (err) {
      return rejectWithValue(
        err.response?.data || {
          error: "Reset password failed",
        }
      );
    }
  }
);


export const googleLogin = createAsyncThunk(
  "auth/googleLogin",
  async (payload, { rejectWithValue }) => {
    try {
      return await googleLoginAPI(payload);
    } catch (err) {
      return rejectWithValue(
        err.response?.data || {
          error: "Google login failed",
        }
      );
    }
  }
);

// CHANGE PASSWORD
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (data, { rejectWithValue }) => {
    try {
      return await changePasswordAPI(data);
    } catch (err) {
      return rejectWithValue(
        err.response?.data || {
          error: "Password change failed",
        }
      );
    }
  }
);


export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      return await logoutAPI();
    } catch (err) {
      return rejectWithValue(
        err.response?.data || {
          error: "Logout failed",
        }
      );
    }
  }
);




const initialState = {
  user: null,
  isAuthenticated: false,
  checkingAuth: true,
};



const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {},

  extraReducers: (builder) => {

  
  builder
    .addCase(loadUser.pending, (state, action) => {
      const silent =
        action.meta?.arg?.silent === true;

      if (!silent) {
        state.checkingAuth = true;
      }
    })

    .addCase(loadUser.fulfilled, (state, action) => {
      state.checkingAuth = false;

      if (action.payload) {
        state.user = action.payload;
        state.isAuthenticated = true;
      } else {
        state.user = null;
        state.isAuthenticated = false;
      }
    })

    .addCase(loadUser.rejected, (state) => {
      state.checkingAuth = false;
      state.user = null;
      state.isAuthenticated = false;
    });

  
  builder
    .addCase(loginUser.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
    });

  
  builder
    .addCase(googleLogin.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
    });

  
  builder
    .addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
    });
}
});

// export const { clearMessages } = authSlice.actions;

export default authSlice.reducer;