import { IUploadResponse, IFileListItem } from '../../../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const uploadService = {
  uploadSingle: async (file: File): Promise<IUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE_URL}/upload/single`, {
      method: 'POST',
      body: formData,
    });
    return response.json();
  },

  uploadMultiple: async (files: FileList): Promise<IUploadResponse> => {
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('files', file));
    const response = await fetch(`${API_BASE_URL}/upload/multiple`, {
      method: 'POST',
      body: formData,
    });
    return response.json();
  },

  uploadLarge: async (file: File): Promise<IUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE_URL}/upload/large`, {
      method: 'POST',
      body: formData,
    });
    return response.json();
  },

  getFiles: async (): Promise<{ success: boolean; workerId: number; count: number; files: IFileListItem[] }> => {
    const response = await fetch(`${API_BASE_URL}/upload/files`);
    return response.json();
  },
};
