import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";

export const useShopStore = defineStore('shop', () => {
    const loading = ref(false);
    const error = ref<string | null>(null);
    const shops = ref<any[]>([]);
    const currentShop = ref<any>(null);

    async function fetchMyShops() {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.get('/shop/my');
            shops.value = response.data;
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
            const response = await axios.post('/shop', payload);
            return response.data;
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
            const response = await axios.patch(`/shop/${currentShop.value._id}`, payload);
            return response.data;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to create shop';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function setcurrentShop(id: string) {
        if (currentShop.value?._id === id) return;
        loading.value = true;
        try {
            const response = await axios.get(`/shop/${id}`);
            currentShop.value = response.data;
        } catch (error) {
            console.error('Failed to fetch shop:', error);
            currentShop.value = null;
        } finally {
            loading.value = false
        }
    }

    return { loading, error, shops, currentShop, setcurrentShop, fetchMyShops, createShop, updateShop };
});
