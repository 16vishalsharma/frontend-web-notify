import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { IProduct } from '../../../types';
import { productService } from './product.service';

interface ProductsState {
  productsList: IProduct[];
  currentProduct: IProduct | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  productsList: [],
  currentProduct: null,
  loading: false,
  error: null,
};

export const fetchAllProducts = createAsyncThunk(
  'products/fetchAll',
  async (params?: { category?: string; status?: string; search?: string }) => {
    const response = await productService.getAll(params);
    return response.data;
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.productsList = action.payload;
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch products';
      });
  },
});

export const { clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;
