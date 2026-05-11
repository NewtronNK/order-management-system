<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useAuthStore } from "../stores/auth";
import router from '@/router';

const authStore = useAuthStore();
const loginForm = reactive({
  username: '',
  password: ''
});

const handleLogin = async () => {
  if (!loginForm.username || !loginForm.password) return;
  const success = await authStore.login({
    username: loginForm.username,
    password: loginForm.password
  });

  if (success) {
    router.push('/home');
  }
}

const handleGoogleLogin = async () => {
  window.location.href = 'http://localhost:3001/api/auth/google';
}
</script>

<template>
  <div class="login">
    <h1>Welcome to the Login Page</h1>
    <form @submit.prevent="handleLogin">
      <div class="form-group" label="Username">
          <input v-model="loginForm.username" placeholder="Enter your username" :disabled="authStore.loading" />
      </div>
      <div class="form-group" label="Password">
          <input v-model="loginForm.password" placeholder="Enter your password" :disabled="authStore.loading" />
      </div>
      <button 
          type="submit" 
          :disabled="authStore.loading"
          class="login-btn"
      >
       {{ authStore.loading ? 'Logging in...' : 'Login' }}
      </button>
    </form>
    <form class="google" label-position="top" @submit.prevent="handleGoogleLogin">
      <button type="submit" class="google-login-btn">
        Sign in with Google 
      </button>
    </form>
    <router-link class="login-link" to="/register">
    Don't have an account?
    </router-link>
  </div>
</template>

<style scoped>
.login {
  text-align: center;
  margin-top: 50px;
  font-family: sans-serif;
}

.login-btn {
  margin-top: 10px;
}

.form-group {
  margin-top: 10px;
}

.login-link {
  margin-top: 10px;
}

.google {
  margin-top: 10px;
}
</style>
