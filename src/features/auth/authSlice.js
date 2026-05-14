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
  async (_, { rejectWithValue }) => {
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
  async (token, { rejectWithValue }) => {
    try {
      return await googleLoginAPI(token);
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

  loading: false,
  resendLoading: false,

  checkingAuth: false,

  success: null,
  resendSuccess: null,

  error: null,
};




const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
      state.resendSuccess = null;
    },
  },

  extraReducers: (builder) => {

   

    builder
      .addCase(loadUser.pending, (state) => {
        state.checkingAuth = true;
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
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })

      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload;
        })

      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });


  

    builder
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })

      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
      })

      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });


  

    builder
      .addCase(resendOTP.pending, (state) => {
        state.resendLoading = true;
        state.error = null;
        state.resendSuccess = null;
      })

      .addCase(resendOTP.fulfilled, (state, action) => {
        state.resendLoading = false;
        state.resendSuccess = action.payload.message;
      })

      .addCase(resendOTP.rejected, (state, action) => {
        state.resendLoading = false;
        state.error = action.payload;
      });


  

    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;

        state.success = action.payload.message;

        state.user = action.payload.user || null;

        state.isAuthenticated = true;
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });


   

    builder
      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;

        state.success = action.payload.message;

        state.user = action.payload.user;

        state.isAuthenticated = true;
})

      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });


  

    builder
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
      })

      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });


    

    builder
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
      })

      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });


    

    builder
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(changePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
      })

      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });


   

    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })

      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;

        state.user = null;
        state.isAuthenticated = false;
      })

      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMessages } = authSlice.actions;

export default authSlice.reducer;