<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useAuthStore } from '../stores/auth'
import { useShopStore } from '../stores/shop'
import router from '../router';

const authStore = useAuthStore();
const shopStore = useShopStore();

const isEditing = ref(false);
const isHovering = ref(false);
const dialogVisible = ref(false);

const form = reactive({
  shopName: '',
  shopDesc: '',
  email: '',
  contact: '',
  businessType: '',
  addressName: '',
  province: '',
  district: '',
  postcode: '',
  addressContact: '',
  addressDetails: '',
  skipAddress: false
});

const errors = reactive({
  shopName: '',
  email: '',
  addressName: '',
  province: '',
  district: '',
  postcode: '',
  addressContact: ''
});

const toggleEdit = () => {
  isEditing.value = !isEditing.value;
};

const confirmEdit = () => {
  isEditing.value = false;
  dialogVisible.value = false;
};

const addShop = () => {
  router.push('/shop/');
};

const manageShop = (shopId: string) => {
  router.push({
    name: 'shop-order',
    params: { id: shopId }
  })
}

const validate = () => {
  let isValid = true;
  errors.shopName = '';
  errors.email = '';

  if (!form.shopName.trim()) {
    errors.shopName = 'Shop Name is required';
    isValid = false;
  }
  
  if (!form.email.trim()) {
    errors.email = 'Email is required';
    isValid = false;
  } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.email)) {
    errors.email = 'Please enter a valid email address';
    isValid = false;
  }

  return isValid;
};

const handleEditShop = (shop: any) => {
  shopStore.setcurrentShop(shop._id)
  Object.assign(form, {
    shopName: shop.name,       
    shopDesc: shop.description,
    email: shop.email,
    contact: shop.contact,
    businessType: shop.businessType 
  });
  dialogVisible.value  = true
}

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
      name: form.shopName,
      description: form.shopDesc,
      email: form.email,
      contact: form.contact,
      businessType: form.businessType,
    };

    console.log('Saving shop details', payload);
    await shopStore.updateShop(payload);
    dialogVisible.value = false;
    await shopStore.fetchMyShops();

    } catch (error: any) {
    console.error('Failed to create shop:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to create shop.';
    
    if (Array.isArray(errorMessage)) {
      alert(`Validation errors:\n${errorMessage.join('\n')}`);
    } else {
      alert(`Error: ${errorMessage}`);
    }
  }
}

onMounted(async () => {
  await authStore.checkAuth();
  if (!authStore.isAuthenticated) {
    router.push('/login');
  } else {
    await shopStore.fetchMyShops();
  }
});
</script>

<template>
  
  <div class="home">
    <div class="content-layout">
      <!-- Left side: Shop -->
      <div class="shop-section">
        <h2 class="section-title">Shop</h2>
        
        <div v-if="shopStore.loading" class="loading-msg">Loading shops...</div>
        
        <div class="shops-container" v-else>
          <div v-if="shopStore.shops.length === 0" class="no-shops">
            No shops found.
          </div>
          
          <div
            v-if="!isEditing"
            v-for="shop in shopStore.shops" 
            :key="shop._id" 
            class="shop-box" @click="manageShop(shop._id)"
          >
            <span class="shop-name">{{ shop.name }}</span>
          </div>

          <div
            v-if="isEditing"
            v-for="shop in shopStore.shops" 
            :key="shop._id" 
            class="shop-box" @mouseenter="isHovering = true" @mouseleave="isHovering = false"
          >
            <span v-if="!isHovering" class="shop-name">{{ shop.name }}</span>
            <button v-if="isHovering" @click="handleEditShop(shop)">edit informations</button>
        </div>
        
        </div>
      </div>
      
      <div class="profile-section">
        <div class="controls">
          <template v-if="!isEditing">
            <button class="action-btn" @click="toggleEdit">Edit Shop</button>
          </template>
          <template v-else>
            <button class="action-btn" @click="confirmEdit">Confirm Edit</button>
            <button class="action-btn" @click="addShop">Add Shop</button>
          </template>
        </div>
      </div>
    </div>
  </div>

  <div class="shop-page">
    <div v-if="dialogVisible" class="form-overlay step-content">
      <div class="form-layout">
        <div class="right-col">
          <h3>Informations</h3>
          
          <div class="form-group">
            <label>Shop Name <span class="required">*</span></label>
            <input type="text" v-model="form.shopName" :class="{ 'input-error': errors.shopName }" 
            placeholder="Your Shop Name" />
            <span class="error-msg" v-if="errors.shopName">{{ errors.shopName }}</span>
          </div>
          
          <div class="form-group">
            <label>shop Desc</label>
            <input type="text" v-model="form.shopDesc" placeholder="Your Shop Description" />
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
            <button class="btn" @click="dialogVisible = false">cancel</button>
            <button class="btn" @click="confirm">confirm</button>
          </div>
        </div> 
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "../styles/utils.css";
</style>
