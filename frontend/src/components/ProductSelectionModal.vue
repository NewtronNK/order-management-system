<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useProductStore } from '../stores/product';
import { useCategoryStore } from '../stores/category';
import { filterProductsByCategory, filterCategoriesByShop } from './utils/filters';
import { handleProductSearchAction } from './utils/search';
import type { SelectedItem } from './utils/types';

const props = defineProps<{
  isVisible: boolean;
  shopId: string;
  initialSelectedItems: SelectedItem[];
}>();

const emit = defineEmits(['close', 'confirm']);

const productStore = useProductStore();
const categoryStore = useCategoryStore();

const productSearch = ref('');
const productCategoryFilter = ref('');
const productPage = ref(1);
const productsPerPage = 5;

const selectedItems = ref<SelectedItem[]>([]);

// Initialize data when opened
watch(() => props.isVisible, async (newVal) => {
  if (newVal) {
    selectedItems.value = props.initialSelectedItems.map(i => ({ ...i }));
    productSearch.value = '';
    productCategoryFilter.value = '';
    productPage.value = 1;
    await Promise.all([
      productStore.fetchProductsByShop(props.shopId),
      categoryStore.fetchCategories(),
    ]);
  }
});

const filteredCategories = computed(() => {
  return filterCategoriesByShop(categoryStore.categories, props.shopId);
});

const filteredProducts = computed(() => {
  return filterProductsByCategory(productStore.products, productCategoryFilter.value);
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredProducts.value.length / productsPerPage))
);

const pagedProducts = computed(() => {
  const start = (productPage.value - 1) * productsPerPage;
  return filteredProducts.value.slice(start, start + productsPerPage);
});

const handleSearch = async () => {
  await handleProductSearchAction(productStore, props.shopId, productSearch.value, productPage);
};

const getInitialQty = (productId: string) => {
  const initial = props.initialSelectedItems.find(i => i._id === productId);
  return initial ? initial.qty : 0;
};

const availableStock = (product: any): number => {
  const selected = selectedItems.value.find(i => i._id === product._id);
  const initialQty = getInitialQty(product._id);
  const trueStock = (product.stock ?? 0) + initialQty;
  return trueStock - (selected?.qty ?? 0);
};

const addToSelected = (product: any) => {
  const existing = selectedItems.value.find(i => i._id === product._id);
  if (existing) {
    if (availableStock(product) > 0) existing.qty++;
  } else {
    selectedItems.value.push({
      _id: product._id,
      name: product.name,
      productCode: product.productCode ?? '',
      description: product.description ?? '',
      price: product.price,
      stock: product.stock ?? 0,
      qty: 1,
    });
  }
};

const canIncrease = (item: SelectedItem) => {
  const original = productStore.products.find(p => p._id === item._id);
  return !original || availableStock(original) > 0;
};

const increaseQty = (item: SelectedItem) => {
  if (canIncrease(item)) item.qty++;
};

const decreaseQty = (item: SelectedItem) => {
  if (item.qty > 1) item.qty--;
  else removeSelected(item._id);
};

const removeSelected = (id: string) => {
  selectedItems.value = selectedItems.value.filter(i => i._id !== id);
};

const totalSelectedQty = computed(() =>
  selectedItems.value.reduce((sum, i) => sum + i.qty, 0)
);

const confirm = () => {
  emit('confirm', selectedItems.value);
};

</script>

<template>
  <div v-if="isVisible" class="modal-overlay">
    <div class="modal-box">
      <!-- Left panel: product search & list -->
      <div class="modal-left">
        <!-- Search & category filter -->
        <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 10px;">
          <input type="text" v-model="productSearch" placeholder="search"
            @keyup.enter="handleSearch" style="flex: 1;" />
          <button class="btn" @click="handleSearch">search</button>
          <select v-model="productCategoryFilter" @change="productPage = 1">
            <option value="">All categories</option>
            <option v-for="cat in filteredCategories" :key="cat._id" :value="cat._id">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <!-- Loading indicator -->
        <p v-if="productStore.loading">Loading...</p>

        <!-- Product rows -->
        <div v-for="product in pagedProducts" :key="product._id" class="modal-product-row">
          <div class="modal-product-info">
            <span>{{ product.name }}</span>
            <span class="product-code">{{ product.productCode }}</span>
          </div>
          <div class="modal-product-meta">
            <span>{{ product.price }} Baht</span>
            <span>{{ availableStock(product) }} left</span>
            <button class="btn hide-btn" :disabled="availableStock(product) <= 0" @click="addToSelected(product)">add</button>
          </div>
        </div>

        <!-- Page -->
        <div class="confirm-container" style="margin-top: 10px;">
          <button class="btn" :disabled="productPage <= 1" @click="productPage--">&lt;</button>
          <span>{{ productPage }} / {{ totalPages }}</span>
          <button class="btn" :disabled="productPage >= totalPages" @click="productPage++">&gt;</button>
        </div>
      </div>

      <!-- Divider -->
      <div class="modal-divider"></div>

      <!-- Right panel: selected list -->
      <div class="modal-right">
        <div class="confirm-container">
          <span>Selected List</span>
          <span>{{ totalSelectedQty }} item{{ totalSelectedQty !== 1 ? 's' : '' }} selected</span>
        </div>

        <div v-for="item in selectedItems" :key="item._id" class="modal-selected-row">
          <div class="modal-product-info">
            <span>{{ item.name }}</span>
            <span class="product-code">{{ item.productCode }}</span>
          </div>
          <div class="modal-product-meta">
            <span>{{ item.price }} Baht</span>
            <button class="btn" @click="decreaseQty(item)">-</button>
            <span>{{ item.qty }}</span>
            <button class="btn" :disabled="!canIncrease(item)" @click="increaseQty(item)">+</button>
            <button class="btn hide-btn" @click="removeSelected(item._id)">delete</button>
          </div>
        </div>

        <!-- Bottom actions -->
        <div class="confirm-container" style="margin-top: auto; padding-top: 15px;">
          <button class="btn" @click="emit('close')">Cancel</button>
          <button class="btn hide-btn" @click="confirm">Confirm</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "../styles/createOrder.css";
</style>
