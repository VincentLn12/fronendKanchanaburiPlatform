<template>
  <header
    class="sticky top-0 z-50 w-full border-b border-slate-200/70 bg-white/90 backdrop-blur-xl shadow-sm"
  >
    <nav
      aria-label="เมนูหลัก"
      class="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
    >
      <!-- Logo -->
      <RouterLink to="/" class="group flex shrink-0 items-center gap-3" @click="closeMenu">
        <div
          class="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20 transition-all duration-300 group-hover:scale-105 group-hover:bg-indigo-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 512 512">
            <path
              fill="currentColor"
              d="M395.6 69.8L325.8 0h-58.2l69.8 69.8zM23.3 0H0v69.8h93.1zm221.1 69.8L174.5 0h-58.2l69.8 69.8zm174.5 93.1h-93.1l69.8-69.8h-58.2l-69.8 69.8h-93.1l69.8-69.8h-58.2l-69.8 69.8h-93l69.8-69.8H0v372.4C0 491.1 20.9 512 46.5 512h418.9c25.7 0 46.5-20.9 46.5-46.5V93.1h-23.3zM186.2 442.2V232.7l186.2 104.7zM418.9 0l69.8 69.8H512V0z"
            />
          </svg>
        </div>

        <div class="flex flex-col">
          <span class="text-2xl font-black leading-tight tracking-tight text-slate-900">
            กาญจน์<span class="text-indigo-600">ชวนดู</span>
          </span>

          <span
            class="-mt-0.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400"
          >
            Kanchanaburi Stories
          </span>
        </div>
      </RouterLink>

      <!-- Desktop Menu -->
      <ul class="hidden items-center gap-7 lg:flex">
        <li v-for="item in navigationItems" :key="item.label">
          <RouterLink
            :to="item.to"
            class="nav-link"
            active-class="is-active"
            :exact-active-class="item.to === '/' ? 'is-active' : undefined"
          >
            {{ item.label }}
          </RouterLink>
        </li>
      </ul>

      <!-- Desktop Actions -->
      <div class="hidden items-center gap-3 md:flex">
        <!-- Create Content -->
        <RouterLink to="/create" class="create-button">
          <svg
            class="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M12 5v14M5 12h14" stroke-linecap="round" />
          </svg>

          สร้างคอนเทนต์
        </RouterLink>

        <RouterLink v-if="!auth.isLoggedIn" to="/login" class="login-button">เข้าสู่ระบบ</RouterLink>
        <button v-else class="login-button" @click="logout">ออกจากระบบ</button>
      </div>

      <!-- Mobile Button -->
      <button
        class="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100 lg:hidden"
        :aria-expanded="isMobileMenuOpen"
        aria-label="เปิดเมนู"
        @click="isMobileMenuOpen = !isMobileMenuOpen"
      >
        <svg
          v-if="!isMobileMenuOpen"
          class="h-6 w-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M4 6h16M4 12h16M4 18h16" stroke-linecap="round" />
        </svg>

        <svg
          v-else
          class="h-6 w-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="m6 6 12 12M18 6 6 18" stroke-linecap="round" />
        </svg>
      </button>
    </nav>

    <!-- Mobile Menu -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="-translate-y-2 opacity-0"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="-translate-y-2 opacity-0"
    >
      <div
        v-if="isMobileMenuOpen"
        class="border-t border-slate-200 bg-white px-5 py-5 shadow-xl lg:hidden"
      >
        <div class="flex flex-col gap-1">
          <RouterLink
            v-for="item in navigationItems"
            :key="item.label"
            :to="item.to"
            class="mobile-nav-link"
            @click="closeMenu"
          >
            {{ item.label }}
          </RouterLink>
        </div>

        <div class="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5">
          <RouterLink to="/create" class="create-button w-full justify-center" @click="closeMenu">
            <svg
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M12 5v14M5 12h14" stroke-linecap="round" />
            </svg>

            สร้างคอนเทนต์
          </RouterLink>

          <RouterLink v-if="!auth.isLoggedIn" to="/login" class="login-button w-full justify-center" @click="closeMenu">
            เข้าสู่ระบบ
          </RouterLink>
          <button v-else class="login-button w-full justify-center" @click="logout">ออกจากระบบ</button>
        </div>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/features/auth/stores/auth'

const isMobileMenuOpen = ref(false)
const router = useRouter()
const auth = useAuthStore()

const navigationItems = [
  {
    label: 'หน้าแรก',
    to: '/',
  },
  {
    label: 'สำรวจคอนเทนต์',
    to: '/contents',
  },
  {
    label: 'ร้านค้า',
    to: '/shops',
  },
  {
    label: 'โปรโมชั่น',
    to: '/promotions',
  },
  {
    label: 'กิจกรรม',
    to: '/events',
  },
  {
    label: 'เกี่ยวกับเรา',
    to: '/about',
  },
]

function closeMenu() {
  isMobileMenuOpen.value = false
}

function logout() {
  auth.logout()
  closeMenu()
  router.push('/login')
}
</script>

<style scoped>
.nav-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 0;
  color: #475569;
  font-size: 0.9rem;
  font-weight: 600;
  transition: color 200ms ease;
}

.nav-link:hover,
.nav-link.is-active {
  color: #4f46e5;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: #4f46e5;
  border-radius: 9999px;
  transform: translateX(-50%);
  transition: width 200ms ease;
}

.nav-link:hover::after,
.nav-link.is-active::after {
  width: 100%;
}

.create-button {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border-radius: 0.9rem;
  background: #4f46e5;
  padding: 0.65rem 1.1rem;
  color: white;
  font-size: 0.875rem;
  font-weight: 700;
  transition: all 200ms ease;
  box-shadow: 0 4px 14px rgba(79, 70, 229, 0.2);
}

.create-button:hover {
  background: #4338ca;
  transform: translateY(-1px);
}

.login-button {
  display: inline-flex;
  align-items: center;
  border: 1px solid #e2e8f0;
  border-radius: 0.9rem;
  padding: 0.65rem 1.1rem;
  background: white;
  color: #334155;
  font-size: 0.875rem;
  font-weight: 700;
  transition: all 200ms ease;
}

.login-button:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
  color: #0f172a;
}

.mobile-nav-link {
  display: block;
  border-radius: 0.8rem;
  padding: 0.8rem 1rem;
  color: #334155;
  font-size: 0.95rem;
  font-weight: 650;
  transition: all 150ms ease;
}

.mobile-nav-link:hover,
.mobile-nav-link.router-link-active {
  background: #eef2ff;
  color: #4f46e5;
}
</style>
