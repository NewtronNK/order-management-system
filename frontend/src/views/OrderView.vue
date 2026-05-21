<script setup lang="ts">
import { ref, onMounted, watch, reactive } from 'vue';
import { useRoute } from 'vue-router';
import { useOrderStore } from '../stores/order';
import router from '../router';
import { useSelectAll } from '@/components/utils/selection';
import DeleteConfirmModal from '../components/DeleteConfirmModal.vue';
import StatusChangeConfirmModal from '../components/StatusChangeConfirmModal.vue';
import { handleSimpleOrderSearch } from '@/components/utils/search';
import { initialSearchForm } from '@/components/utils/forms';

const expandedOrderId = ref<string | null>(null);
const orderStore = useOrderStore();
const route = useRoute();
const shopId = route.params.id as string;
const selectedOrders = ref<string[]>([]);
const showDeleteConfirm = ref(false);
const showStatusChangeModal = ref(false);
const searchForm = reactive(initialSearchForm());
type StageStatus = 'draft' | 'processing'| 'on delivery'| 'package problem'| 'success'| 'bounce back'| 'cancel'
const stages: StageStatus[] = ['draft', 'processing', 'on delivery', 'package problem', 'success', 'bounce back', 'cancel']
const currentStage = ref<StageStatus>('draft');

const { isAllSelected, toggleSelectAll } = useSelectAll(() => orderStore.orders, selectedOrders, '_id');

const selectStage = (status: StageStatus): void => {
  currentStage.value = status;
}

watch(
  () => currentStage.value, 
  (newVal) => {
    if (newVal) {
      orderStore.filterByStatus(newVal, shopId);
    }
  }
);

const createOrder = () => {
  router.push({
    name: 'order-create',
    params: { id: shopId }
  })
}

const editOrder = (orderId: string) => {
  router.push({
    name: 'order-edit',
    params: { id: shopId, orderId }
  })
}

const handleSearch = async (shopId: string, text: string) => {
  await handleSimpleOrderSearch(
    orderStore, 
    shopId, 
    text, 
    currentStage.value,
    searchForm.startDate,
    searchForm.endDate
  );
}

const confirmDelete = async () => {
  try {
    await orderStore.deleteOrders(selectedOrders.value);
    showDeleteConfirm.value = false;
    selectedOrders.value = []; // reset selected
    await orderStore.filterByStatus(currentStage.value, shopId);
  } catch (err: any) {
    alert(err.response?.data?.message || 'Failed to delete orders');
  }
};

const confirmStatusChange = async (newStatus: string) => {
  try {
    const promises = selectedOrders.value.map(id => orderStore.updateOrder(id, { status: newStatus, shopId: shopId }));
    await Promise.all(promises);
    showStatusChangeModal.value = false;
    selectedOrders.value = [];
    await orderStore.filterByStatus(currentStage.value, shopId);
  } catch (err: any) {
    alert(err.response?.data?.message || 'Failed to change status');
  }
};

onMounted(async () => {
  if (shopId) {
    await orderStore.filterByStatus('draft', shopId);
  }
});
</script>

<template>
  <div class="page-container">
    <div class="header-actions">
      <h2>Order management</h2>
      <div>
        <button v-if="selectedOrders.length > 0" class="btn" style="background-color: #dc3545; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-right: 10px;" @click="showDeleteConfirm = true">Cancel Order(s) ({{ selectedOrders.length }})</button>
        <button class="create-btn" @click="createOrder">create order</button>
      </div>
    </div>

    <div class="filters">
      <input type="text" placeholder="search order" class="search-input" v-model="searchForm.message" />
      <label>
        <input type="date" class="date-input" v-model="searchForm.startDate" :max="searchForm.endDate" />
        <input type="date" class="date-input" v-model="searchForm.endDate" :min="searchForm.startDate" />
      </label>
        
      <button class="search-btn" @click="handleSearch(shopId, searchForm.message)">search</button>
    </div>
    
     <!-- change stage just fecth แค่ fetch data ตามสถานะก็น่าจะได้ ไม่จำเป็นต้องใช้ emit -->
    <div class="status-tabs">
      <span v-for="status in stages"
      :key="status"
      @click="selectStage(status)"
      :class="{ 'active': currentStage === status }"
      class="tab">
      {{ status }}
      </span>
      <button v-if="currentStage!='cancel'" class="change-btn close-right" @click="showStatusChangeModal = true" :disabled="selectedOrders.length === 0">change stage</button>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th v-if="currentStage != 'cancel'"><input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" /></th>
          <th>order number</th>
          <th>date</th>
          <th>customer name</th>
          <th>total</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="orderStore.loading">
          <td colspan="5" style="text-align: center;">Loading orders...</td>
        </tr>
        <tr v-else-if="orderStore.orders.length === 0">
          <td colspan="5" style="text-align: center;">No orders found.</td>
        </tr>
        <template v-else>
          <template v-for="order in orderStore.orders" :key="order._id">
            <tr @click="expandedOrderId = expandedOrderId === order._id ? null : order._id" style="cursor: pointer; border-bottom: 1px solid #eee;">
          <!-- <tr v-else v-for="order in orderStore.orders" :key="order._id"> -->
              <td v-if="currentStage != 'cancel'"><input type="checkbox" v-model="selectedOrders" :value="order._id" @click.stop /></td>
              <td>{{ order.orderNumber || order._id }}</td>
              <td>{{ new Date(order.orderDate).toLocaleString('th-TH') || '-' }}</td>
              <td>{{ order.customerAddress.name || '-' }}</td>
              <td>฿{{ order.totalPrice || 0 }}</td>
            </tr>
        <!-- Order Expanded Detail will be implemented in the future -->
            <tr v-if="expandedOrderId === order._id">
              <td colspan="6" style="padding: 10px 0;">
                <div class="expand-order">
                    <div class="order-item row" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                      <h3>order number | {{ order.orderNumber || '-' }}</h3>
                      <div v-if="currentStage!='cancel'" class="close-right tab active" @click="editOrder(order._id)">edit</div>
                    </div>
                    <div class="order-item row" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                      <div class="row">date created | {{ new Date(order.orderDate).toLocaleString('th-TH') || '-' }}</div>
                      <div class="close-right">send from {{ order.shopAddress.name }}</div>
                    </div>
                    <hr>
                    <div class="order-item">
                      <strong>customer information</strong>
                      <div >name: {{ order.customerAddress.name }}</div>
                      <div>contact: {{ order.customerAddress.contact }}</div>
                      <div>address: {{ order.customerAddress.detail }}, {{ order.customerAddress.province }},
                        {{ order.customerAddress.district }}, {{ order.customerAddress.postcode }}
                      </div>
                    </div>
                    <hr>
                    <div class="order-item">
                      <strong>channel of distribution</strong>
                      <div>delivery: {{ order.delivery }}</div>
                    </div>
                    <hr>
                    <div class="order-item">
                      <strong>product list</strong>
                      <div
                      v-for="product in order.orderItem"
                      :key="product.productId"
                      >
                      * {{ product.quantity }}x {{ product.name }} ฿{{ product.totalPrice }} 
                      </div>
                    </div>
                    <hr>
                    <div class="order-item">
                      <strong>payment method</strong>
                      <div>{{ order.paymentMethod }}</div>
                    </div>
                </div>
              </td>
            </tr>
          </template>
        </template>
      </tbody>
    </table>
  </div>
  <DeleteConfirmModal
      :isVisible="showDeleteConfirm"
      :itemCount="selectedOrders.length"
      itemName="order"
      @close="showDeleteConfirm = false"
      @confirm="confirmDelete"
    />
  <StatusChangeConfirmModal
      :isVisible="showStatusChangeModal"
      :itemCount="selectedOrders.length"
      :currentStatus="currentStage"
      @close="showStatusChangeModal = false"
      @confirm="confirmStatusChange"
    />
</template>

<style scoped>
@import "../styles/order.css";
</style>
