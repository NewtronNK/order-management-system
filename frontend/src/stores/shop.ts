import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  fetchMyShopsApi,
  createShopApi,
  updateShopApi,
  fetchShopByIdApi,
} from '../components/api/shop/shop';

export const useShopStore = defineStore('shop', () => {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const shops = ref<any[]>([]);
  const currentShop = ref<any>(null);

  async function fetchMyShops() {
    loading.value = true;
    error.value = null;
    try {
      shops.value = await fetchMyShopsApi();
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch shops';
      console.error('Failed to fetch my shops:', err);
    } finally {
      loading.value = false;
    }
  }

  async function createShop(payload: any) {
    loading.value = true;
    error.value = null;
    try {
      return await createShopApi(payload);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create shop';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateShop(payload: any) {
    loading.value = true;
    error.value = null;
    try {
      return await updateShopApi(currentShop.value._id, payload);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update shop';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function setcurrentShop(id: string) {
    if (currentShop.value?._id === id) return;
    loading.value = true;
    try {
      currentShop.value = await fetchShopByIdApi(id);
    } catch (err: any) {
      console.error('Failed to fetch shop:', err);
      currentShop.value = null;
    } finally {
      loading.value = false;
    }
  }

  return { loading, error, shops, currentShop, fetchMyShops, createShop, updateShop, setcurrentShop };
});
