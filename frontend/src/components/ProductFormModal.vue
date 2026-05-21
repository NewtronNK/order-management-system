<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useProductStore } from '../stores/product';
import { useCategoryStore } from '../stores/category';
import { initialProductForm, initialErrors } from './utils/forms';
import { validateProductForm } from './utils/validators';
import { watch } from 'vue';

const props = defineProps<{
  shopId: string;
  isVisible: boolean;
  isEditing: boolean;
  productToEdit?: any;
}>();

const emit = defineEmits(['close', 'refresh']);

const productStore = useProductStore();
const categoryStore = useCategoryStore();

const form = reactive(initialProductForm());
const errors = reactive(initialErrors());
const editingProductId = ref('');
const editingOriginalCode = ref('');

const newCategoryName = ref('');
const isAddingCategory = ref(false);

const filteredCategories = computed(() => {
  return categoryStore.categories.filter((cat: any) => cat.shopId === props.shopId);
});

watch(() => props.isVisible, (newVal) => {
  if (newVal) {
    if (props.isEditing && props.productToEdit) {
      const product = props.productToEdit;
      form.productName = product.name || product.productName || '';
      form.productCode = product.productCode || product.code || '';
      form.productDesc = product.description || '';
      form.stock = product.stock || 0;
      let cat = product.category;
      form.category = typeof cat === 'object' && cat !== null ? cat._id || cat : (cat || '');
      form.price = product.price || 0;
      
      editingProductId.value = product._id;
      editingOriginalCode.value = form.productCode;
    } else {
      // Reset form
      Object.assign(form, initialProductForm());
      Object.assign(errors, initialErrors());
      editingProductId.value = '';
      editingOriginalCode.value = '';
    }
  }
});

const onCategoryChange = (event: any) => {
  if (event.target.value === 'NEW') {
    isAddingCategory.value = true;
    form.category = '';
  } else {
    isAddingCategory.value = false;
  }
};

const handleAddCategory = async () => {
  if (!newCategoryName.value) {
    isAddingCategory.value = false;
    return;
  }
  try {
    const ownerId = props.shopId; // Assumes shopId is used as ownerId for categories based on previous logic
    const newCat = await categoryStore.createCategory(ownerId, newCategoryName.value);
    form.category = newCat._id;
    newCategoryName.value = '';
    isAddingCategory.value = false;
  } catch (err: any) {
    alert(err.response?.data?.message || 'Failed to add category');
  }
};

const cancel = () => {
  Object.assign(errors, initialErrors());
  emit('close');
};

const handleConfirm = async () => {
  try {
    if (!validateProductForm(form, errors)) return;
    
    if (!props.isEditing || form.productCode !== editingOriginalCode.value) {
      const checkPCode = await productStore.checkCode(form.productCode, props.shopId);
      if (checkPCode) {
        alert('This code already exists in the shop');
        return;
      }
    }

    const payload: any = {
      shopId: props.shopId,
      name: form.productName,
      productCode: form.productCode,
      description: form.productDesc,
      stock: form.stock,
      price: form.price
    };
    if (form.category) {
      payload.category = form.category;
    }

    if (props.isEditing) {
      await productStore.updateProduct(editingProductId.value, payload);
    } else {
      await productStore.createProduct(payload);
    }
    
    emit('refresh');
    emit('close');
  } catch (err: any) {
    alert(err.response?.data?.message || (props.isEditing ? 'Failed to update product' : 'Failed to create product'));
  }
};
</script>

<template>
  <div v-if="isVisible" class="modal-overlay">
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
</template>

<style scoped>
@import '../styles/product.css';
</style>
