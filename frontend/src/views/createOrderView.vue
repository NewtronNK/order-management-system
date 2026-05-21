<script setup lang="ts">
import { useShopStore } from '../stores/shop';
import { computed, reactive, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import router from '@/router';
import { useOrderStore } from '@/stores/order';
import type { SelectedItem, ProductList } from '../components/utils/types';
import { initialAddressForm, initialOrderForm, initialErrors } from '../components/utils/forms';
import { getDefaultAddress, getFilteredAddresses } from '../components/utils/address';
import ProductSelectionModal from '../components/ProductSelectionModal.vue';

const shopStore = useShopStore();
const orderStore = useOrderStore();
const route = useRoute();
const shopId = route.params.id as string;
const orderId = route.params.orderId as string | undefined;
const isEditMode = computed(() => !!orderId);
const dialogVisible = ref(false);
const productModalVisible = ref(false);
let orderPrice = 0;

const defaultAddress = computed(() => getDefaultAddress(shopStore));

const confirmedItems = ref<SelectedItem[]>([]);

const productList = ref<ProductList[]>([]);

const form = reactive(initialOrderForm(defaultAddress.value?._id));

const senderAddressForm = reactive(initialAddressForm());

const customerAddressForm = reactive(initialAddressForm());

const errors = reactive(initialErrors());

onMounted(async () => {
  if (isEditMode.value && orderId) {
    try {
        const order = await orderStore.fetchOrderById(orderId);
        if (order) {
            form.delivery = order.delivery || '';
            form.paymentMethod = order.paymentMethod || '';
            
            if (order.shopAddress) {
                Object.assign(senderAddressForm, order.shopAddress);
                const matchingAdd = filteredAddress.value.find((add: any) => add.name === order.shopAddress.name && add.contact === order.shopAddress.contact);
                if (matchingAdd) {
                    form.sAddId = matchingAdd._id;
                } else {
                    form.sAddId = '';
                    dialogVisible.value = true;
                }
            }

            if (order.customerAddress) {
                Object.assign(customerAddressForm, order.customerAddress);
            }

            if (order.orderItem) {
                confirmedItems.value = order.orderItem.map((item: any) => ({
                    _id: item.productId,
                    productCode: item.productCode,
                    name: item.name,
                    price: item.totalPrice / item.quantity,
                    qty: item.quantity
                }));
            }
        }
    } catch (err) {
        alert('Failed to load order data');
        orderView();
    }
  }
});

const orderView = () => {
  router.push({
    name: 'shop-order',
    params: { id: shopId }
  })
}
const handleConfirmProductModal = (items: SelectedItem[]) => {
  confirmedItems.value = items.map(i => ({ ...i }));
  productModalVisible.value = false;
};

const openProductModal = () => {
  productModalVisible.value = true;
};

const filteredAddress = computed(() => {
  return getFilteredAddresses(shopStore);
});

const totalSelectedQty = computed(() =>
  confirmedItems.value.reduce((sum, i) => sum + i.qty, 0)
);

const onAddressChange = (event: any) => {
  if (event.target.value) {
    dialogVisible.value = false
  }
};

const handleEditSAdd = () => {
  console.log(filteredAddress)
  form.sAddId = '';
  dialogVisible.value = true;
}

const handleHide = () => {
  form.sAddId = defaultAddress.value._id;
  dialogVisible.value = false;
}

const totalPrice = computed(() => {
  let total = 0;
  for (const item of confirmedItems.value) {
    total = total + (item.price * item.qty)
  }
  return total;
});

const confirmOrder = async () => {
  try {

    // validate the product in confirmedItems : must have an item in the list to create order
    if (confirmedItems.value.length === 0) {
      alert("You must add at least one product to the order.");
      return;
    }

    // validate both of sender and receiver form
    Object.keys(errors).forEach(key => errors[key as keyof typeof errors] = '');
    let hasError = false;

    // Validate Sender if no saved address is selected
    if (!form.sAddId) {
      if (!senderAddressForm.name) { errors.addressName = 'Name is required'; hasError = true; }
      if (!senderAddressForm.contact) { errors.addressContact = 'Contact is required'; hasError = true; }
      if (!senderAddressForm.province) { errors.province = 'Province is required'; hasError = true; }
      if (!senderAddressForm.district) { errors.district = 'District is required'; hasError = true; }
      if (!senderAddressForm.postcode) { errors.postcode = 'Postcode is required'; hasError = true; }
    }

    // Validate Customer Address
    if (!customerAddressForm.name) { errors.addressName = 'Customer name is required'; hasError = true; }
    if (!customerAddressForm.contact) { errors.addressContact = 'Contact is required'; hasError = true; }
    if (!customerAddressForm.province) { errors.province = 'Province is required'; hasError = true; }
    if (!customerAddressForm.district) { errors.district = 'District is required'; hasError = true; }
    if (!customerAddressForm.postcode) { errors.postcode = 'Postcode is required'; hasError = true; }
    
    if (!form.delivery) { alert("Please select a delivery channel."); hasError = true; }
    if (!form.paymentMethod) { alert("Please select a payment method."); hasError = true; }

    if (hasError) return;

    orderPrice = 0;
    productList.value = [];
    for (const item of confirmedItems.value) {
      // console.log(item.name)
      productList.value.push({
        _id: item._id,
        productId: item._id ?? '',
        productCode: item.productCode ?? '',
        name: item.name,
        quantity: item.qty,
        totalPrice: item.price * item.qty
      })
      orderPrice += item.price * item.qty;
    }

    const payload: any = {
        shopId,
        orderItem: productList.value,
        shopAddress: filteredAddress.value.find((add: any) => add._id === form.sAddId) || senderAddressForm,
        customerAddress: customerAddressForm,
        paymentMethod: form.paymentMethod,
        delivery: form.delivery,
        totalPrice: orderPrice
    };
    
    if (!isEditMode.value) {
        payload.orderDate = new Date();
    }
    
    if (isEditMode.value && orderId) {
        await orderStore.updateOrder(orderId, payload);
    } else {
        await orderStore.createOrder(payload);
    }
    
    orderView();
  } catch (err: any) {
    alert(err.response?.data?.message || ('Failed to save order'));
  }
}

</script>

<template>
    <!-- create/edit order -->
    <div class="sender-info">
      <h1>{{ isEditMode ? 'Edit Order' : 'Create Order' }}</h1>
      <div class="right-col">
          <div class="form-layout center-layout">
            <!-- header -->
            <h2>Sender information</h2>
            <div class="form-group2 full-width">
              <div style="display: flex; align-items: center; gap: 8px;">
                <label>sender address</label>
                <label v-if="!dialogVisible" class="sender-address" @click="handleEditSAdd">new address</label>
              </div>
              <div v-if="!dialogVisible" class="select-card">
                <select v-model="form.sAddId" @change="onAddressChange">
                  <option v-for="sAdd in filteredAddress" :key="sAdd._id" :value="sAdd._id">
                      {{ sAdd.name }}, {{ sAdd.detail }}, {{ sAdd.subdistrict }},
                          {{ sAdd.district }}, {{ sAdd.province }},
                          {{ sAdd.postcode }}
                  </option>
                </select>
              </div>
            </div>
            <!-- when clicked edit  -->
            <div v-if="dialogVisible" class="form-group2 full-width">
              <div class="form-group2 full-width">
                <label>address name <span class="required">*</span></label>
                <input type="text" v-model="senderAddressForm.name" :class="{ 'input-error': errors.addressName }" 
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
                <button class="btn hide-btn" @click="handleHide">hide</button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- customer's address form -->
        <div class="form-group2 full-width">
          <div class="right-col">
            <div class="form-layout center-layout">
              <h2>Reciever information</h2>
              <div class="row full-width">
                <div class="form-group2 half">
                  <label>customer name <span class="required">*</span></label>
                  <input type="text" v-model="customerAddressForm.name" :class="{ 'input-error': errors.addressName }" 
                    placeholder="customer name" />
                  <span class="error-msg" v-if="errors.addressName">{{ errors.addressName }}</span>
                </div>
                <div class="form-group2 half">
                  <label>contact <span class="required">*</span></label>
                  <input type="text" v-model="customerAddressForm.contact" :class="{ 'input-error': errors.addressContact }" 
                  placeholder="ex. 0812345679"/>
                  <span class="error-msg" v-if="errors.addressContact">{{ errors.addressContact }}</span>
                </div>
              </div>

              <div class="form-group2 full-width">
                <label>address details</label>
                <textarea v-model="customerAddressForm.detail" rows="4"
                placeholder="ex. House number, Village, Building, Road, Alley"></textarea>
              </div>
                      
              <div class="row full-width">
                <div class="form-group2 half">
                  <label>province <span class="required">*</span></label>
                  <input type="text" v-model="customerAddressForm.province" :class="{ 'input-error': errors.province }" 
                  placeholder="ex. Chiang Mai" />
                  <span class="error-msg" v-if="errors.province">{{ errors.province }}</span>
                </div>
                <div class="form-group2 half">
                    <label>district, subdistrict <span class="required">*</span></label>
                    <input type="text" v-model="customerAddressForm.district" :class="{ 'input-error': errors.district }" 
                    placeholder="ex. Mueang Chiang Mai, Suthep" />
                    <span class="error-msg" v-if="errors.district">{{ errors.district }}</span>
                </div>
              </div>
                      
              <div class="row full-width">
                <div class="form-group2 half">
                  <label>postcode <span class="required">*</span></label>
                  <input type="text" v-model="customerAddressForm.postcode" :class="{ 'input-error': errors.postcode }" 
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
            <option value="" disabled>Select Payment Method *</option>
            <option>QR Payment</option>   
            <option>cash on delivery</option>    
            <option>bank transfer</option>       
          </select>
        </div>
         
      <!-- confirm create order -->
      <div class="form-group2 full-width">
        <h2>Product List</h2>
        <div class="confirm-container">
          <span> {{ totalSelectedQty }} of item in the list</span>
          <button class="btn close-right" @click="openProductModal">add product</button>
        </div>
        <!-- confirmed product list table -->
        <table v-if="confirmedItems.length > 0" class="product-list-table">
          <thead>
            <tr>
              <th>code</th>
              <th>name</th>
              <th>price</th>
              <th>amount</th>
              <th>total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in confirmedItems" :key="item._id">
              <td>{{ item.productCode }}</td>
              <td class="modal-product-info">
                <span>{{ item.name }}</span>
                <span class="product-code">{{ item.description }}</span>
              </td>
              <td>{{ item.price }} Baht</td>
              <td>{{ item.qty }}</td>
              <td>{{ item.price * item.qty }}</td>
            </tr>
          </tbody>
        </table>
        <div class="mid">
          <span>{{ totalPrice }} <strong>in total</strong></span>
        </div>
      </div>
      <div class="confirm-container down">
        <button class="btn cancel-btn" @click="orderView">cancel</button>
        <button class="btn confirm-btn" @click="confirmOrder">{{ isEditMode ? 'update' : 'confirm' }}</button>
      </div>
    </div>

<!-- adding product modal section -->
<ProductSelectionModal
  :isVisible="productModalVisible"
  :shopId="shopId"
  :initialSelectedItems="confirmedItems"
  @close="productModalVisible = false"
  @confirm="handleConfirmProductModal"
/>

</template>

<style scoped>
@import "../styles/createOrder.css";
</style>