<script setup lang="ts">
import { useProductStore } from '@/stores/product';
import { useShopStore } from '../stores/shop'
import { computed, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';

const shopStore = useShopStore()
const productStore = useProductStore();
const route = useRoute();
const shopId = route.params.id as string;
const dialogVisible = ref(false);

const form = reactive({
  items: '',
  senderAddress: '',
  // for select option (sender) ไว้ใช้ find ทีหลัง
  sAddId: '',
  customerAddress: '',
  paymentMethod: '',
  delivery: '',
  orderDate: ''
});

const senderAddressForm = reactive({
  shopName: '',
  detail: '',
  province: '',
  district: '',
  subdistrict: '',
  postcode: '',
  contact: ''
});

const customerAddressForm = reactive({
  customerName: '',
  detail: '',
  province: '',
  district: '',
  subdistrict: '',
  postcode: '',
  contact: ''
});

const errors = reactive({
  name: '',
  email: '',
  addressName: '',
  province: '',
  district: '',
  postcode: '',
  addressContact: ''
});

const filteredAddress = computed(() => {
  return shopStore.currentShop.addresses;
});

const onAddressChange = (event: any) => {
  if (event.target.value) {
    dialogVisible.value = false
  }
};

const handleEditSAdd = () => {
  form.sAddId = '';
  dialogVisible.value = true;
}

</script>

<template>
    <!-- create order -->
    <div class="sender-info">
      <h1>Create Order</h1>
      <div class="form-group half"">
        <div class="right-col">
          <div class="form-group half">
            <!-- header -->
            <h2>Sender information</h2>
            <label>sender address</label>
            <label v-if="!dialogVisible" class="sender-address" @click="handleEditSAdd">edit address</label>
              <div class="select-card">
                <select v-model="form.sAddId" @change="onAddressChange">
                  <option value="" disabled>Select Address</option>
                  <option v-for="sAdd in filteredAddress" :key="sAdd._id" :value="sAdd._id">
                      {{ sAdd.shopName }}, {{ sAdd.detail }}, {{ sAdd.subdistrict }},
                          {{ sAdd.district }}, {{ sAdd.province }},
                          {{ sAdd.postcode }}
                  </option>
                </select>
              </div>
              <!-- when clicked edit  -->
            <div v-if="dialogVisible" class="form-group half" style="margin-top: 10px;">
              <div class="right-col">
                <div class="form-layout center-layout">
                  <div class="form-group2 full-width">
                    <label>address name <span class="required">*</span></label>
                    <input type="text" v-model="senderAddressForm.shopName" :class="{ 'input-error': errors.addressName }" 
                      placeholder="Your place name" />
                    <span class="error-msg" v-if="errors.addressName">{{ errors.addressName }}</span>
                  </div>
                            
                  <div class="row full-width">
                    <div class="form-group2 half">
                      <label>province <span class="required">*</span></label>
                       <input type="text" v-model="senderAddressForm.province" :class="{ 'input-error': errors.province }" 
                      placeholder="ex. Chiang Mai" />
                      <span class="error-msg" v-if="errors.province">{{ errors.province }}</span>
                    </div>
                    <div class="form-group2 half">
                        <label>district, subdistrict <span class="required">*</span></label>
                        <input type="text" v-model="senderAddressForm.district" :class="{ 'input-error': errors.district }" 
                        placeholder="ex. Mueang Chiang Mai, Suthep" />
                        <span class="error-msg" v-if="errors.district">{{ errors.district }}</span>
                    </div>
                  </div>
                          
                  <div class="row full-width">
                    <div class="form-group2 half">
                      <label>postcode <span class="required">*</span></label>
                      <input type="text" v-model="senderAddressForm.postcode" :class="{ 'input-error': errors.postcode }" 
                      placeholder="ex. 50200" />
                      <span class="error-msg" v-if="errors.postcode">{{ errors.postcode }}</span>
                    </div>
                    <div class="form-group2 half">
                      <label>contact <span class="required">*</span></label>
                      <input type="text" v-model="senderAddressForm.contact" :class="{ 'input-error': errors.addressContact }" 
                      placeholder="ex. 0812345679"/>
                      <span class="error-msg" v-if="errors.addressContact">{{ errors.addressContact }}</span>
                    </div>
                  </div>
                  <div class="form-group2 full-width">
                    <label>address details</label>
                    <textarea v-model="senderAddressForm.detail" rows="4"
                    placeholder="ex. House number, Village, Building, Road, Alley"></textarea>
                  </div>
                  <div class="confirm-container">
                     <button class="btn hide-btn" @click="dialogVisible=false">hide</button>
                  </div>
                </div>
              </div>   
            </div>
          </div>
        </div>
        
        <!-- sender's address form -->
        <div class="form-group2 full-width">
          <div class="right-col">
            <div class="form-layout center-layout">
              <h2>Reciever information</h2>
              <div class="row full-width">
                <div class="form-group2 half">
                  <label>customer name <span class="required">*</span></label>
                  <input type="text" v-model="senderAddressForm.shopName" :class="{ 'input-error': errors.addressName }" 
                    placeholder="Your place name" />
                  <span class="error-msg" v-if="errors.addressName">{{ errors.addressName }}</span>
                </div>
                <div class="form-group2 half">
                  <label>contact <span class="required">*</span></label>
                  <input type="text" v-model="senderAddressForm.contact" :class="{ 'input-error': errors.addressContact }" 
                  placeholder="ex. 0812345679"/>
                  <span class="error-msg" v-if="errors.addressContact">{{ errors.addressContact }}</span>
                </div>
              </div>

              <div class="form-group2 full-width">
                <label>address details</label>
                <textarea v-model="senderAddressForm.detail" rows="4"
                placeholder="ex. House number, Village, Building, Road, Alley"></textarea>
              </div>
                      
              <div class="row full-width">
                <div class="form-group2 half">
                  <label>province <span class="required">*</span></label>
                  <input type="text" v-model="senderAddressForm.province" :class="{ 'input-error': errors.province }" 
                  placeholder="ex. Chiang Mai" />
                  <span class="error-msg" v-if="errors.province">{{ errors.province }}</span>
                </div>
                <div class="form-group2 half">
                    <label>district, subdistrict <span class="required">*</span></label>
                    <input type="text" v-model="senderAddressForm.district" :class="{ 'input-error': errors.district }" 
                    placeholder="ex. Mueang Chiang Mai, Suthep" />
                    <span class="error-msg" v-if="errors.district">{{ errors.district }}</span>
                </div>
              </div>
                      
              <div class="row full-width">
                <div class="form-group2 half">
                  <label>postcode <span class="required">*</span></label>
                  <input type="text" v-model="senderAddressForm.postcode" :class="{ 'input-error': errors.postcode }" 
                  placeholder="ex. 50200" />
                  <span class="error-msg" v-if="errors.postcode">{{ errors.postcode }}</span>
                </div>
                <div class="form-group2 half">
                  <label>delivery <span class="required">*</span></label>
                  <div style="margin-top: -1px;">
                    <select v-model="form.delivery">
                      <option value="" disabled>Channel of distribution</option>
                      <option>Thailand Post</option>
                      <option>Flash</option>
                      <option>J&T</option>     
                      <option>SPX Express</option>    
                      <option>KEX</option>       
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>   
        </div>
        <div class="form-group2 full-width">
          <h2>Payment Method</h2>
          <select v-model="form.paymentMethod">
            <option value="" disabled>Select Payment Method</option>
            <option>QR Payment</option>   
            <option>cash on delivery</option>    
            <option>bank transfer</option>       
          </select>
        </div>
        <!-- ถ้าอยากให้อยู่ตรงกลางแบบด้านบน -->
      </div>
      
      
      
      <!-- confirm create order -->
      <div class="row">
        <div class="confirm-container">
                
        </div>
      </div>
      <div>
        <h2>Product List</h2>
      </div>
    </div>
  
</template>

<style scoped>
@import "../styles/createOrder.css";
</style>