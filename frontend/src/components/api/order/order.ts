import axios from 'axios';
import type { OrderPayload, Order, OrderSearchParams } from './type';

export const fetchOrdersByShopApi = async (shopId: string): Promise<Order[]> => {
  const response = await axios.get(`/order/shop/${shopId}`);
  return response.data;
};

export const filterOrdersByStatusApi = async (status: string, shopId: string): Promise<Order[]> => {
  const response = await axios.get(`/order/filter?status=${status}&shopId=${shopId}`);
  return response.data;
};

export const createOrderApi = async (payload: OrderPayload): Promise<Order> => {
  const response = await axios.post('/order', payload);
  return response.data;
};

export const searchOrdersApi = async (params: OrderSearchParams): Promise<Order[]> => {
  const queryParams = new URLSearchParams();
  if (params.shopId) queryParams.append('shopId', params.shopId);
  if (params.text) queryParams.append('text', params.text);
  if (params.status) queryParams.append('status', params.status);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);

  const response = await axios.get(`/order/search?${queryParams.toString()}`);
  return response.data;
};

export const deleteOrdersApi = async (ids: string[]): Promise<any> => {
  const response = await axios.patch(`/order/remove`, { ids });
  return response.data;
};

export const updateOrderApi = async (id: string, payload: any): Promise<Order> => {
  const response = await axios.patch(`/order/${id}`, payload);
  return response.data;
};

export const fetchOrderByIdApi = async (id: string): Promise<Order> => {
  const response = await axios.get(`/order/${id}`);
  return response.data;
};
