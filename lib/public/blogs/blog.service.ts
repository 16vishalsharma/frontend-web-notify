import api from '../../../services/api';
import { IBlog, IBlogFormData } from '../../../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const blogService = {
  getAll: async (): Promise<IBlog[]> => {
    const { data } = await api.get('/news'); // blogs use view routes, not API
    return data;
  },

  getBlogs: async (): Promise<Response> => {
    const response = await fetch(`${API_BASE_URL}/blogs`);
    return response;
  },

  create: async (blogData: IBlogFormData): Promise<void> => {
    const formBody = new URLSearchParams();
    Object.entries(blogData).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        formBody.append(key, String(value));
      }
    });
    await fetch(`${API_BASE_URL}/blogs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formBody.toString(),
    });
  },

  bloggerLogin: async (email: string, password: string) => {
    const formBody = new URLSearchParams({ email, password });
    const response = await fetch(`${API_BASE_URL}/blogger/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formBody.toString(),
      credentials: 'include',
    });
    return response;
  },

  bloggerLogout: async () => {
    await fetch(`${API_BASE_URL}/blogger/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  },
};
