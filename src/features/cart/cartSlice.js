import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import {
  loadUser,
  logoutUser,
} from "../auth/authSlice";

import {
  fetchCart,
} from "./cartAPI";

export const loadCartCount = createAsyncThunk(
  "cart/loadCartCount",
  async (
    _,
    { rejectWithValue },
  ) => {

    try {

      const data = await fetchCart();

      return Number(
        data.item_count ?? 0,
      );
    } catch (err) {

      return rejectWithValue(
        err,
      );
    }
  },
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    itemCount: 0,
  },
  reducers: {
    setCartItemCount(
      state,
      action,
    ) {

      state.itemCount = Math.max(
        0,
        Number(
          action.payload,
        ) || 0,
      );
    },
    clearCartCount(
      state,
    ) {

      state.itemCount = 0;
    },
  },
  extraReducers(
    builder,
  ) {

    builder
      .addCase(
        loadCartCount.fulfilled,
        (
          state,
          action,
        ) => {

          state.itemCount =
            action.payload;
        },
      )
      .addCase(
        loadUser.fulfilled,
        (
          state,
          action,
        ) => {

          if (
            !action.payload
          ) {

            state.itemCount = 0;
          }
        },
      )
      .addCase(
        loadUser.rejected,
        (state) => {

          state.itemCount = 0;
        },
      )
      .addCase(
        logoutUser.fulfilled,
        (state) => {

          state.itemCount = 0;
        },
      );
  },
});

export const {
  setCartItemCount,
  clearCartCount,
} = cartSlice.actions;

export default cartSlice.reducer;
