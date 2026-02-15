import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IAuthState } from '../../../types';

const initialState: IAuthState = {
  isLoggedIn: false,
  bloggerName: null,
  bloggerEmail: null,
  bloggerId: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setBloggerAuth: (state, action: PayloadAction<{ name: string; email: string; id: string }>) => {
      state.isLoggedIn = true;
      state.bloggerName = action.payload.name;
      state.bloggerEmail = action.payload.email;
      state.bloggerId = action.payload.id;
    },
    clearBloggerAuth: (state) => {
      state.isLoggedIn = false;
      state.bloggerName = null;
      state.bloggerEmail = null;
      state.bloggerId = null;
    },
  },
});

export const { setBloggerAuth, clearBloggerAuth } = authSlice.actions;
export default authSlice.reducer;
