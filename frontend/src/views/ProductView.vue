<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useProductStore } from '../stores/product';
import { useCategoryStore } from '../stores/category';
import { useShopStore } from '@/stores/shop';
import { useSelectAll } from '../components/utils/selection';
import { handleSimpleProductSearch } from '../components/utils/search';
import ProductFormModal from '../components/ProductFormModal.vue';
import DeleteConfirmModal from '../components/DeleteConfirmModal.vue';

const showCreateProduct = ref(false);
const isEditing = ref(false);
const productToEdit = ref<any>(null);
const productStore = useProductStore();
const categoryStore = useCategoryStore();
const shopStore = useShopStore();
const route = useRoute();
const shopId = route.params.id as string;

const selectedProducts = ref<string[]>([]);
const showDeleteConfirm = ref(false);
const expandedProductId = ref<string | null>(null);

const selectedCategory = ref('');
const selectedSort = ref('');

const getCategoryName = (product: any) => {
  let cat = product.category;
  let catId = typeof cat === 'object' && cat !== null ? cat._id || cat : cat;
  if (!catId) return '-';
  const found = categoryStore.categories.find((c: any) => c._id === catId);
  return found ? found.name : catId;
};

const { isAllSelected, toggleSelectAll } = useSelectAll(() => productStore.products, selectedProducts, '_id');
const filteredCategories = computed(() => {
  return categoryStore.categories.filter((cat: any) => cat.shopId === shopId);
});
onMounted(async () => {
  await categoryStore.fetchCategories();
  if (shopId) {
    await productStore.fetchProductsByShop(shopId);
  }
});

const openCreateProduct = () => {
  isEditing.value = false;
  productToEdit.value = null;
  showCreateProduct.value = true;
};

const openEditProduct = (product: any) => {
  isEditing.value = true;
  productToEdit.value = product;
  showCreateProduct.value = true;
};

const handleRefresh = async () => {
  await productStore.fetchProductsByShop(shopId);
};

const handleSearch = async (shopId: string, text: string, categoryId: string, sort: string) => {
  await handleSimpleProductSearch(productStore, shopId, text, categoryId, sort);
}

const message = ref('');

const confirmDelete = async () => {
  try {
    await productStore.deleteProducts(selectedProducts.value);
    showDeleteConfirm.value = false;
    selectedProducts.value = []; // reset selected
    await productStore.fetchProductsByShop(shopId);
  } catch (err: any) {
    alert(err.response?.data?.message || 'Failed to delete products');
  }
};
</script>

<template>
  <div class="page-container">
    <div class="header-actions">
      <h2>Product management</h2>
      <div>
        <button v-if="selectedProducts.length > 0" class="btn" style="background-color: #dc3545; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-right: 10px;" @click="showDeleteConfirm = true">Delete Selected ({{ selectedProducts.length }})</button>
        <button class="create-btn" @click="openCreateProduct">create product</button>
      </div>
    </div>

    <div class="filters">
      <input type="text" placeholder="search product" class="search-input" v-model="message" />
      <select class="filter-dropdown" v-model="selectedCategory">
        <option class="filter-dropdown" value="">all categories</option>
        <option v-for="cat in filteredCategories" :key="cat._id" :value="cat._id">
          {{ cat.name }}
        </option>
      </select>
      <select class="filter-dropdown" v-model="selectedSort">
        <option value="">sold amount</option>
        <option value="desc"> most </option>
        <option value="asc"> least </option>
      </select>
      <button class="search-btn" @click="handleSearch(shopId, message, selectedCategory, selectedSort)">search</button>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th><input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" /></th>
          <th>product code</th>
          <th>Productname</th>
          <th>stock</th>
          <th>Price</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="productStore.loading">
          <td colspan="6" style="text-align: center;">Loading products...</td>
        </tr>
        <tr v-else-if="productStore.products.length === 0">
          <td colspan="6" style="text-align: center;">No products found.</td>
        </tr>
        <template v-else>
          <template v-for="product in productStore.products" :key="product._id">
            <!-- Product Row -->
            <tr @click="expandedProductId = expandedProductId === product._id ? null : product._id" style="cursor: pointer; border-bottom: 1px solid #eee;">
              <td><input type="checkbox" v-model="selectedProducts" :value="product._id" @click.stop /></td>
              <td>{{ product.productCode || product.code || '-' }}</td>
              <td>{{ product.name || product.productName || '-' }}</td>
              <td>{{ product.stock || 0 }}</td>
              <td>{{ product.price || 0 }} Baht</td>
              <td>
                <div class="edit-btn" @click.stop="openEditProduct(product)">Edit</div>
              </td>
            </tr>
            <!-- Expanded Detail Row -->
            <tr v-if="expandedProductId === product._id">
              <td colspan="6" style="padding: 10px 0;">
                <div class="exapand-product">
                  <div>detail: <span style="margin-left: 10px;">{{ product.description || '-' }}</span></div>
                  <div>category: <span style="margin-left: 10px;">{{ getCategoryName(product) }}</span></div>
                  <div style="align-self: flex-end; margin-top: 20px;">sold amount: {{ product.soldAmount || 0 }}</div>
                </div>
              </td>
            </tr>
          </template>
        </template>
      </tbody>
    </table>

    <ProductFormModal
      :isVisible="showCreateProduct"
      :isEditing="isEditing"
      :productToEdit="productToEdit"
      :shopId="shopId"
      @close="showCreateProduct = false"
      @refresh="handleRefresh"
    />

    <DeleteConfirmModal
      :isVisible="showDeleteConfirm"
      :itemCount="selectedProducts.length"
      itemName="product"
      @close="showDeleteConfirm = false"
      @confirm="confirmDelete"
    />
  </div>
</template>

<style scoped>
@import '../styles/product.css';
</style>
