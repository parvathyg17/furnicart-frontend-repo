// ==========================================
// src/features/address/addressSlice.js
// ==========================================

import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import {
  getAddressesAPI,
  addAddressAPI,
  updateAddressAPI,
  deleteAddressAPI,
  setDefaultAddressAPI,
} from "./addressAPI";


// ==========================================
// GET ADDRESSES
// ==========================================

export const getAddresses = createAsyncThunk(
  "address/get",
  async (_, { rejectWithValue }) => {

    try {

      return await getAddressesAPI();

    } catch (err) {

      return rejectWithValue(
        err.response?.data
      );

    }
  }
);


// ==========================================
// ADD ADDRESS
// ==========================================

export const addAddress = createAsyncThunk(
  "address/add",
  async (data, { rejectWithValue }) => {

    try {

      return await addAddressAPI(data);

    } catch (err) {

      return rejectWithValue(
        err.response?.data
      );

    }
  }
);


// ==========================================
// UPDATE ADDRESS
// ==========================================

export const updateAddress = createAsyncThunk(
  "address/update",
  async ({ id, data }, { rejectWithValue }) => {

    try {

      return await updateAddressAPI({
        id,
        data,
      });

    } catch (err) {

      return rejectWithValue(
        err.response?.data
      );

    }
  }
);


// ==========================================
// DELETE ADDRESS
// ==========================================

export const deleteAddress = createAsyncThunk(
  "address/delete",
  async (id, { rejectWithValue }) => {

    try {

      await deleteAddressAPI(id);

      return id;

    } catch (err) {

      return rejectWithValue(
        err.response?.data
      );

    }
  }
);


// ==========================================
// SET DEFAULT ADDRESS
// ==========================================

export const setDefaultAddress = createAsyncThunk(
  "address/setDefault",
  async (id, { rejectWithValue }) => {

    try {

      await setDefaultAddressAPI(id);

      return id;

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
  addresses: [],
};


// ==========================================
// SLICE
// ==========================================

const addressSlice = createSlice({

  name: "address",

  initialState,

  reducers: {},

  extraReducers: (builder) => {

    builder

      // ==========================================
      // GET ADDRESSES
      // ==========================================

      .addCase(
        getAddresses.fulfilled,
        (state, action) => {

          state.addresses =
            action.payload;

        }
      )


      // ==========================================
      // ADD ADDRESS
      // ==========================================

      .addCase(
        addAddress.fulfilled,
        (state, action) => {

          state.addresses.push(
            action.payload
          );

        }
      )


      // ==========================================
      // UPDATE ADDRESS
      // ==========================================

      .addCase(
        updateAddress.fulfilled,
        (state, action) => {

          const index =
            state.addresses.findIndex(
              (a) =>
                a.id ===
                action.payload.id
            );

          if (index !== -1) {

            state.addresses[index] =
              action.payload;

          }
        }
      )


      // ==========================================
      // DELETE ADDRESS
      // ==========================================

      .addCase(
        deleteAddress.fulfilled,
        (state, action) => {

          state.addresses =
            state.addresses.filter(
              (a) =>
                a.id !==
                action.payload
            );

        }
      )


      // ==========================================
      // SET DEFAULT ADDRESS
      // ==========================================

      .addCase(
        setDefaultAddress.fulfilled,
        (state, action) => {

          const id =
            action.payload;

          state.addresses =
            state.addresses.map(
              (addr) => ({
                ...addr,

                is_default:
                  addr.id === id,
              })
            );

        }
      );
  },
});

export default addressSlice.reducer;