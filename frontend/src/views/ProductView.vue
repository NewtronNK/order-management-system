<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useProductStore } from '../stores/product';
import { useCategoryStore } from '../stores/category';
import { useShopStore } from '@/stores/shop';

const showCreateProduct = ref(false);
const isEditing = ref(false);
const editingProductId = ref('');
const editingOriginalCode = ref('');
const productStore = useProductStore();
const categoryStore = useCategoryStore();
const shopStore = useShopStore();
const route = useRoute();
const shopId = route.params.id as string;

const selectedProducts = ref<string[]>([]);
const showDeleteConfirm = ref(false);
const expandedProductId = ref<string | null>(null);

const getCategoryName = (product: any) => {
  let cat = product.category;
  let catId = typeof cat === 'object' && cat !== null ? cat._id || cat : cat;
  if (!catId) return '-';
  const found = categoryStore.categories.find((c: any) => c._id === catId);
  return found ? found.name : catId;
};

const isAllSelected = computed({
  get: () => {
    const products = productStore.products;
    return products.length > 0 && selectedProducts.value.length === products.length;
  },
  set: (val) => {
    if (val) {
      selectedProducts.value = productStore.products.map((p: any) => p._id);
    } else {
      selectedProducts.value = [];
    }
  }
});

const newCategoryName = ref('');
const isAddingCategory = ref(false);
const message = ref('');

const filteredCategories = computed(() => {
  return categoryStore.categories.filter((cat: any) => cat.shopId === shopId);
});

const form = reactive({
  productName: '',
  productCode: '',
  productDesc: '',
  stock: 0,
  category: '',
  price: 0
});

const errors = reactive({
  productName: '',
  productCode: '',
  stock: '',
  price: ''
});

const validateProduct = () => {
  let isValid = true;
  errors.productName = '';
  errors.productCode = '';
  errors.stock = '';
  errors.price = '';

  if (!form.productName.trim()) {
    errors.productName = 'Product Name is required';
    isValid = false;
  }
  if (!form.productCode.trim()) {
    errors.productCode = 'Product Code is required';
    isValid = false;
  }
  if (form.stock < 0) {
    errors.stock = 'Stock must not less than zero';
    isValid = false;
  }
  if (form.price < 0) {
    errors.price = 'Price must not less than zero';
    isValid = false;
  }

  return isValid;
};

onMounted(async () => {
  await categoryStore.fetchCategories();
  if (shopId) {
    await productStore.fetchProductsByShop(shopId);
  }
});

const cancel = () => {
  errors.productName = '';
  errors.productCode = '';
  errors.stock = '';
  errors.price = '';
  showCreateProduct.value = false;
}

const resetForm = () => {
  form.productName = '';
  form.productCode = '';
  form.productDesc = '';
  form.stock = 0;
  form.category = '';
  form.price = 0;
  isEditing.value = false;
  editingProductId.value = '';
  editingOriginalCode.value = '';
};

const openCreateProduct = () => {
  resetForm();
  showCreateProduct.value = true;
};

const openEditProduct = (product: any) => {
  form.productName = product.name || product.productName || '';
  form.productCode = product.productCode || product.code || '';
  form.productDesc = product.description || '';
  form.stock = product.stock || 0;
  
  // fetch old category data กันตอนส่ง update
  let cat = product.category;
  form.category = typeof cat === 'object' && cat !== null ? cat._id || cat : (cat || '');
  
  form.price = product.price || 0;
  
  isEditing.value = true;
  editingProductId.value = product._id;
  editingOriginalCode.value = form.productCode;
  
  showCreateProduct.value = true;
};

const handleConfirm = async () => {
  try {
    if (!validateProduct()) return;
    if (!isEditing.value || form.productCode !== editingOriginalCode.value) {
      const checkPCode = await productStore.checkCode(form.productCode, shopId);
      if (checkPCode) {
        alert('this code is already exist in the shop');
        return;
      }
    }

    const payload: any = {
      shopId,
      name: form.productName,
      productCode: form.productCode,
      description: form.productDesc,
      stock: form.stock,
      price: form.price
    };
    if (form.category) {
      payload.category = form.category;
    }

    if (isEditing.value) {
      await productStore.updateProduct(editingProductId.value, payload);
    } else {
      await productStore.createProduct(payload);
    }
    
    showCreateProduct.value = false;
    await productStore.fetchProductsByShop(shopId);
    resetForm();
  } catch (err: any) {
    alert(err.response?.data?.message || (isEditing.value ? 'Failed to update product' : 'Failed to create product'));
  }
};

const handleAddCategory = async () => {
  if (!newCategoryName.value) {
    isAddingCategory.value = false;
    return;
  }
  try {
    const ownerId = shopStore.currentShop._id;
    if (!ownerId) {
      alert('Shop not authenticated');
      return;
    }
    const newCat = await categoryStore.createCategory(ownerId, newCategoryName.value);
    form.category = newCat._id;
    newCategoryName.value = '';
    isAddingCategory.value = false;
  } catch (err: any) {
    alert(err.response?.data?.message || 'Failed to add category');
  }
};

const handleSearch = async (shopId: string, text: string) => {
  await productStore.searchProducts(shopId, text);
}

const onCategoryChange = (event: any) => {
  if (event.target.value === 'NEW') {
    isAddingCategory.value = true;
    form.category = '';
  } else {
    isAddingCategory.value = false;
  }
};

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
        <button class="create-btn" @click="openCreateProduct">create Product</button>
      </div>
    </div>

    <div class="filters">
      <input type="text" placeholder="search product" class="search-input" v-model="message" />
      <select class="filter-dropdown">
        <option value="">filter</option>
        <option v-for="cat in filteredCategories" :key="cat._id" :value="cat._id">
          {{ cat.name }}
        </option>
      </select>
      <select class="filter-dropdown">
        <option value="">sold amount</option>
        <option> most </option>
        <option> least </option>
      </select>
      <button class="search-btn" @click="handleSearch(shopId, message)">search</button>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th><input type="checkbox" v-model="isAllSelected" /></th>
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

    <!-- Create Product Modal -->
    <div v-if="showCreateProduct" class="modal-overlay">
      <div class="modal-content">
        <div class="form-layout">
          <div class="right-col">
            <div class="form-group">
              <label>product name</label>
              <input type="text" v-model="form.productName" />
              <span class="error-msg" v-if="errors.productName">{{ errors.productName }}</span>
            </div>
            <div class="form-group">
              <label>product code</label>
              <input type="text" v-model="form.productCode" />
              <span class="error-msg" v-if="errors.productCode">{{ errors.productCode }}</span>
            </div>
            <div class="form-group">
              <label>description</label>
              <textarea v-model="form.productDesc" rows="4"></textarea>
            </div>
            <div class="row">
              <div class="form-group half">
                <label>stock</label>
                <input type="number" v-model="form.stock" />
                <span class="error-msg" v-if="errors.stock">{{ errors.stock }}</span>
              </div>
              <div class="form-group half">
                <label>price</label>
                <input type="number" v-model="form.price" />
                <span class="error-msg" v-if="errors.price">{{ errors.price }}</span>
              </div>
              <div class="form-group half">
                <label>category</label>
                <select v-model="form.category" @change="onCategoryChange">
                  <option value="" disabled>Select Category</option>
                  <option v-for="cat in filteredCategories" :key="cat._id" :value="cat._id">
                    {{ cat.name }}
                  </option>
                  <option value="NEW">+ Add Category</option>
                </select>
                <div v-if="isAddingCategory" class="new-cat-row" style="display: flex; gap: 5px; margin-top: 5px;">
                  <input type="text" v-model="newCategoryName" placeholder="Category Name" style="flex: 1;" />
                  <button @click="handleAddCategory" class="btn" style="border: 1px solid black; padding: 5px 10px;">Add</button>
                </div>
              </div>
              <div class="confirm-container">
                <button class="btn cancel-btn" @click="cancel">cancel</button>
                <button class="btn confirm-btn" @click="handleConfirm">{{ isEditing ? 'update' : 'confirm' }}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="modal-overlay">
      <div class="modal-content" style="max-width: 400px; padding: 20px;">
        <h3 style="margin-top: 0;">Confirm Delete</h3>
        <p>Are you sure you want to delete {{ selectedProducts.length }} selected product(s)?</p>
        <div class="confirm-container" style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px;">
          <button class="btn cancel-btn" @click="showDeleteConfirm = false">Cancel</button>
          <button class="btn confirm-btn" style="background-color: #dc3545; color: white; border-color: #dc3545;" @click="confirmDelete">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '../styles/product.css';
</style>
