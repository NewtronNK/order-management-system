<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { initialSearchForm } from "@/components/utils/forms";
import { useCustomerStore } from "@/stores/customer";

const route = useRoute();
const shopId = route.params.id as string;
const searchForm = reactive(initialSearchForm());
const selectedSort = ref('');
const customerStore = useCustomerStore();

const handleSearch = async () => {
  await customerStore.searchCustomers({
    shopId,
    text: searchForm.message,
    startDate: searchForm.startDate,
    endDate: searchForm.endDate,
    sort: selectedSort.value
  });
}

onMounted(() => {
  handleSearch();
});

</script>
<template>
    <div class="page-container">
    <div class="header-actions">
      <h2>Customer List</h2>
    </div>

    <div class="filters">
      <input type="text" placeholder="search customer name contact" class="search-input" v-model="searchForm.message" />
      <select class="filter-dropdown" v-model="selectedSort">
        <option value="">not selected</option>
        <option value="desc">first buy</option>
        <option value="asc">lastest buy</option>
      </select>
      <label>
        <input type="date" class="date-input" v-model="searchForm.startDate" :max="searchForm.endDate" />
        <input type="date" class="date-input" v-model="searchForm.endDate" :min="searchForm.startDate" />
      </label>
      <button class="search-btn" @click="handleSearch">search</button>
    </div>
    <table class="data-table">
      <thead>
        <tr>
          <th>customer information</th><!-- string -->
          <th>first purchase</th><!-- date -->
          <th>lastest purchase</th><!-- date -->
          <th>order(s)</th><!-- number -->
          <th>total values</th><!-- number -->
        </tr>
      </thead>
      <tbody>
        <tr v-if="customerStore.loading">
          <td colspan="6" style="text-align: center;">Loading customers...</td>
        </tr>
        <tr v-else-if="customerStore.customers.length === 0">
          <td colspan="6" style="text-align: center;">No customers found.</td>
        </tr>
        <template v-else>
          <template v-for="customer in customerStore.customers" :key="customer.id">
            <!-- Customer Row -->
            <tr>
              <td>
                <div style="font-weight: 500;">{{ customer.name }}</div>
                <div style="font-size: 0.9em; color: #666;">{{ customer.contact }}</div>
              </td>
              <td>{{ new Date(customer.firstPurchase).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) }}</td>
              <td>{{ new Date(customer.latestPurchase).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) }}</td>
              <td>{{ customer.orderCount }}</td>
              <td>{{ customer.totalValue }}฿</td>
            </tr>
          </template>
        </template>
      </tbody>
    </table>
    </div>
</template>
<style scoped>
@import "../styles/order.css";
</style>