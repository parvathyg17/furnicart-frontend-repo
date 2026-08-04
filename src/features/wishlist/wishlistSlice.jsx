import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchWishlist } from "./wishlistAPI";
import { loadUser, logoutUser } from "../auth/authSlice";
export const loadWishlistCount = createAsyncThunk(
  "wishlist/loadWishlistCount",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchWishlist({ page: 1, pageSize: 1 });
      return Number(data.count ?? 0);
    } catch (err) {
      rejectWithValue(err);
    }
  },
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    itemCount: 0,
  },
  reducers: {
    setWishlistCount(state, action) {
      state.itemCount = Math.max(0, Number(action.payload) || 0);
    },
    clearWishlistCount(state) {
      state.itemCount = 0;
    },
  },

  extraReducers(builder) {
    builder
      .addCase(loadWishlistCount.fulfilled, (state, action) => {
        state.itemCount = action.payload;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        if (!action.payload) {
          state.itemCount = 0;
        }
      })
      .addCase(loadUser.rejected, (state) => {
        state.itemCount = 0;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.itemCount = 0;
      });
  },
});
export const { setWishlistCount, clearWishlistCount } = wishlistSlice.actions;
export default wishlistSlice.reducer;
