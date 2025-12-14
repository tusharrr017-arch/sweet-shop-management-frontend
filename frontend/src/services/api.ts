import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export interface Sweet {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

const apiUrl = (path: string) => `${API_BASE_URL}${path}`;

export const sweetsApi = {
  getAll: async (): Promise<Sweet[]> => {
    const response = await axios.get(apiUrl('/api/sweets'));
    return response.data.sweets;
  },

  search: async (params: {
    name?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<Sweet[]> => {
    const queryParams = new URLSearchParams();
    if (params.name) queryParams.append('name', params.name);
    if (params.category) queryParams.append('category', params.category);
    if (params.minPrice) queryParams.append('minPrice', params.minPrice.toString());
    if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());

    const response = await axios.get(apiUrl(`/api/sweets/search?${queryParams}`));
    return response.data.sweets;
  },

  create: async (sweet: Omit<Sweet, 'id' | 'created_at' | 'updated_at'>): Promise<Sweet> => {
    const response = await axios.post(apiUrl('/api/sweets'), sweet);
    return response.data.sweet;
  },

  update: async (id: number, updates: Partial<Sweet>): Promise<Sweet> => {
    const response = await axios.put(apiUrl(`/api/sweets/${id}`), updates);
    return response.data.sweet;
  },

  delete: async (id: number): Promise<void> => {
    await axios.delete(apiUrl(`/api/sweets/${id}`));
  },

  purchase: async (id: number, quantity: number = 1): Promise<Sweet> => {
    const response = await axios.post(apiUrl(`/api/sweets/${id}/purchase`), { quantity });
    return response.data.sweet;
  },

  restock: async (id: number, quantity: number): Promise<Sweet> => {
    const response = await axios.post(apiUrl(`/api/sweets/${id}/restock`), { quantity });
    return response.data.sweet;
  },
};

