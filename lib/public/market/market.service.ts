import api from '../../../services/api';
import { IMarketAllResponse } from '../../../types';

export const marketService = {
  getAll: async (): Promise<IMarketAllResponse> => {
    const { data } = await api.get('/market/all');
    return data;
  },
};
