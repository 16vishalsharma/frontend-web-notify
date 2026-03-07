import api from '../../../services/api';
import { IMetalPriceResponse } from '../../../types';

export const metalPricesService = {
  getAll: async (params?: { page?: number; limit?: number }): Promise<IMetalPriceResponse> => {
    const { data } = await api.get('/metal-prices', { params });
    return data;
  },
};
