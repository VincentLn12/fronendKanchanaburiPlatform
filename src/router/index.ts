import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/features/auth/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return {
      top: 0,
      left: 0,
      behavior: 'smooth',
    }
  },

  routes: [
    { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/features/auth/views/LoginView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/features/auth/views/RegisterView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/shops',
      name: 'shops',
      component: () => import('@/features/shops/public/views/ShopListView.vue'),
    },
    {
      path: '/shops/:id',
      name: 'shop-detail',
      component: () => import('@/features/shops/public/views/ShopDetailView.vue'),
    },
    {
      path: '/products/:id',
      name: 'product-detail',
      component: () => import('@/features/shops/public/views/ProductDetailView.vue'),
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('@/features/cart/views/CartView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('@/features/cart/views/OrdersView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/orders/:id',
      name: 'order-detail',
      component: () => import('@/features/cart/views/OrderDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/orders/:id/pay',
      name: 'pay-order',
      component: () => import('@/features/cart/views/PaymentView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/my-shop',
      component: () => import('@/features/shops/merchant/views/ShopManageLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'my-shop',
          component: () => import('@/features/shops/merchant/views/MyShopView.vue'),
        },
        {
          path: 'products',
          name: 'my-shop-products',
          component: () => import('@/features/shops/merchant/views/ProductListView.vue'),
        },
        {
          path: 'products/new',
          name: 'my-shop-product-new',
          component: () => import('@/features/shops/merchant/views/ProductFormView.vue'),
        },
        {
          path: 'products/:id/edit',
          name: 'my-shop-product-edit',
          component: () => import('@/features/shops/merchant/views/ProductFormView.vue'),
        },
        {
          path: 'orders',
          name: 'my-shop-orders',
          component: () => import('@/features/shops/merchant/views/MerchantOrdersView.vue'),
        },
      ],
    },
    {
      path: '/admin',
      component: () => import('@/features/admin/views/AdminLayout.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        { path: '', redirect: '/admin/shops' },
        {
          path: 'shops',
          name: 'admin-shops',
          component: () => import('@/features/admin/shops/views/AdminShopListView.vue'),
        },
        { path: 'categories', name: 'admin-shop-categories', component: () => import('@/features/admin/shop-categories/views/AdminShopCategoriesView.vue') },
        { path: 'categories/new', name: 'admin-shop-category-new', component: () => import('@/features/admin/shop-categories/views/AdminShopCategoryFormView.vue') },
        { path: 'categories/:id/edit', name: 'admin-shop-category-edit', component: () => import('@/features/admin/shop-categories/views/AdminShopCategoryFormView.vue') },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn) return { name: 'login' }
  if (to.meta.requiresAdmin && auth.user?.role !== 'Admin') return { name: 'home' }
  if (to.meta.guestOnly && auth.isLoggedIn) return { name: 'home' }
})

router.onError((error) => {
  const retryKey = 'router-chunk-retry'
  const isChunkLoadError = /Failed to fetch dynamically imported module/.test(error.message)

  if (isChunkLoadError && !sessionStorage.getItem(retryKey)) {
    sessionStorage.setItem(retryKey, 'true')
    window.location.reload()
    return
  }

  sessionStorage.removeItem(retryKey)
  console.error('Route navigation failed:', error)
})

export default router
