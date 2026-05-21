import { defineStore } from 'pinia';
import { ref } from 'vue';
import { searchCustomersApi, type CustomerSearchParams } from '../components/api/customer/customer';

export const useCustomerStore = defineStore('customer', () => {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const customers = ref<any[]>([]);

  async function searchCustomers(params: CustomerSearchParams) {
    loading.value = true;
    error.value = null;
    try {
      customers.value = await searchCustomersApi(params);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch customers';
      console.error('Failed to fetch customers:', err);
    } finally {
      loading.value = false;
    }
  }

  return { loading, error, customers, searchCustomers };
});
