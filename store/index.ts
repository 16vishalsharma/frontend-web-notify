import { configureStore } from '@reduxjs/toolkit';
import newsReducer from '../lib/public/news/newsSlice';
import blogsReducer from '../lib/public/blogs/blogSlice';
import uploadReducer from '../lib/public/upload/uploadSlice';
import authReducer from '../lib/public/auth/authSlice';
import productsReducer from '../lib/public/products/productSlice';

export const store = configureStore({
  reducer: {
    news: newsReducer,
    blogs: blogsReducer,
    upload: uploadReducer,
    auth: authReducer,
    products: productsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
