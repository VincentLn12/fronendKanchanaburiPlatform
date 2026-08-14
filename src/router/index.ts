import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0, left: 0, behavior: 'smooth' }
    }
  },

  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/features/home/views/HomePage.vue'),
    },
    {
      path: '/courses',
      name: 'courses',
      component: () => import('@/features/courses/views/CourseListView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/courses/:id',
      name: 'course-detail',
      component: () => import('@/features/coursesDetail/views/coursesDetail.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/my-courses',
      name: 'my-courses',
      component: () => import('@/features/courses/views/MyCoursesView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/AuthView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/AuthView.vue'),
      meta: { guestOnly: true },
    },

    // ===== ADMIN ROUTES WITH ADMIN NAV MENU LAYOUT =====
    {
      path: '/admin',
      component: () => import('@/components/AdminNavMenu.vue'),
      meta: { requiresAuth: true, role: 'admin' },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('@/features/admin/AdminDashboardView/AdminDashboardView.vue'),
        },
        {
          path: 'courses',
          name: 'admin-courses',
          component: () => import('@/features/admin/AdminCoursesView/AdminCoursesView.vue'),
        },
        {
          path: 'courses/:courseId/lessons',
          name: 'admin-course-lessons',
          component: () =>
            import('@/features/admin/AdminCourseLessonsView/AdminCourseLessonsView.vue'),
        },
        {
          path: 'lessons',
          name: 'admin-lessons',
          component: () => import('@/features/admin/AdminLessonsView/AdminLessonsView.vue'),
        },
        {
          path: 'categories',
          name: 'admin-categories',
          component: () => import('@/features/admin/AdminCategoriesView/AdminCategoriesView.vue'),
        },
        {
          path: 'purchases',
          name: 'admin-purchases',
          component: () => import('@/features/admin/AdminPurchasesView/AdminPurchasesView.vue'),
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('@/features/admin/AdminUsersView/AdminUsersView.vue'),
        },
        {
          path: 'teachers',
          name: 'admin-teachers',
          component: () => import('@/features/teacher/views/TeacherView.vue'),
        },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated)
    return { name: 'login', query: { redirect: to.fullPath } }

  if (to.meta.role && !auth.hasRole(to.meta.role as 'user' | 'admin')) return { name: 'home' }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    if (auth.user?.role === 'admin') return { name: 'admin-dashboard' }
    return { name: 'home' }
  }
})

export default router
