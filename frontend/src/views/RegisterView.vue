<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useAuthStore } from "../stores/auth";
import router from '@/router';

const authStore = useAuthStore();
const registerForm = reactive({
  username: '',
  name:'',
  password: ''
});

const handleRegister = async () => {
  if (!registerForm.username || !registerForm.password) return;
  const success = await authStore.register({
    username: registerForm.username,
    name: registerForm.username,
    password: registerForm.password
  });

  if (success) {
    router.push('/login');
  }
}
</script>

<template>
  <div class="register">
    <h1>Create an Account</h1>
    <form @submit.prevent="handleRegister">
      <div class="form-group" label="Username">
          <input v-model="registerForm.username" placeholder="Enter your username" :disabled="authStore.loading" />
      </div>
      <div class="form-group" label="Name">
          <input v-model="registerForm.name" placeholder="Enter your name" :disabled="authStore.loading" />
      </div>
      <div class="form-group" label="Password">
          <input v-model="registerForm.password" placeholder="Enter your password" type="password" :disabled="authStore.loading" />
      </div>
      <div v-if="authStore.error" class="error-message">
        {{ authStore.error }}
      </div>
      <button 
          type="submit" 
          :disabled="authStore.loading"
          class="register-btn"
      >
       {{ authStore.loading ? 'Registering...' : 'Register' }}
      </button>
    </form>
    <div class="login-link">
      Already have an account? <router-link to="/login">Login here</router-link>
    </div>
  </div>
</template>

<style scoped>
.register {
  text-align: center;
  margin-top: 50px;
  font-family: sans-serif;
}
.error-message {
  color: red;
  margin-bottom: 10px;
}
.login-link {
  margin-top: 10px;
}

.form-group {
  margin-top: 10px;
}

.register-btn {
  margin-top: 10px;
}

</style>
