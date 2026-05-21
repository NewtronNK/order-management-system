import axios from 'axios';

export const loginApi = async (credentials: { username: string; password: string }) => {
  const response = await axios.post('/auth/login', credentials);
  return response.data;
};

export const registerApi = async (credentials: { username: string; name: string; password: string }) => {
  const response = await axios.post('/user/register', credentials);
  return response.data;
};

export const logoutApi = async () => {
  const response = await axios.get('/auth/logout');
  return response.data;
};

export const changePasswordApi = async (credentials: { oldPassword: string; newPassword: string }) => {
  const response = await axios.put('/auth/changepassword', credentials);
  return response.data;
};

export const changeNameApi = async (credentials: { name: string }) => {
  const response = await axios.put('/auth/changename', credentials);
  return response.data;
};

export const getProfileApi = async () => {
  const response = await axios.get('/user/profile');
  return response.data;
};
