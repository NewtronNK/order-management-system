import { defineStore } from "pinia";
import { ref } from "vue";
import { useProductStore } from "./product";
import { 
  fetchOrdersByShopApi, 
  filterOrdersByStatusApi, 
  createOrderApi, 
  searchOrdersApi, 
  deleteOrdersApi, 
  updateOrderApi, 
  fetchOrderByIdApi 
} from "../components/api/order/order";

export const useOrderStore = defineStore("order", () => {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const orders = ref<any[]>([]);

  async function fetchOrdersByShop(shopId: string) {
    loading.value = true;
    error.value = null;
    try {
      orders.value = await fetchOrdersByShopApi(shopId);
    } catch (err: any) {
      error.value = err.response?.data?.message || "Failed to fetch orders";
      console.error("Failed to fetch orders:", err);
    } finally {
      loading.value = false;
    }
  }

  async function filterByStatus(status: string, shopId: string) {
    loading.value = true;
    error.value = null;
    try {
      orders.value = await filterOrdersByStatusApi(status, shopId);
    } catch (err: any) {
      error.value = err.response?.data?.message || "Failed to fetch orders";
      console.error("Failed to fetch orders:", err);
    } finally {
      loading.value = false;
    }
  }

  async function createOrder(payload: any) {
    loading.value = true;
    error.value = null;
    try {
      const productStore = useProductStore();
      const responseData = await createOrderApi(payload);
      
      // update quantity of product in the shop
      if (payload.orderItem && Array.isArray(payload.orderItem)) {
        for (const item of payload.orderItem) {
          const product = productStore.products.find(
            (p: any) => p._id === item._id,
          );
          if (product) {
            const newStock = Math.max(0, (product.stock || 0) - item.quantity);
            await productStore.updateProduct(item._id, { stock: newStock });
          }
        }
      }

      return responseData;
    } catch (err: any) {
      error.value = err.response?.data?.message || "Failed to create order";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function searchOrders(params: {
    shopId: string;
    text?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) {
    loading.value = true;
    error.value = null;
    try {
      orders.value = await searchOrdersApi(params);
    } catch (err: any) {
      error.value = err.response?.data?.message || "Failed to fetch orders";
      console.error("Failed to fetch orders:", err);
    } finally {
      loading.value = false;
    }
  }

  async function deleteOrders(ids: string[]) {
    loading.value = true;
    error.value = null;
    try {
      return await deleteOrdersApi(ids);
    } catch (err: any) {
      error.value = err.response?.data?.message || "Failed to delete orders";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateOrder(id: string, payload: any) {
    loading.value = true;
    error.value = null;
    try {
      return await updateOrderApi(id, payload);
    } catch (err: any) {
      error.value = err.response?.data?.message || "Failed to update order";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchOrderById(id: string) {
    loading.value = true;
    error.value = null;
    try {
      return await fetchOrderByIdApi(id);
    } catch (err: any) {
      error.value = err.response?.data?.message || "Failed to fetch order";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    error,
    orders,
    fetchOrdersByShop,
    createOrder,
    searchOrders,
    deleteOrders,
    filterByStatus,
    updateOrder,
    fetchOrderById,
  };
});

