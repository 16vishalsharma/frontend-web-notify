import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IFileListItem } from '../../../types';

interface UploadState {
  files: IFileListItem[];
  uploading: boolean;
  error: string | null;
  lastUploadResult: string | null;
}

const initialState: UploadState = {
  files: [],
  uploading: false,
  error: null,
  lastUploadResult: null,
};

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    setFiles: (state, action: PayloadAction<IFileListItem[]>) => {
      state.files = action.payload;
    },
    setUploading: (state, action: PayloadAction<boolean>) => {
      state.uploading = action.payload;
    },
    setUploadError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setLastUploadResult: (state, action: PayloadAction<string | null>) => {
      state.lastUploadResult = action.payload;
    },
  },
});

export const { setFiles, setUploading, setUploadError, setLastUploadResult } = uploadSlice.actions;
export default uploadSlice.reducer;
