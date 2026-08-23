<template>
  <div
    class="flex h-screen overflow-hidden bg-slate-100 text-slate-800 font-sans selection:bg-indigo-500 selection:text-white"
  >
    <!-- Mobile Backdrop Overlay -->
    <div
      v-if="isSidebarOpen"
      class="fixed inset-0 z-40 bg-slate-900/60 lg:hidden"
      @click="isSidebarOpen = false"
    />

    <!-- SIDEBAR NAV MENU -->
    <aside
      class="fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200/80 shadow-lg transition-[width,transform] duration-200 ease-in-out"
      :class="[
        isSidebarOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full lg:w-20 lg:translate-x-0',
      ]"
    >
      <!-- Logo Branding Header -->
      <div
        class="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/70"
      >
        <RouterLink to="/admin" class="flex items-center gap-3.5 min-w-0 group">
          <div
            class="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
              />
            </svg>
          </div>
          <div v-if="isSidebarOpen" class="min-w-0 flex-1">
            <h1
              class="text-base font-bold tracking-tight text-slate-900 truncate group-hover:text-indigo-600 transition-colors"
            >
              E-Learn Admin
            </h1>
            <p class="text-xs text-indigo-600 font-semibold truncate">ระบบจัดการผู้ดูแลระบบ</p>
          </div>
        </RouterLink>

        <button
          v-if="isSidebarOpen"
          @click="isSidebarOpen = false"
          class="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Navigation Links -->
      <nav
        class="flex-1 overflow-y-auto px-3.5 py-5 space-y-6 scrollbar-thin scrollbar-thumb-slate-200"
      >
        <div v-for="(section, i) in navSections" :key="i" class="space-y-1">
          <div v-if="isSidebarOpen && section.title" class="px-3 pb-1">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {{ section.title }}
            </span>
          </div>

          <ul class="space-y-1">
            <li v-for="item in section.items" :key="item.to">
              <RouterLink :to="item.to" custom v-slot="{ href, navigate, isActive, isExactActive }">
                <a
                  :href="href"
                  @click="navigate"
                  class="group relative flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors duration-150"
                  :class="[
                    (item.exact ? isExactActive : isActive)
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  ]"
                  :title="!isSidebarOpen ? item.label : undefined"
                >
                  <!-- Icon SVG -->
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-5 h-5 flex-shrink-0 transition-colors duration-150"
                    :class="[
                      (item.exact ? isExactActive : isActive)
                        ? 'text-white'
                        : 'text-slate-400 group-hover:text-indigo-600',
                    ]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" :d="item.iconPath" />
                  </svg>

                  <span v-if="isSidebarOpen" class="truncate flex-1">{{ item.label }}</span>

                  <span
                    v-if="isSidebarOpen && item.badge"
                    class="px-2 py-0.5 text-[10px] font-bold rounded-full transition-colors"
                    :class="[
                      (item.exact ? isExactActive : isActive)
                        ? 'bg-white/20 text-white'
                        : 'bg-indigo-100 text-indigo-700',
                    ]"
                  >
                    {{ item.badge }}
                  </span>
                </a>
              </RouterLink>
            </li>
          </ul>
        </div>
      </nav>

      <!-- Back to Main Website & Logout Footer -->
      <div class="p-3.5 border-t border-slate-200 bg-slate-50/50 space-y-1">
        <RouterLink
          to="/"
          class="flex items-center gap-3.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 transition-colors"
          :class="[!isSidebarOpen ? 'justify-center' : '']"
          :title="!isSidebarOpen ? 'กลับสู่หน้าเว็บไซต์หลัก' : undefined"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span v-if="isSidebarOpen">หน้าเว็บไซต์หลัก</span>
        </RouterLink>

        <button
          @click="handleLogout"
          class="w-full flex items-center gap-3.5 px-3 py-2 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors group"
          :class="[!isSidebarOpen ? 'justify-center' : '']"
          :title="!isSidebarOpen ? 'ออกจากระบบ' : undefined"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5 flex-shrink-0 transition-transform duration-150 group-hover:scale-110"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span v-if="isSidebarOpen">ออกจากระบบ</span>
        </button>
      </div>
    </aside>

    <!-- MAIN CONTENT AREA -->
    <div class="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden">
      <!-- TOP HEADER BAR -->
      <header
        class="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 py-3.5 shadow-sm"
      >
        <div class="flex items-center gap-3 sm:gap-4">
          <button
            @click="isSidebarOpen = !isSidebarOpen"
            class="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shadow-sm"
            aria-label="Toggle Sidebar Navigation"
          >
            <svg
              v-if="isSidebarOpen"
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div>
            <h2
              class="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2"
            >
              {{ currentRouteTitle }}
            </h2>
            <p class="text-xs text-slate-500 hidden xs:block">
              ระบบจัดการหลักสูตรและผู้ใช้งาน E-Learning Platform
            </p>
          </div>
        </div>

        <!-- Right Header Items: User Info -->
        <div class="flex items-center gap-2 sm:gap-3">
          <!-- User Profile Pill -->
          <div class="relative" ref="dropdownRef">
            <button
              @click="isDropdownOpen = !isDropdownOpen"
              class="flex items-center gap-3 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 shadow-sm transition-colors"
            >
              <div
                class="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 text-sm font-bold text-white shadow-inner"
              >
                {{ userInitial }}
              </div>
              <div class="hidden sm:block text-left min-w-0">
                <p class="text-xs font-bold text-slate-900 truncate leading-none mb-1">
                  {{ userName }}
                </p>
                <p class="text-[11px] text-slate-400 font-medium leading-none truncate">
                  {{ userEmail }}
                </p>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4 text-slate-400 transition-transform duration-150 hidden sm:block"
                :class="{ 'rotate-180': isDropdownOpen }"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Profile Dropdown Menu -->
            <div
              v-if="isDropdownOpen"
              class="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
            >
              <div class="px-3 py-2.5 border-b border-slate-100 mb-1">
                <p class="text-xs text-slate-400 font-medium">เข้าสู่ระบบด้วย</p>
                <p class="text-sm font-bold text-slate-900 truncate">{{ userEmail }}</p>
                <span
                  class="inline-block mt-1 text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200"
                >
                  {{ userRole }}
                </span>
              </div>

              <RouterLink
                to="/"
                class="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                @click="isDropdownOpen = false"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-4 h-4 text-slate-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                กลับไปหน้าเว็บไซต์
              </RouterLink>

              <button
                @click="handleLogout"
                class="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors mt-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-4 h-4 text-rose-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- DYNAMIC ROUTE PAGE CONTENT -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 2xl:p-8 bg-slate-50">
        <div class="max-w-[1920px] mx-auto w-full">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute, RouterLink, RouterView } from 'vue-router'
import { useAuthStore } from '@/features/auth/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const isSidebarOpen = ref(true)
const isDropdownOpen = ref(false)
const dropdownRef = ref<HTMLDivElement | null>(null)

const userName = computed(() => auth.user?.name || 'ผู้ดูแลระบบ')
const userEmail = computed(() => auth.user?.email || 'admin@elearn.com')
const userRole = computed(() => auth.user?.role || 'admin')
const userInitial = computed(() => userName.value.charAt(0).toUpperCase() || 'A')

const currentRouteTitle = computed(() => {
  if (route.path.includes('/admin/courses')) return 'จัดการคอร์สเรียน'
  if (route.path.includes('/admin/users')) return 'จัดการผู้ใช้งาน'
  if (route.path.includes('/admin/teachers')) return 'จัดการอาจารย์ผู้สอน'
  if (route.path.includes('/admin/categories')) return 'จัดการหมวดหมู่'
  return 'ภาพรวมแผงควบคุม (Dashboard)'
})

export interface NavItem {
  to: string
  label: string
  iconPath: string
  exact?: boolean
  badge?: string
}

export interface NavSection {
  title?: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: 'ภาพรวมระบบ',
    items: [
      {
        to: '/admin',
        label: 'Dashboard',
        iconPath:
          'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
        exact: true,
      },
    ],
  },
  {
    title: 'จัดการเนื้อหา',
    items: [
      {
        to: '/admin/courses',
        label: 'จัดการคอร์สเรียน',
        iconPath:
          'M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25',
      },
      {
        to: '/admin/categories',
        label: 'หมวดหมู่คอร์ส',
        iconPath: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
      },
    ],
  },
  {
    title: 'ผู้ใช้งาน & สิทธิ์',
    items: [
      {
        to: '/admin/users',
        label: 'จัดการผู้ใช้งาน',
        iconPath:
          'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      },
      {
        to: '/admin/teachers',
        label: 'จัดการอาจารย์ผู้สอน',
        iconPath:
          'M12 14a4 4 0 100-8 4 4 0 000 8zm-7 7a7 7 0 0114 0H5z',
      },
    ],
  },
  {
    title: 'การเงิน & การสั่งซื้อ',
    items: [
      {
        to: '/admin/purchases',
        label: 'ประวัติการชำระเงิน',
        iconPath:
          'M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
      },
    ],
  },
]

function handleLogout() {
  auth.logout()
  router.push('/login')
}

function handleClickOutside(e: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    isDropdownOpen.value = false
  }
}

function handleResize() {
  if (window.innerWidth < 1024) {
    isSidebarOpen.value = false
  } else {
    isSidebarOpen.value = true
  }
}

onMounted(() => {
  // Always force light mode
  document.documentElement.classList.remove('dark')
  localStorage.removeItem('theme')

  handleResize()
  window.addEventListener('resize', handleResize)
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>
