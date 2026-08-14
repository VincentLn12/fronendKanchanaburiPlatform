<template>
  <header class="sticky top-0 z-50 w-full border-b border-slate-200/70 bg-white/90 backdrop-blur-xl transition-all duration-300 shadow-xs">
    <nav aria-label="เมนูหลัก" class="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      
      <!-- Brand Logo -->
      <RouterLink to="/" class="flex items-center gap-3 group shrink-0" @click="closeMenu">
        <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20 group-hover:bg-indigo-700 group-hover:scale-105 transition-all duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <div class="flex flex-col">
          <span class="text-2xl font-black tracking-tight text-slate-900 leading-tight">
            ก้าว<span class="text-indigo-600">เรียน</span>
          </span>
          <span class="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 -mt-0.5">E-Learning Studio</span>
        </div>
      </RouterLink>

      <!-- Desktop Navigation -->
      <ul class="hidden items-center gap-8 md:flex">
        <li v-for="item in navigationItems" :key="item.label">
          <RouterLink
            v-if="item.to"
            :to="item.to"
            :exact-active-class="item.to === '/' ? 'is-active' : undefined"
            active-class="is-active"
            class="nav-link"
          >
            {{ item.label }}
          </RouterLink>
          <a v-else :href="item.href" class="nav-link">{{ item.label }}</a>
        </li>
        <li v-if="auth.user?.role === 'admin'">
          <RouterLink to="/admin" class="nav-link text-amber-700 hover:text-amber-800 font-bold">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-xs font-bold">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              ผู้ดูแลระบบ
            </span>
          </RouterLink>
        </li>
      </ul>

      <!-- Desktop Actions -->
      <div class="hidden items-center gap-3 sm:flex">
        <template v-if="!auth.isAuthenticated">
          <RouterLink to="/login" class="btn-secondary">
            เข้าสู่ระบบ
          </RouterLink>
          <RouterLink to="/register" class="btn-primary">
            สมัครสมาชิก
          </RouterLink>
        </template>
        <template v-else>
          <RouterLink to="/my-courses" class="flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-slate-50 px-3.5 py-2 text-sm font-semibold text-slate-700 transition-all hover:bg-white hover:shadow-md hover:border-slate-300">
            <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-xs font-black text-white shadow-xs">
              {{ auth.user?.name?.charAt(0).toUpperCase() || 'U' }}
            </span>
            <span class="max-w-[120px] truncate font-bold text-slate-800">{{ auth.user?.name }}</span>
          </RouterLink>
          <button class="btn-secondary text-rose-600 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-200" @click="logout">
            ออกจากระบบ
          </button>
        </template>
      </div>

      <!-- Mobile Menu Button -->
      <button 
        class="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100 sm:hidden focus:outline-none"
        :aria-expanded="isMobileMenuOpen" 
        aria-label="เปิดเมนู" 
        @click="isMobileMenuOpen = !isMobileMenuOpen"
      >
        <svg v-if="!isMobileMenuOpen" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16" stroke-linecap="round"/></svg>
        <svg v-else class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 6 12 12M18 6 6 18" stroke-linecap="round"/></svg>
      </button>
    </nav>

    <!-- Mobile Drawer -->
    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="-translate-y-2 opacity-0" leave-active-class="transition duration-150 ease-in" leave-to-class="-translate-y-2 opacity-0">
      <div v-if="isMobileMenuOpen" class="border-t border-slate-200 bg-white/98 backdrop-blur-2xl px-6 py-5 shadow-2xl sm:hidden">
        <div class="flex flex-col space-y-2">
          <RouterLink v-for="item in navigationItems.filter((item) => item.to)" :key="item.label" :to="item.to!" class="mobile-nav-link" @click="closeMenu">{{ item.label }}</RouterLink>
          <a v-for="item in navigationItems.filter((item) => item.href)" :key="item.label" :href="item.href!" class="mobile-nav-link" @click="closeMenu">{{ item.label }}</a>
          <RouterLink v-if="auth.user?.role === 'admin'" to="/admin" class="mobile-nav-link text-amber-700 font-bold" @click="closeMenu">ผู้ดูแลระบบ</RouterLink>
        </div>
        <div class="mt-5 pt-5 border-t border-slate-100 flex flex-col gap-3">
          <template v-if="!auth.isAuthenticated">
            <RouterLink to="/login" class="btn-secondary text-center w-full justify-center py-3" @click="closeMenu">เข้าสู่ระบบ</RouterLink>
            <RouterLink to="/register" class="btn-primary text-center w-full justify-center py-3" @click="closeMenu">สมัครสมาชิก</RouterLink>
          </template>
          <button v-else class="w-full rounded-2xl bg-rose-50 border border-rose-200 py-3 text-sm font-bold text-rose-600 hover:bg-rose-100 transition" @click="logout">ออกจากระบบ</button>
        </div>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()
const isMobileMenuOpen = ref(false)
const navigationItems = [
  { label: 'หน้าแรก', to: '/' },
  { label: 'คอร์สเรียน', to: '/courses' },
  { label: 'คอร์สของฉัน', to: '/my-courses' },
  { label: 'เกี่ยวกับเรา', href: '/#dashboard-demo' },
]

function closeMenu() { isMobileMenuOpen.value = false }
function logout() { auth.logout(); closeMenu(); router.push('/') }
</script>

<style scoped>
.nav-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 0;
  color: #475569;
  font-size: 0.95rem;
  font-weight: 600;
  transition: color 200ms ease;
}

.nav-link:hover,
.nav-link.is-active {
  color: #4f46e5;
  font-weight: 700;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0%;
  height: 2.5px;
  background: #4f46e5;
  border-radius: 9999px;
  transition: width 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-link:hover::after,
.nav-link.is-active::after {
  width: 100%;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #cbd5e1;
  border-radius: 1rem;
  padding: 0.6rem 1.25rem;
  color: #334155;
  font-size: 0.9rem;
  font-weight: 700;
  background-color: #ffffff;
  transition: all 200ms ease;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.04);
}

.btn-secondary:hover {
  border-color: #94a3b8;
  background-color: #f8fafc;
  color: #0f172a;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 1rem;
  background-color: #4f46e5;
  padding: 0.65rem 1.35rem;
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 700;
  box-shadow: 0 4px 14px 0 rgba(79, 70, 229, 0.25);
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-primary:hover {
  background-color: #4338ca;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px 0 rgba(79, 70, 229, 0.35);
}

.mobile-nav-link {
  display: block;
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  color: #334155;
  font-size: 1rem;
  font-weight: 650;
  transition: all 150ms ease;
}

.mobile-nav-link:hover {
  background-color: #f1f5f9;
  color: #2563eb;
}
</style>
