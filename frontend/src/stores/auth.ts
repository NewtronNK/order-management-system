import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";

// axios set up
axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:3001/api'; 

export const useAuthStore = defineStore('auth', () => {
    const user = ref<any>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const isAuthenticated = ref(false);

    async function login(credentials: { username: string, password: string}) {
        loading.value = true;
        error.value = null;
        try {
            // api backend
            const response = await axios.post('/auth/login', credentials);
            user.value = response.data;
            return true;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Login failed';
        } finally {
            loading.value = false;
        }
        
        // after login set up user and isAuth
    }

    async function register(credentials: { username: string, name: string, password: string }) {
        loading.value = true;
        error.value = null;
        try {
            // api backend
            const response = await axios.post('/user/register', credentials);
            return true;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Registration failed';
            return false;
        } finally {
            loading.value = false;
        }
    }

    async function logout() {
        loading.value = true;
        error.value = null;
        try {
            // api backend
            const response = await axios.get('/auth/logout');
            return true;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Logout cancelled';
            return false;
        } finally {
            loading.value = false;
        }
    }

    async function changePassword(credentials: { oldPassword: string, newPassword: string }) {
        loading.value = true;
        error.value = null;
        try {
            // api backend
            const response = await axios.put('/auth/changepassword', credentials);
            return true;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Change password failed';
        } finally {
            loading.value = false;
        }
    }

    async function changeName(credentials: { name: string }) {
        loading.value = true;
        error.value = null;
        try {
            // api backend
            const response = await axios.put('/auth/changename', credentials);
            user.value.name = credentials.name;
            return true;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Change name failed';
        } finally {
            loading.value = false;
        }
    }

    // get user profile and auth ไม่ใช้ get profile ของ auth เพราะไม่ fetch ทันที
    async function checkAuth() {
    try {
      const response = await axios.get('/user/profile');
      user.value = response.data;
      isAuthenticated.value = true;
    } catch (error) {
      // Error = Token หมดอายุหรือไม่มี Cookie
      user.value = null;
      isAuthenticated.value = false;
    }
  }

    return { user, loading, error, isAuthenticated, login, logout, register, changePassword, changeName, checkAuth };
})

// export const useCheckAuthStore = defineStore('googleAuth', () => {
//   const user = ref<any>(null);
//   const isAuthenticated = ref(false);

//   async function checkAuth() {
//     try {
//       const response = await axios.get('/auth/profile');
//       user.value = response.data;
//       isAuthenticated.value = true;
//     } catch (error) {
//       // Error = Token หมดอายุหรือไม่มี Cookie
//       user.value = null;
//       isAuthenticated.value = false;
//     }
//   }

//   return { user, isAuthenticated, checkAuth };
// });