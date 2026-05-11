import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";

export const useCategoryStore = defineStore('category', () => {
    const loading = ref(false);
    const error = ref<string | null>(null);
    const categories = ref<any[]>([]);

    async function fetchCategories() {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.get('/category');
            categories.value = response.data;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to fetch categories';
            console.error('Failed to fetch categories:', err);
        } finally {
            loading.value = false;
        }
    }

    async function createCategory(shopId: string, name: string) {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.post('/category', { shopId, name });
            categories.value.push(response.data);
            return response.data;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to create category';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    return { loading, error, categories, fetchCategories, createCategory };
});
