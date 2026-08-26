<template>
  <header
    class="sticky top-0 z-50 w-full border-b border-emerald-900/10 bg-white/95 backdrop-blur-xl shadow-xs"
  >
    <nav
      aria-label="เมนูหลัก"
      class="mx-auto grid h-20 w-full max-w-[1680px] grid-cols-[auto_1fr_auto] items-center px-4 sm:px-8 xl:px-10 2xl:max-w-[1840px]"
    >
      <!-- Logo Brand -->
      <RouterLink to="/" class="group flex shrink-0 items-center gap-3" @click="closeMenu">
        <div
          class="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/25 transition-all duration-300 group-hover:scale-105 group-hover:shadow-emerald-600/35"
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
            กาญจน์<span class="text-emerald-600">ชวนดู</span>
          </span>

          <span
            class="-mt-0.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-emerald-800/60"
          >
            Kanchanaburi Stories
          </span>
        </div>
      </RouterLink>

      <!-- Desktop Menu Nav Links -->
      <ul class="hidden min-w-0 items-center justify-center gap-5 lg:flex xl:gap-7 2xl:gap-9">
        <li v-for="item in navigationItems" :key="item.label">
          <RouterLink
            :to="item.to"
            class="nav-link"
            active-class="is-active"
            :exact-active-class="item.to === '/' ? 'is-active' : undefined"
          >
            <i :class="['mdi mr-1.5 text-base', item.icon]"></i>
            {{ item.label }}
          </RouterLink>
        </li>
      </ul>

      <!-- Desktop Actions -->
      <div class="hidden shrink-0 items-center gap-3 md:flex xl:gap-4">
        <!-- Cart Link -->
        <RouterLink v-if="auth.isLoggedIn" to="/cart" class="login-button gap-2 relative">
          <i class="mdi mdi-cart-outline text-lg text-emerald-700"></i>
          <span>ตะกร้า</span>
          <span
            v-if="cart.itemCount > 0"
            class="flex min-w-[20px] h-5 items-center justify-center rounded-full bg-emerald-600 px-1 text-center text-xs font-bold text-white shadow-xs"
          >
            {{ cart.itemCount }}
          </span>
        </RouterLink>

        <!-- Create Content Button -->
        <RouterLink to="/create" class="create-button">
          <i class="mdi mdi-plus-circle-outline text-lg"></i>
          <span>สร้างคอนเทนต์</span>
        </RouterLink>

        <!-- My Shop Button -->
        <RouterLink v-if="auth.isLoggedIn" to="/my-shop" class="login-button gap-1.5">
          <i class="mdi mdi-store-outline text-lg text-emerald-700"></i>
          <span>ร้านของฉัน</span>
        </RouterLink>

        <!-- Login / Logout -->
        <RouterLink v-if="!auth.isLoggedIn" to="/login" class="login-button gap-1.5">
          <i class="mdi mdi-login text-lg text-slate-500"></i>
          <span>เข้าสู่ระบบ</span>
        </RouterLink>

        <button v-else class="login-button gap-1.5 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600" @click="logout">
          <i class="mdi mdi-logout text-lg"></i>
          <span>ออกจากระบบ</span>
        </button>
      </div>

      <!-- Mobile Hamburger Button -->
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

    <!-- Mobile Navigation Drawer -->
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
            <i :class="['mdi mr-2.5 text-lg', item.icon]"></i>
            {{ item.label }}
          </RouterLink>
        </div>

        <div class="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5">
          <RouterLink
            v-if="auth.isLoggedIn"
            to="/cart"
            class="login-button w-full justify-center gap-2"
            @click="closeMenu"
          >
            <i class="mdi mdi-cart-outline text-lg text-emerald-700"></i>
            <span>ตะกร้าสินค้า</span>
            <span
              v-if="cart.itemCount > 0"
              class="ml-1 rounded-full bg-emerald-600 px-2 py-0.5 text-center text-xs font-bold text-white"
            >
              {{ cart.itemCount }}
            </span>
          </RouterLink>

          <RouterLink
            v-if="auth.isLoggedIn"
            to="/my-shop"
            class="login-button w-full justify-center gap-2"
            @click="closeMenu"
          >
            <i class="mdi mdi-store-outline text-lg text-emerald-700"></i>
            <span>ร้านของฉัน</span>
          </RouterLink>

          <RouterLink to="/create" class="create-button w-full justify-center gap-2" @click="closeMenu">
            <i class="mdi mdi-plus-circle-outline text-lg"></i>
            <span>สร้างคอนเทนต์</span>
          </RouterLink>

          <RouterLink
            v-if="!auth.isLoggedIn"
            to="/login"
            class="login-button w-full justify-center gap-2"
            @click="closeMenu"
          >
            <i class="mdi mdi-login text-lg text-slate-500"></i>
            <span>เข้าสู่ระบบ</span>
          </RouterLink>
          <button v-else class="login-button w-full justify-center gap-2 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600" @click="logout">
            <i class="mdi mdi-logout text-lg"></i>
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/features/auth/stores/auth'
import { useCartStore } from '@/stores/cart'

const isMobileMenuOpen = ref(false)
const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()

async function loadCart() {
  if (!auth.isLoggedIn) {
    cart.clear()
    return
  }

  try {
    await cart.load()
  } catch {
    cart.clear()
  }
}

onMounted(loadCart)
watch(() => auth.isLoggedIn, loadCart)

const navigationItems = [
  {
    label: 'หน้าแรก',
    to: '/',
    icon: 'mdi-home-outline',
  },
  {
    label: 'สำรวจคอนเทนต์',
    to: '/contents',
    icon: 'mdi-compass-outline',
  },
  {
    label: 'ร้านค้า',
    to: '/shops',
    icon: 'mdi-storefront-outline',
  },
  {
    label: 'เกี่ยวกับเรา',
    to: '/about',
    icon: 'mdi-information-outline',
  },
]

function closeMenu() {
  isMobileMenuOpen.value = false
}

function logout() {
  auth.logout()
  cart.clear()
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
  color: #059669;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2.5px;
  background: #059669;
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
  background: linear-gradient(135deg, #059669 0%, #0d9488 100%);
  padding: 0.65rem 1.1rem;
  color: white;
  font-size: 0.875rem;
  font-weight: 700;
  transition: all 200ms ease;
  box-shadow: 0 4px 14px rgba(5, 150, 105, 0.25);
}

.create-button:hover {
  background: linear-gradient(135deg, #047857 0%, #0f766e 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(5, 150, 105, 0.35);
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
  border-color: #a7f3d0;
  background: #f0fdf4;
  color: #065f46;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  border-radius: 0.8rem;
  padding: 0.8rem 1rem;
  color: #334155;
  font-size: 0.95rem;
  font-weight: 650;
  transition: all 150ms ease;
}

.mobile-nav-link:hover,
.mobile-nav-link.router-link-active {
  background: #ecfdf5;
  color: #059669;
}
</style>
