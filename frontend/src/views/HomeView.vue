<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useAuthStore } from '../stores/auth'
import { useShopStore } from '../stores/shop'
import router from '../router';
import ShopFormModal from '../components/ShopFormModal.vue';

const authStore = useAuthStore();
const shopStore = useShopStore();

const isEditing = ref(false);
const isHovering = ref(false);
const dialogVisible = ref(false);
const shopToEdit = ref<any>(null);

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
    name: 'shop-dashboard',
    params: { id: shopId }
  })
}

const handleEditShop = (shop: any) => {
  shopStore.setcurrentShop(shop._id);
  shopToEdit.value = shop;
  dialogVisible.value = true;
};

const handleRefresh = async () => {
  await shopStore.fetchMyShops();
};

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
            <button v-if="isHovering" @click="handleEditShop(shop)" class="action-btn">edit informations</button>
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
    <ShopFormModal 
      :isVisible="dialogVisible"
      :shopToEdit="shopToEdit"
      @close="dialogVisible = false"
      @refresh="handleRefresh"
    />
  </div>
</template>

<style scoped>
@import "../styles/utils.css";
</style>
