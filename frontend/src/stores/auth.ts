import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
import {
  loginApi,
  registerApi,
  logoutApi,
  changePasswordApi,
  changeNameApi,
  getProfileApi,
} from '../components/api/auth/auth';

// axios global setup
axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:3001/api';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<any>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const isAuthenticated = ref(false);

  async function login(credentials: { username: string; password: string }) {
    loading.value = true;
    error.value = null;
    try {
      user.value = await loginApi(credentials);
      return true;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Login failed';
    } finally {
      loading.value = false;
    }
  }

  async function register(credentials: { username: string; name: string; password: string }) {
    loading.value = true;
    error.value = null;
    try {
      await registerApi(credentials);
      return true;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Registration failed';
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    loading.value = true;
    error.value = null;
    try {
      await logoutApi();
      return true;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Logout cancelled';
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function changePassword(credentials: { oldPassword: string; newPassword: string }) {
    loading.value = true;
    error.value = null;
    try {
      await changePasswordApi(credentials);
      return true;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Change password failed';
    } finally {
      loading.value = false;
    }
  }

  async function changeName(credentials: { name: string }) {
    loading.value = true;
    error.value = null;
    try {
      await changeNameApi(credentials);
      user.value.name = credentials.name;
      return true;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Change name failed';
    } finally {
      loading.value = false;
    }
  }

  async function checkAuth() {
    try {
      user.value = await getProfileApi();
      isAuthenticated.value = true;
    } catch {
      user.value = null;
      isAuthenticated.value = false;
    }
  }

  return { user, loading, error, isAuthenticated, login, logout, register, changePassword, changeName, checkAuth };
});