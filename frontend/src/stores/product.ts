import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  fetchProductsByShopApi,
  searchProductsApi,
  createProductApi,
  checkProductCodeApi,
  updateProductApi,
  deleteProductsApi,
} from '../components/api/product/product';

export const useProductStore = defineStore('product', () => {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const products = ref<any[]>([]);

  async function fetchProductsByShop(shopId: string) {
    loading.value = true;
    error.value = null;
    try {
      products.value = await fetchProductsByShopApi(shopId);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch products';
      console.error('Failed to fetch products:', err);
    } finally {
      loading.value = false;
    }
  }

  async function searchProducts(params: {
    shopId: string;
    text?: string;
    categoryId?: string;
    sortBySoldAmount?: string;
  }) {
    loading.value = true;
    error.value = null;
    try {
      products.value = await searchProductsApi(params);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch products';
      console.error('Failed to fetch products:', err);
    } finally {
      loading.value = false;
    }
  }

  async function createProduct(payload: any) {
    loading.value = true;
    error.value = null;
    try {
      return await createProductApi(payload);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create product';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function checkCode(code: string, shopId: string) {
    loading.value = true;
    error.value = null;
    try {
      return await checkProductCodeApi(code, shopId);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'This code already exists in this shop';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateProduct(id: string, payload: any) {
    loading.value = true;
    error.value = null;
    try {
      return await updateProductApi(id, payload);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update product';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteProducts(ids: string[]) {
    loading.value = true;
    error.value = null;
    try {
      return await deleteProductsApi(ids);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete products';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return { loading, error, products, fetchProductsByShop, searchProducts, createProduct, checkCode, updateProduct, deleteProducts };
});
