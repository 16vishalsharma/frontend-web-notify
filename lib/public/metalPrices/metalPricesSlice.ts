import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { IMetalPrice } from '../../../types';
import { metalPricesService } from './metalPrices.service';

interface MetalPricesState {
  prices: IMetalPrice[];
  loading: boolean;
  error: string | null;
}

const initialState: MetalPricesState = {
  prices: [],
  loading: false,
  error: null,
};

export const fetchMetalPrices = createAsyncThunk(
  'metalPrices/fetchAll',
  async (params?: { page?: number; limit?: number }) => {
    const response = await metalPricesService.getAll(params);
    return response;
  }
);

const metalPricesSlice = createSlice({
  name: 'metalPrices',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMetalPrices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMetalPrices.fulfilled, (state, action) => {
        state.loading = false;
        state.prices = action.payload.data;
      })
      .addCase(fetchMetalPrices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch metal prices';
      });
  },
});

export default metalPricesSlice.reducer;
