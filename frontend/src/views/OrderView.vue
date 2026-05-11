<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useOrderStore } from '../stores/order';
import router from '../router';

const showCreateOrder = ref(false);
const orderStore = useOrderStore();
const route = useRoute();
const shopId = route.params.id as string;

const createOrder = () => {
  router.push({
    name: 'order-create',
    params: { id: shopId }
  })
}

onMounted(async () => {
  if (shopId) {
    await orderStore.fetchOrdersByShop(shopId);
  }
});
</script>

<template>
  <div class="page-container">
    <div class="header-actions">
      <h2>order management</h2>
      <button class="create-btn" @click="createOrder">create order</button>
    </div>

    <div class="filters">
      <input type="text" placeholder="search order" class="search-input" />
      <select class="filter-dropdown">
        <option value="">filter</option>
      </select>
      <input type="date" class="date-input" />
      <button class="search-btn">search</button>
    </div>

    <div class="status-tabs">
      <span class="tab active">Draft</span> |
      <span class="tab">In progress</span> |
      <span class="tab">on delivery</span> |
      <span class="tab">package problem</span> |
      <span class="tab">success</span> |
      <span class="tab">bounce back</span> |
      <span class="tab">cancel</span>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th><input type="checkbox" /></th>
          <th>order number</th>
          <th>date</th>
          <th>customer name</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="orderStore.loading">
          <td colspan="5" style="text-align: center;">Loading orders...</td>
        </tr>
        <tr v-else-if="orderStore.orders.length === 0">
          <td colspan="5" style="text-align: center;">No orders found.</td>
        </tr>
        <tr v-else v-for="order in orderStore.orders" :key="order._id">
          <td><input type="checkbox" /></td>
          <td>{{ order.orderNumber || order._id }}</td>
          <td>{{ order.date || '-' }}</td>
          <td>{{ order.customerName || '-' }}</td>
          <td>{{ order.price || 0 }}</td>
        </tr>
        <!-- Order Expanded Detail will be implemented in the future -->
      </tbody>
    </table>
  </div>
</template>

<style scoped>
@import "../styles/order.css";
</style>
