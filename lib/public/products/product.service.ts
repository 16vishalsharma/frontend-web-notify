import api from '../../../services/api';
import { IProduct } from '../../../types';

export const productService = {
  getAll: async (params?: { category?: string; status?: string; search?: string }): Promise<{ success: boolean; count: number; data: IProduct[] }> => {
    const { data } = await api.get('/products', { params });
    return data;
  },

  getById: async (id: string): Promise<{ success: boolean; data: IProduct }> => {
    const { data } = await api.get(`/products/${id}`);
    return data;
  },

  getByCategory: async (slug: string): Promise<{ success: boolean; count: number; data: IProduct[] }> => {
    const { data } = await api.get(`/products/category/${slug}`);
    return data;
  },
};
