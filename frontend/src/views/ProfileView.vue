<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useAuthStore } from "../stores/auth";
import router from '@/router';
import { initialPasswordForm, initialNameForm } from '../components/utils/forms';
import { validateChangePassword } from '../components/utils/validators';

const authStore = useAuthStore();

const dialogVisible = ref(false);
const dialogVisibleName = ref(false);
const isLoggedIn = ref(false)
const userProfile = ref<{ username: string; name: string, _id: string } | null>(null)
const havePassword = ref(false);
const passwordForm = reactive(initialPasswordForm());

const errors = reactive({
  oldPassword: '',
  newPassword: '',
  newName: ''
});

const nameForm = reactive(initialNameForm());

const handleLogout = async () => {
    await authStore.logout();
    router.push('/login');
}

const changePassword = async () => {
  if (!validateChangePassword(passwordForm, errors)) return;

  try {
    const ownerId = authStore.user?.userId || authStore.user?._id;
    if (!ownerId) {
      alert('User not authenticated');
      return;
    }
  
    const payload = {
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    }

    const success = await authStore.changePassword(payload);
    if (!success) {
      alert(authStore.error);
      return;
    }

    dialogVisible.value = false;

    // reset form
    passwordForm.oldPassword = '';
    passwordForm.newPassword = '';
    alert("Change the password successful");

  } catch (error: any) {
    alert(error.response?.data?.message || 'Failed to change password');
  }
}

const changeName = async () => {
  if (!nameForm.newName.trim()) {
    errors.newName = 'Please enter your Name';
    return;
  }
  try {
    const ownerId = authStore.user?.userId || authStore.user?._id;
    if (!ownerId) {
      alert('User not authenticated');
      return;
    }
  
    const success = await authStore.changeName({ name: nameForm.newName });
    if (!success) {
      alert(authStore.error);
      return;
    }
    dialogVisibleName.value = false;

    // reset form
    nameForm.newName = '';
    alert("Change the name successful");

  } catch (error: any) {
    alert(error.response?.data?.message || 'Failed to change your name');
  }
}

onMounted(async () => {
  await authStore.checkAuth();
  console.log('isAuthenticated:', authStore.isAuthenticated);
  if (!authStore.isAuthenticated) {
    router.push('/login');
  } else {
    userProfile.value = authStore.user
    isLoggedIn.value = true
    // console.log(userProfile.value)
    if (authStore.user.password) {
      havePassword.value = true
    }
      
  }
});
</script>

<template>
  <div class="change-page">
    <div v-if="dialogVisible" class="form-overlay step-content">
      <div class="form-layout">
        <div class="right-col">
            <h3>Change Your Password</h3>
            
            <div class="form-group">
              <label>old Password <span class="required">*</span></label>
              <input type="text" v-model="passwordForm.oldPassword" :class="{ 'input-error': errors.oldPassword }" 
              placeholder="Enter your old password" />
              <span class="error-msg" v-if="errors.oldPassword">{{  errors.oldPassword  }}</span>
            </div>
            
            <div class="form-group">
              <label>new Password <span class="required">*</span></label>
              <input type="text" v-model="passwordForm.newPassword" :class="{ 'input-error': errors.newPassword }"
              placeholder="Enter your new password" />
              <span class="error-msg" v-if="errors.newPassword">{{  errors.newPassword  }}</span>
            </div>
            
            <div class="actions step-1-actions">
              <button class="btn" @click="dialogVisible = false">cancel</button>
              <button class="btn" @click="changePassword">confirm</button>
            </div>
          </div>
        </div>
    </div>
  </div>
  <div class="profile-container">
    <div class="profile-details">
        <p><strong>User ID:</strong> {{ userProfile?._id }}</p>
        <p><strong>Username:</strong> {{ userProfile?.username }}</p>
        <p>
            <strong>Name:</strong> {{ userProfile?.name }} 
            <span class="action-link" style="display: block; margin-top: 5px;" 
            @click="dialogVisibleName = true">Change Name</span>
            <div v-if="dialogVisibleName">
              <input type="text" v-model="nameForm.newName" :class="{ 'input-error': errors.newName }"
              placeholder="Enter your new Name" />
              <button class="btn" @click="changeName">confirm</button>
              <span class="error-msg" v-if="errors.newName">{{  errors.newName  }}</span>
            </div>
        </p>
        <p v-if="havePassword" class="action-link" @click="dialogVisible = true">
          Change the Password</p>
        <button @click="handleLogout" class="logout-btn">Logout</button>
    </div>
  </div>
</template>

<style scoped>
@import "../styles/profile.css";
</style>