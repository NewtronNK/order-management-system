<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useShopStore } from '../stores/shop';
import { initialShopForm, initialErrors } from '../components/utils/forms';
import { validateShopForm, validateAddressForm } from '../components/utils/validators';

const router = useRouter();
const authStore = useAuthStore();
const shopStore = useShopStore();

const step = ref(1);
const form = reactive(initialShopForm());
const errors = reactive(initialErrors());

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    await authStore.checkAuth();
  }
});

const validateStep1 = () => validateShopForm(form, errors);

const validateStep2 = () => {
  if (form.skipAddress) return true;
  return validateAddressForm(form, errors);
};

const nextStep = () => {
  if (validateStep1()) {
    step.value = 2;
  }
};

const prevStep = () => {
  step.value = 1;
};

const cancel = () => {
  router.push('/home');
};

const confirm = async () => {
  if (!validateStep2()) return;

  try {
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

    if (!form.skipAddress) {
      payload.addresses = [{
        name: form.addressName,
        detail: form.addressDetails,
        province: form.province,
        district: form.district.split(',')[0],
        subdistrict: form.district.split(',')[1]?.trim(),
        postcode: form.postcode,
        contact: form.addressContact,
        isDefault: true
      }];
    }

    console.log('Saving shop details', payload);
    await shopStore.createShop(payload);
    
    alert('Shop created successfully!');
    router.push('/home');
  } catch (error: any) {
    console.error('Failed to create shop:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to create shop.';
    
    if (Array.isArray(errorMessage)) {
      alert(`Validation errors:\n${errorMessage.join('\n')}`);
    } else {
      alert(`Error: ${errorMessage}`);
    }
  }
};
</script>

<template>
  <div class="shop-page">
    <div class="header">
      <div class="sub-header">
        <h2>create your own Shop</h2>
        <span class="step-indicator">step {{ step }} of 2</span>
      </div>
    </div>

    <!-- Step 1 -->
    <div v-if="step === 1" class="step-content">
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
        </div>
      </div>

      <div class="actions step-1-actions">
        <button class="btn" @click="cancel">cancel</button>
        <button class="btn" @click="nextStep">Next ></button>
      </div>
    </div>

    <!-- Step 2 -->
    <div v-if="step === 2" class="step-content">
      <div class="checkbox-container">
        <label class="skip-label">
          <input type="checkbox" v-model="form.skipAddress" />
          skip to add an address for now
        </label>
      </div>

      <div v-if="!form.skipAddress" class="form-layout center-layout">
        <div class="form-group full-width">
          <label>address name <span class="required">*</span></label>
          <input type="text" v-model="form.addressName" :class="{ 'input-error': errors.addressName }" 
          placeholder="Your place name" />
          <span class="error-msg" v-if="errors.addressName">{{ errors.addressName }}</span>
        </div>
        
        <div class="row full-width">
          <div class="form-group half">
            <label>province <span class="required">*</span></label>
            <input type="text" v-model="form.province" :class="{ 'input-error': errors.province }" 
            placeholder="ex. Chiang Mai" />
            <span class="error-msg" v-if="errors.province">{{ errors.province }}</span>
          </div>
          <div class="form-group half">
            <label>district, subdistrict <span class="required">*</span></label>
            <input type="text" v-model="form.district" :class="{ 'input-error': errors.district }" 
            placeholder="ex. Mueang Chiang Mai, Suthep" />
            <span class="error-msg" v-if="errors.district">{{ errors.district }}</span>
          </div>
        </div>
        
        <div class="row full-width">
          <div class="form-group half">
            <label>postcode <span class="required">*</span></label>
            <input type="text" v-model="form.postcode" :class="{ 'input-error': errors.postcode }" 
            placeholder="ex. 50200" />
            <span class="error-msg" v-if="errors.postcode">{{ errors.postcode }}</span>
          </div>
          <div class="form-group half">
            <label>contact <span class="required">*</span></label>
            <input type="text" v-model="form.addressContact" :class="{ 'input-error': errors.addressContact }" 
            placeholder="ex. 0812345679"/>
            <span class="error-msg" v-if="errors.addressContact">{{ errors.addressContact }}</span>
          </div>
        </div>
        
        <div class="form-group full-width">
          <label>address details</label>
          <textarea v-model="form.addressDetails" rows="4"
          placeholder="ex. House number, Village, Building, Road, Alley"></textarea>
        </div>
      </div>

      <div class="actions step-2-actions">
        <button class="btn" @click="prevStep">< BACK</button>
        <button class="btn" @click="confirm">confirm ></button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "../styles/shop.css";
</style>
