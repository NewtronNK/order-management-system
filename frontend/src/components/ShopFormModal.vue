<script setup lang="ts">
import { reactive, watch } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useShopStore } from '../stores/shop';
import { initialShopForm, initialErrors } from './utils/forms';
import { validateShopForm } from './utils/validators';

const props = defineProps<{
  isVisible: boolean;
  shopToEdit?: any;
}>();

const emit = defineEmits(['close', 'refresh']);

const authStore = useAuthStore();
const shopStore = useShopStore();

const form = reactive(initialShopForm());
const errors = reactive(initialErrors());

watch(() => props.isVisible, (newVal) => {
  if (newVal && props.shopToEdit) {
    Object.assign(form, {
      name: props.shopToEdit.name,       
      description: props.shopToEdit.description,
      email: props.shopToEdit.email,
      contact: props.shopToEdit.contact,
      businessType: props.shopToEdit.businessType 
    });
  } else {
    Object.assign(form, initialShopForm());
    Object.assign(errors, initialErrors());
  }
});

const validate = () => {
  return validateShopForm(form, errors);
};

const cancel = () => {
  Object.assign(errors, initialErrors());
  emit('close');
};

const confirm = async () => {
  try {
    if (!validate()) return;

    const ownerId = authStore.user?.userId || authStore.user?._id;
    if (!ownerId) {
      alert('User not authenticated');
      return;
    }

    const payload: any = {
      ownerId: ownerId,
      name: form.name,
      description: form.description,
      email: form.email,
      contact: form.contact,
      businessType: form.businessType,
    };

    await shopStore.updateShop(payload);
    emit('refresh');
    emit('close');
  } catch (error: any) {
    console.error('Failed to update shop:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update shop.';
    
    if (Array.isArray(errorMessage)) {
      alert(`Validation errors:\n${errorMessage.join('\n')}`);
    } else {
      alert(`Error: ${errorMessage}`);
    }
  }
};
</script>

<template>
  <div v-if="isVisible" class="form-overlay step-content">
    <div class="form-layout">
      <div class="right-col">
        <h3>Informations</h3>
        
        <div class="form-group">
          <label>Shop Name <span class="required">*</span></label>
          <input type="text" v-model="form.name" :class="{ 'input-error': errors.shopName }" 
          placeholder="Your Shop Name" />
          <span class="error-msg" v-if="errors.shopName">{{ errors.shopName }}</span>
        </div>
        
        <div class="form-group">
          <label>shop Desc</label>
          <input type="text" v-model="form.description" placeholder="Your Shop Description" />
        </div>
        
        <h3>contact informations</h3>
        <div class="row">
          <div class="form-group half">
            <label>email <span class="required">*</span></label>
            <input type="email" v-model="form.email" :class="{ 'input-error': errors.email }" 
            placeholder="oms@example.com"/>
            <span class="error-msg" v-if="errors.email">{{ errors.email }}</span>
          </div>
          <div class="form-group half">
            <label>contact</label>
            <input type="text" v-model="form.contact" placeholder="ex. 0812345679" />
          </div>
        </div>
        
        <div class="form-group">
          <label>Bussiness type</label>
          <select v-model="form.businessType">
            <option value="" disabled>Select Type</option>
            <option value="retail">Retail</option>
            <option value="foodAndBeverage">Food & Beverage</option>
            <option value="specialty">Specialty</option>
            <option value="service">Service</option>
          </select>
        </div>
        <div class="actions step-1-actions">
          <button class="btn" @click="cancel">cancel</button>
          <button class="btn" @click="confirm">confirm</button>
        </div>
      </div> 
    </div>
  </div>
</template>

<style scoped>
@import "../styles/utils.css";
</style>
