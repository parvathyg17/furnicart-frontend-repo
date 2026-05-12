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



export const getAddresses = createAsyncThunk(
  "address/get",
  async (_, { rejectWithValue }) => {
    try {
      return await getAddressesAPI();
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);



export const addAddress = createAsyncThunk(
  "address/add",
  async (data, { rejectWithValue }) => {
    try {
      return await addAddressAPI(data);
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);



export const updateAddress = createAsyncThunk(
  "address/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await updateAddressAPI({ id, data });
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);



export const deleteAddress = createAsyncThunk(
  "address/delete",
  async (id, { rejectWithValue }) => {
    try {
      await deleteAddressAPI(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);


export const setDefaultAddress = createAsyncThunk(
  "address/setDefault",
  async (id, { rejectWithValue }) => {
    try {
      await setDefaultAddressAPI(id);
      return id; // KEEP THIS (frontend uses it)
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);


const initialState = {
  addresses: [],
  loading: false,
  error: null,
  success: null,
};


const addressSlice = createSlice({
  name: "address",
  initialState,

  reducers: {
    clearAddressState: (state) => {
      state.error = null;
      state.success = null;
    },
  },

  extraReducers: (builder) => {

    builder

      
      .addCase(getAddresses.fulfilled, (state, action) => {
        state.addresses = action.payload;
        state.loading = false;
      })

      
      .addCase(addAddress.fulfilled, (state, action) => {
  state.loading = false;
  state.success = "Address added";

  state.addresses.push(action.payload);
})

     
      .addCase(updateAddress.fulfilled, (state, action) => {
  state.loading = false;
  state.success = "Address updated";

  const index = state.addresses.findIndex(
    (a) => a.id === action.payload.id
  );

  if (index !== -1) {
    state.addresses[index] = action.payload;
  }
})

    
      .addCase(deleteAddress.fulfilled, (state, action) => {
  state.loading = false;
  state.success = "Address deleted";

  state.addresses = state.addresses.filter(
    (a) => a.id !== action.payload
  );
})

      
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
  state.loading = false;
  state.success = "Default address updated";

  const id = action.payload;

  state.addresses = state.addresses.map((addr) => ({
    ...addr,
    is_default: addr.id === id,
  }));
})

    
      .addMatcher(
        (action) =>
          action.type.startsWith("address/") &&
          action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
          state.success = null;
        }
      )

     
      .addMatcher(
        (action) =>
          action.type.startsWith("address/") &&
          action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearAddressState } = addressSlice.actions;
export default addressSlice.reducer;