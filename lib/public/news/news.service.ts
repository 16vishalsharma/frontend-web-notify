import api from '../../../services/api';
import { INews, INewsResponse } from '../../../types';

export const newsService = {
  getAll: async (params?: { topic?: string; page?: number; limit?: number; search?: string }): Promise<INewsResponse> => {
    const { data } = await api.get('/news', { params });
    return data;
  },

  getById: async (id: string): Promise<{ success: boolean; data: INews }> => {
    const { data } = await api.get(`/news/${id}`);
    return data;
  },

  getByTopic: async (topic: string): Promise<{ success: boolean; count: number; data: INews[] }> => {
    const { data } = await api.get(`/news/topic/${topic}`);
    return data;
  },

  getTopicsSummary: async () => {
    const { data } = await api.get('/news/topics/summary');
    return data;
  },

  create: async (newsData: Partial<INews>): Promise<{ success: boolean; data: INews }> => {
    const { data } = await api.post('/news', newsData);
    return data;
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    const { data } = await api.delete(`/news/${id}`);
    return data;
  },
};
