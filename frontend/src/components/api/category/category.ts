import axios from 'axios';

export const fetchCategoriesApi = async () => {
  const response = await axios.get('/category');
  return response.data;
};

export const createCategoryApi = async (shopId: string, name: string) => {
  const response = await axios.post('/category', { shopId, name });
  return response.data;
};
