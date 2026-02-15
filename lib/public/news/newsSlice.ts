import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { INews } from '../../../types';
import { newsService } from './news.service';

interface NewsState {
  newsList: INews[];
  currentNews: INews | null;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
  currentTopic: string;
}

const initialState: NewsState = {
  newsList: [],
  currentNews: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  totalPages: 1,
  currentTopic: '',
};

export const fetchAllNews = createAsyncThunk(
  'news/fetchAll',
  async (params?: { topic?: string; page?: number; limit?: number; search?: string }) => {
    const response = await newsService.getAll(params);
    return response;
  }
);

export const fetchNewsById = createAsyncThunk(
  'news/fetchById',
  async (id: string) => {
    const response = await newsService.getById(id);
    return response.data;
  }
);

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    setCurrentTopic: (state, action: PayloadAction<string>) => {
      state.currentTopic = action.payload;
    },
    clearCurrentNews: (state) => {
      state.currentNews = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllNews.fulfilled, (state, action) => {
        state.loading = false;
        state.newsList = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchAllNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch news';
      })
      .addCase(fetchNewsById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNewsById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentNews = action.payload;
      })
      .addCase(fetchNewsById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch news';
      });
  },
});

export const { setCurrentTopic, clearCurrentNews } = newsSlice.actions;
export default newsSlice.reducer;
