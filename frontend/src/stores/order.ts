import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";

export const useOrderStore = defineStore('order', () => {
    const loading = ref(false);
    const error = ref<string | null>(null);
    const orders = ref<any[]>([]);

    async function fetchOrdersByShop(shopId: string) {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.get(`/order/shop/${shopId}`);
            orders.value = response.data;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to fetch orders';
            console.error('Failed to fetch orders:', err);
        } finally {
            loading.value = false;
        }
    }

    async function createOrder(payload: any) {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.post('/order', payload);
            return response.data;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to create order';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    return { loading, error, orders, fetchOrdersByShop, createOrder };
});
