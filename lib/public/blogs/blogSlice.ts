import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IBlog } from '../../../types';

interface BlogsState {
  blogsList: IBlog[];
  currentBlog: IBlog | null;
  loading: boolean;
  error: string | null;
}

const initialState: BlogsState = {
  blogsList: [],
  currentBlog: null,
  loading: false,
  error: null,
};

const blogSlice = createSlice({
  name: 'blogs',
  initialState,
  reducers: {
    setBlogsList: (state, action: PayloadAction<IBlog[]>) => {
      state.blogsList = action.payload;
    },
    setCurrentBlog: (state, action: PayloadAction<IBlog | null>) => {
      state.currentBlog = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setBlogsList, setCurrentBlog, setLoading, setError } = blogSlice.actions;
export default blogSlice.reducer;
