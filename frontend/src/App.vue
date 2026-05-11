<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useAuthStore } from './stores/auth'
import { useRoute } from 'vue-router';
// import { use }
import router from './router';

const authStore = useAuthStore();
const route = useRoute();

const currentShopId = computed(() => {
  return route.params.id as string || '';
});

onMounted(async () => {
  // ต้องเรียก checkAuth() ก่อน เพื่อให้ store ไป verify session กับ backend
  await authStore.checkAuth();
  console.log('isAuthenticated:', authStore.isAuthenticated);
  if (!authStore.isAuthenticated) {
    router.push('/login');
  }
});
</script>
<template>
  <div class="top-nav">
    <template v-if="$route.meta.menuType === 'shop'">
      <router-link to="/home" class="router-app">Home</router-link> 
      <router-link :to="`/shop/${currentShopId}/order`" class="router-app" :class="{ 'router-link-active': $route.path.includes('/order') }">Order</router-link>
      <router-link :to="`/shop/${currentShopId}/product`" class="router-app" :class="{ 'router-link-active': $route.path.includes('/product') }">Product</router-link>
      <router-link :to="`/shop/${currentShopId}/info`" class="router-app">Information</router-link>
      <router-link to="/profile" class="router-app">Profile</router-link>
    </template>
    <template v-else>
      <router-link v-if="authStore.isAuthenticated" to="/home" class="router-app">Home</router-link> 
      <template v-if="!authStore.isAuthenticated">
        <router-link to="/login" class="router-app">Login</router-link>
        <router-link to="/register" class="router-app">Register</router-link>
      </template>
      <router-link v-if="authStore.isAuthenticated" to="/profile" class="router-app">Profile</router-link>
    </template>
  </div>
  <router-view></router-view>
</template>

<style scoped>
.top-nav {
  display: flex;
  justify-content: center;
  gap: 30px;
  padding: 15px;
  margin-bottom: 20px;
}

.router-app {
  text-decoration: none;
  color: #000000;
  font-size: 1.1rem;
  font-weight: bold;
  padding-bottom: 5px;
}

.router-app:hover {
  color: #0056b3;
}

.router-app.router-link-active {
  border-bottom: 3px solid #007bff;
  color: #007bff;
}
</style>
