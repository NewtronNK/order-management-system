import axios from 'axios';

export const fetchProductsByShopApi = async (shopId: string) => {
  const response = await axios.get(`/product/shop/${shopId}`);
  return response.data;
};

export const searchProductsApi = async (params: {
  shopId: string;
  text?: string;
  categoryId?: string;
  sortBySoldAmount?: string;
}) => {
  const queryParams: any = { shopId: params.shopId };
  if (params.text) queryParams.name = params.text;
  if (params.categoryId) queryParams.categoryId = params.categoryId;
  if (params.sortBySoldAmount) queryParams.sortBySoldAmount = params.sortBySoldAmount;

  const response = await axios.get('/product/search', { params: queryParams });
  return response.data;
};

export const createProductApi = async (payload: any) => {
  const response = await axios.post('/product', payload);
  return response.data;
};

export const checkProductCodeApi = async (code: string, shopId: string) => {
  const response = await axios.get(`/product/check?code=${code}&shopId=${shopId}`);
  return response.data;
};

export const updateProductApi = async (id: string, payload: any) => {
  const response = await axios.patch(`/product/${id}`, payload);
  return response.data;
};

export const deleteProductsApi = async (ids: string[]) => {
  const response = await axios.patch('/product/remove', { ids });
  return response.data;
};
