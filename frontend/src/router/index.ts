import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/HomeView.vue'
import Login from '../views/LoginView.vue'
import Register from '../views/RegisterView.vue'
import Shop from '../views/ShopView.vue'
import Profile from '../views/ProfileView.vue'
import OrderView from '../views/OrderView.vue'
import DashboardView from '@/views/DashboardView.vue'
import CustomerListView from '@/views/CustomerListView.vue'
import createOrderView from '@/views/CreateOrderView.vue'
import ProductView from '../views/ProductView.vue'
import InfoView from '../views/InfoView.vue'
import { useShopStore } from '@/stores/shop'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login/'
    },
    {
      path: '/home/',
      name: 'home',
      component: Home,
      meta: { menuType: 'home' }
    },
    {
      path: '/login/',
      name: 'login',
      component: Login,
      meta: { menuType: 'home' }
    },
    {
      path: '/register/',
      name: 'register',
      component: Register,
      meta: { menuType: 'home' }
    },
    {
      path: '/shop/',
      name: 'shop',
      component: Shop,
      meta: { menuType: 'home' }
    },
    {
      path: '/shop/:id/dashboard',
      name: 'shop-dashboard',
      component: DashboardView,
      beforeEnter: async (to, from, next) => {
        const shopStore = useShopStore()
        const shopId = to.params.id as string
        await shopStore.setcurrentShop(shopId)
        if (shopStore.currentShop) {
          next()
        } else {
          next('/home')
        }
      },
      meta: { menuType: 'shop' }
    },
    {
      path: '/shop/:id/customer',
      name: 'shop-customer',
      component: CustomerListView,
      beforeEnter: async (to, from, next) => {
        const shopStore = useShopStore()
        const shopId = to.params.id as string
        await shopStore.setcurrentShop(shopId)
        if (shopStore.currentShop) {
          next()
        } else {
          next('/home')
        }
      },
      meta: { menuType: 'shop' }
    },
    {
      path: '/shop/:id/order',
      name: 'shop-order',
      component: OrderView,
      beforeEnter: async (to, from, next) => {
        const shopStore = useShopStore()
        const shopId = to.params.id as string
        await shopStore.setcurrentShop(shopId)
        if (shopStore.currentShop) {
          next()
        } else {
          next('/home')
        }
      },
      meta: { menuType: 'shop' }
    },
    {
      path: '/shop/:id/order/create',
      name: 'order-create',
      component: createOrderView,
      beforeEnter: async (to, from, next) => {
        const shopStore = useShopStore()
        const shopId = to.params.id as string
        await shopStore.setcurrentShop(shopId)
        if (shopStore.currentShop) {
          next()
        } else {
          next('/home')
        }
      },
      meta: { menuType: 'shop' }
    },
    {
      path: '/shop/:id/order/edit/:orderId',
      name: 'order-edit',
      component: createOrderView,
      beforeEnter: async (to, from, next) => {
        const shopStore = useShopStore()
        const shopId = to.params.id as string
        await shopStore.setcurrentShop(shopId)
        if (shopStore.currentShop) {
          next()
        } else {
          next('/home')
        }
      },
      meta: { menuType: 'shop' }
    },
    {
      path: '/shop/:id/product',
      name: 'shop-product',
      component: ProductView,
      beforeEnter: async (to, from, next) => {
        const shopStore = useShopStore()
        const shopId = to.params.id as string
        await shopStore.setcurrentShop(shopId)
        if (shopStore.currentShop) {
          next()
        } else {
          next('/home')
        }
      },
      meta: { menuType: 'shop' }
    },
    {
      path: '/profile/',
      name: 'profile',
      component: Profile,
      meta: { menuType: 'home' }
    },
    {
      path: '/shop/:id/info',
      name: 'shop-info',
      component: InfoView,
      beforeEnter: async (to, from, next) => {
        const shopStore = useShopStore()
        const shopId = to.params.id as string
        await shopStore.setcurrentShop(shopId)
        if (shopStore.currentShop) {
          next()
        } else {
          next('/home')
        }
      },
      meta: { menuType: 'shop' }
    }
  ]
})

export default router
