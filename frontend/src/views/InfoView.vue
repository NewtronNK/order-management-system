<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue';
import router from '@/router';
import { useShopStore } from '@/stores/shop';
import { useAuthStore } from '@/stores/auth';
import { initialShopForm, initialErrors } from '../components/utils/forms';
import { validateShopForm, validateAddressForm } from '../components/utils/validators';

const authStore = useAuthStore();
const shopStore = useShopStore();
const currentShop = shopStore.currentShop;

const dialogVisible = ref(false);
const isEditing = ref(false);
const editingAddressId = ref('');
const checkDefault = ref(false);

// ### reduce duplicate | start
const defaultAddress = computed(() =>
  shopStore.currentShop?.addresses?.find((a: any) => a.isDefault) ?? null
);

const filteredAddresses = computed(() =>
  shopStore.currentShop?.addresses?.filter((a: any) => !a.isDefault) ?? []
);

const form = reactive(initialShopForm());
const errors = reactive(initialErrors());
// ### reduce duplicate | end

const cancel = () => {
    // console.log(checkDefault.value)
    errors.addressName = '';
    errors.province = '';
    errors.district = '';
    errors.postcode = '';
    errors.addressContact = '';
    resetForm();
    dialogVisible.value = false;
    isEditing.value = false;
}

const resetForm = () => {
    form.addressName = '';
    form.addressDetails = '';
    form.province = '';
    form.district = '';
    form.postcode = '';
    form.addressContact = '';
    checkDefault.value = false;
}
// ### reduce duplicate (validate) | start
const validateShop = () => validateShopForm(form, errors);

const validate = () => validateAddressForm(form, errors);
// ### reduce duplicate (validate) | end
// ### maybe reduce between confirm and save function? | start
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
            addresses: currentShop.addresses,
        };

        if (checkDefault.value && currentShop.addresses.length > 1) {
            payload.addresses = payload.addresses.map((addr: any) =>
                String(addr._id) === String(defaultAddress.value._id)
                    ? {
                        ...addr,
                        isDefault: false
                    }
                    : addr
            );
        }

        if (isEditing.value) {
            // จุดนี้ต้องถามเพิ่มเติม
            payload.addresses = payload.addresses.map((addr: any) =>
                String(addr._id) === String(editingAddressId.value)
                    ? {
                        ...addr,
                        name: form.addressName,
                        detail: form.addressDetails,
                        province: form.province,
                        district: form.district.split(',')[0],
                        subdistrict: form.district.split(',')[1]?.trim(),
                        postcode: form.postcode,
                        contact: form.addressContact,
                        isDefault: checkDefault.value
                    }
                    : addr
            );
        } else {
            payload.addresses.push({
                name: form.addressName,
                detail: form.addressDetails,
                province: form.province,
                district: form.district.split(',')[0],
                subdistrict: form.district.split(',')[1]?.trim(),
                postcode: form.postcode,
                contact: form.addressContact,
                isDefault: checkDefault.value 
            });
        }

        await shopStore.updateShop(payload);

        if (isEditing) {
            window.location.reload();
        }

        dialogVisible.value = false;
        resetForm();
        isEditing.value = false;

    } catch (error: any) {
        console.error('Failed to add address:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to update address.';
        
        if (Array.isArray(errorMessage)) {
        alert(`Validation errors:\n${errorMessage.join('\n')}`);
        } else {
        alert(`Error: ${errorMessage}`);
        }
  }

}

const handleEdit = async (address: any) => {
    isEditing.value = true;
    form.addressName = address.name || '';
    form.addressDetails = address.detail || '';
    form.province = address.province || '';
    form.district = `${address.district}, ${address.subdistrict}` || '';
    form.postcode = address.postcode || '';
    form.addressContact = address.contact || '';
    checkDefault.value = address.isDefault || false;
    editingAddressId.value = address._id;
    // console.log(editingAddressId);
    dialogVisible.value = true;

}

const save = async () => {
    try {
        if (!validateShop()) return;
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
        window.location.reload();

    } catch (error: any) {
        console.error('Failed to update:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to update.';
        
        if (Array.isArray(errorMessage)) {
        alert(`Validation errors:\n${errorMessage.join('\n')}`);
        } else {
        alert(`Error: ${errorMessage}`);
        }
    }

}
// ### maybe reduce between confirm and save function? | end

onMounted(async () => {
  await authStore.checkAuth();
  if (!authStore.isAuthenticated) {
    router.push('/login');
  } else {
    // console.log(currentShop.addresses)
    Object.assign(form, {
    name: currentShop.name,       
    description: currentShop.description,
    email: currentShop.email,
    contact: currentShop.contact,
    businessType: currentShop.businessType 
  });
  }
});
</script>

<template>
    <div class="step-content">
      <div class="form-layout">
        <div class="right-col">
            <h3>Shop informations</h3>
            
            <div class="form-group">
                <label><span class="required">*</span> shop name</label>
                <input type="text" v-model="form.name"
                placeholder="Your Shop Name" />
                <span class="error-msg" v-if="errors.shopName">{{ errors.shopName }}</span>
            </div>
          
            <div class="form-group">
                <label><span class="required">*</span> shop description</label>
                <input type="text" v-model="form.description" placeholder="Your Shop Description" />
            </div>
          
            <h3>Contact informations</h3>
            <div class="row">
                <div class="form-group half">
                    <label><span class="required">*</span> email</label>
                    <input type="email" v-model="form.email"
                    placeholder="oms@example.com"/>
                    <span class="error-msg" v-if="errors.email">{{ errors.email }}</span>
                </div>
                <div class="form-group half">
                    <label><span class="required">*</span> contact</label>
                    <input type="text" v-model="form.contact" placeholder="ex. 0812345679" />
                </div>
            </div>
          
            <div class="form-group">
                <label><span class="required">*</span> bussiness type</label>
                <select v-model="form.businessType">
                    <option value="" disabled>Select Type</option>
                    <option value="retail">Retail</option>
                    <option value="foodAndBeverage">Food & Beverage</option>
                    <option value="specialty">Specialty</option>
                    <option value="service">Service</option>
                </select>
            </div>
            <h3>Shop address <button class="edit-btn" @click="dialogVisible = true">add address</button>
            </h3>
            <!-- default address -->
            <div class="row" v-if="defaultAddress">
                <div class="form-group close">
                    <label>{{ defaultAddress.name }} | {{ defaultAddress.contact }}
                        <button class="edit-btn" @click="handleEdit(defaultAddress)">edit</button></label>
                    <label>{{ defaultAddress.detail }}, {{ defaultAddress.subdistrict }},
                        {{ defaultAddress.district }}, {{ defaultAddress.province }},
                        {{ defaultAddress.postcode }} # default
                    </label>
                </div>
            </div>

            <!-- other addresses -->
            <div
            v-for="(shop, index) in filteredAddresses"
            :key="index"
            >
                <div class="form-group close">
                    <label>{{ shop.name }} | {{ shop.contact }}
                        <!-- @click="handleEditAddress(shop) -->
                        <button class="edit-btn" @click="handleEdit(shop)">edit</button></label>
                    <label>{{ shop.detail }}, {{ shop.subdistrict }},
                        {{ shop.district }}, {{ shop.province }},
                        {{ shop.postcode }}
                    </label>
                </div>
            </div>

            <div class="row" v-if="!defaultAddress && filteredAddresses.length === 0">
                <div class="form-group">
                    <label>have no address</label>
                </div>
            </div>
            <div class="info-actions">
                <button class="btn" @click="save">save</button>
            </div>
        </div>
      </div>
    </div>

    <!-- create and edit address -->
    <div v-if="dialogVisible" class="step-content modal-overlay">
        <div class="form-layout center-layout modal-content">
            <div class="right-col">
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

            <div class="confirm-container">
                <button class="btn cancel-btn" @click="cancel">cancel</button>
                <div class="check-box"><input type="checkbox" v-model="checkDefault"/> set as default address</div>
                <button class="btn confirm-btn" @click="confirm">confirm</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
@import "../styles/info.css";
@import "../styles/shop.css";
</style>