import axios from 'axios';

export interface CustomerSearchParams {
  shopId: string;
  text?: string;
  startDate?: string;
  endDate?: string;
  sort?: string;
}

export const searchCustomersApi = async (params: CustomerSearchParams) => {
  const queryParams = new URLSearchParams();
  if (params.shopId) queryParams.append('shopId', params.shopId);
  if (params.text) queryParams.append('text', params.text);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.sort) queryParams.append('sort', params.sort);

  const response = await axios.get(`/customer/search?${queryParams.toString()}`);
  return response.data;
};
