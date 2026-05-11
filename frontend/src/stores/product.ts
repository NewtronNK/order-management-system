import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";

export const useProductStore = defineStore('product', () => {
    const loading = ref(false);
    const error = ref<string | null>(null);
    const products = ref<any[]>([]);

    async function fetchProductsByShop(shopId: string) {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.get(`/product/shop/${shopId}`);
            products.value = response.data;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to fetch products';
            console.error('Failed to fetch products:', err);
        } finally {
            loading.value = false;
        }
    }

    async function searchProducts(shopId: string, text: string) {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.get(`/product/search?name=${text}&shopId=${shopId}`);
            products.value = response.data;
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
            const response = await axios.post('/product', payload);
            return response.data;
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
            const response = await axios.get(`/product/check?code=${code}&shopId=${shopId}`);
            return response.data;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'This code is already exist in this shop';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function updateProduct(id: string, payload: any) {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.patch(`/product/${id}`, payload);
            return response.data;
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
            const response = await axios.patch(`/product/remove`, { ids });
            return response.data;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to delete products';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    return { loading, error, products, fetchProductsByShop, createProduct, updateProduct, deleteProducts, checkCode, searchProducts };
});
