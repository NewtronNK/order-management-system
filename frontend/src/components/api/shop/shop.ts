import axios from 'axios';

export const fetchMyShopsApi = async () => {
  const response = await axios.get('/shop/my');
  return response.data;
};

export const createShopApi = async (payload: any) => {
  const response = await axios.post('/shop', payload);
  return response.data;
};

export const updateShopApi = async (id: string, payload: any) => {
  const response = await axios.patch(`/shop/${id}`, payload);
  return response.data;
};

export const fetchShopByIdApi = async (id: string) => {
  const response = await axios.get(`/shop/${id}`);
  return response.data;
};
