import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ICryptoPrice, IMetalData, IStockPrice } from '../../../types';
import { marketService } from './market.service';

interface MarketState {
  crypto: ICryptoPrice[];
  metals: IMetalData | null;
  stocks: IStockPrice[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  fromDb: boolean;
  message: string | null;
}

const initialState: MarketState = {
  crypto: [],
  metals: null,
  stocks: [],
  loading: false,
  error: null,
  lastUpdated: null,
  fromDb: false,
  message: null,
};

export const fetchMarketData = createAsyncThunk(
  'market/fetchAll',
  async () => {
    const response = await marketService.getAll();
    return response.data;
  }
);

const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMarketData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMarketData.fulfilled, (state, action) => {
        state.loading = false;
        state.crypto = action.payload.crypto;
        state.metals = action.payload.metals;
        state.stocks = action.payload.stocks;
        state.lastUpdated = action.payload.last_updated;
        state.fromDb = action.payload.from_db || false;
        state.message = action.payload.message || null;
      })
      .addCase(fetchMarketData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch market data';
      });
  },
});

export default marketSlice.reducer;
