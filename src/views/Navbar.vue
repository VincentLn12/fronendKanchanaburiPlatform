<template>
  <header
    class="sticky top-0 z-50 w-full border-b-2 border-[#E8D9C9] bg-[#FFF9F2]/95 backdrop-blur-xl shadow-xs"
  >
    <nav
      aria-label="เมนูหลัก"
      class="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
    >
      <!-- Logo Brand -->
      <RouterLink to="/" class="group flex shrink-0 items-center gap-3" @click="closeMenu">
        <div
          class="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D96C2C] via-[#BF5720] to-[#171412] text-white shadow-md shadow-[#D96C2C]/25 transition-all duration-300 group-hover:scale-105"
        >
          <!-- Pagoda / Sacred Thai Emblem Icon -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 fill-current text-[#F2A65A]"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 2L9.5 7H14.5L12 2ZM12 7.5L8.5 13H15.5L12 7.5ZM12 13.5L7 20H17L12 13.5ZM5 21H19V22H5V21Z"
            />
          </svg>
        </div>

        <div class="flex flex-col">
          <span class="text-xl font-black leading-tight tracking-tight text-[#332820] sm:text-2xl">
            กาญจนบุรี
          </span>
          <span class="text-[11px] font-bold text-[#D96C2C] tracking-wide">
            แพลตฟอร์มท่องเที่ยวเชิงวัฒนธรรม
          </span>
        </div>
      </RouterLink>

      <!-- Desktop Menu Nav Links -->
      <ul class="hidden min-w-0 items-center justify-center gap-6 lg:flex xl:gap-8">
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

      <!-- Desktop Right Actions -->
      <div class="hidden shrink-0 items-center gap-3 md:flex lg:gap-4">
        <!-- Search Quick Icon -->
        <button
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-full text-[#332820] hover:bg-[#F7F0E6] transition cursor-pointer"
          title="ค้นหา"
          @click="toggleSearch"
        >
          <i class="mdi mdi-magnify text-2xl text-[#D96C2C]"></i>
        </button>

        <!-- Cart Button with Count Badge -->
        <RouterLink
          to="/cart"
          class="relative flex h-10 w-10 items-center justify-center rounded-full text-[#332820] hover:bg-[#F7F0E6] transition"
          title="ตะกร้าสินค้า"
        >
          <i class="mdi mdi-shopping-outline text-2xl text-[#D96C2C]"></i>
          <span
            class="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#D96C2C] px-1 text-[10px] font-black text-white shadow-xs"
          >
            {{ auth.isLoggedIn ? cart.itemCount : 0 }}
          </span>
        </RouterLink>

        <!-- Create Content CTA Button -->
        <RouterLink
          to="/create"
          class="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#D96C2C] to-[#BF5720] hover:from-[#BF5720] hover:to-[#a84614] px-3.5 py-2 text-xs sm:text-sm font-black text-white shadow-sm shadow-[#D96C2C]/25 transition-all duration-200 active:scale-95 border border-[#D96C2C]/40 cursor-pointer"
          title="ลงคอนเทนต์ท่องเที่ยวและวัฒนธรรมกาญจนบุรี"
        >
          <i class="mdi mdi-plus-circle text-base text-white"></i>
          <span class="font-black text-white">ลงคอนเทนต์</span>
        </RouterLink>

        <!-- Profile / Login Button -->
        <RouterLink v-if="!auth.isLoggedIn" to="/login" class="login-button gap-2">
          <i class="mdi mdi-account-circle-outline text-xl text-[#D96C2C]"></i>
          <span>เข้าสู่ระบบ</span>
        </RouterLink>

        <div v-else class="flex items-center gap-2">
          <RouterLink to="/profile" class="login-button gap-2">
            <i class="mdi mdi-account-circle-outline text-xl text-[#D96C2C]"></i>
            <span>{{ auth.user?.name || 'โปรไฟล์' }}</span>
          </RouterLink>
          <button
            class="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#E8D9C9] bg-white text-[#786B62] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition cursor-pointer"
            title="ออกจากระบบ"
            @click="logout"
          >
            <i class="mdi mdi-logout text-lg"></i>
          </button>
        </div>
      </div>

      <!-- Mobile Hamburger Button -->
      <button
        class="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#E8D9C9] bg-[#F7F0E6] text-[#332820] transition hover:bg-[#E8D9C9]/50 lg:hidden cursor-pointer"
        :aria-expanded="isMobileMenuOpen"
        aria-label="เปิดเมนู"
        @click="isMobileMenuOpen = !isMobileMenuOpen"
      >
        <svg
          v-if="!isMobileMenuOpen"
          class="h-6 w-6 text-[#D96C2C]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M4 6h16M4 12h16M4 18h16" stroke-linecap="round" />
        </svg>

        <svg
          v-else
          class="h-6 w-6 text-[#D96C2C]"
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
        class="border-t-2 border-[#E8D9C9] bg-[#FFF9F2] px-5 py-5 shadow-xl lg:hidden"
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

        <div class="mt-5 flex flex-col gap-3 border-t-2 border-[#E8D9C9] pt-5">
          <!-- Mobile Create Content CTA Button -->
          <RouterLink
            to="/create"
            class="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#D96C2C] to-[#BF5720] py-3 text-sm font-black text-white shadow-md transition active:scale-95 border border-[#D96C2C]/40"
            @click="closeMenu"
          >
            <i class="mdi mdi-plus-circle text-lg text-white"></i>
            <span class="text-white font-black">+ ลงคอนเทนต์ท่องเที่ยว</span>
          </RouterLink>

          <RouterLink
            to="/cart"
            class="login-button w-full justify-center gap-2"
            @click="closeMenu"
          >
            <i class="mdi mdi-shopping-outline text-lg text-[#D96C2C]"></i>
            <span>ตะกร้าสินค้า ({{ auth.isLoggedIn ? cart.itemCount : 0 }})</span>
          </RouterLink>

          <RouterLink
            v-if="!auth.isLoggedIn"
            to="/login"
            class="login-button w-full justify-center gap-2"
            @click="closeMenu"
          >
            <i class="mdi mdi-account-circle-outline text-lg text-[#D96C2C]"></i>
            <span>เข้าสู่ระบบ</span>
          </RouterLink>
          <template v-else>
            <RouterLink
              to="/profile"
              class="login-button w-full justify-center gap-2"
              @click="closeMenu"
            >
              <i class="mdi mdi-account-circle-outline text-lg text-[#D96C2C]"></i>
              <span>โปรไฟล์ของฉัน</span>
            </RouterLink>
            <button
              class="login-button w-full justify-center gap-2 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
              @click="logout"
            >
              <i class="mdi mdi-logout text-lg"></i>
              <span>ออกจากระบบ</span>
            </button>
          </template>
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
  { label: 'หน้าแรก', to: '/' },
  { label: 'คอนเทนต์', to: '/contents' },
  { label: 'ร้านค้า', to: '/shops' },
  { label: 'เกี่ยวกับเรา', to: '/about' },
]

function closeMenu() {
  isMobileMenuOpen.value = false
}

function toggleSearch() {
  router.push('/contents')
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
  color: #332820;
  font-size: 1.05rem;
  font-weight: 600;
  transition: color 200ms ease;
}

.nav-link:hover,
.nav-link.is-active {
  color: #D96C2C;
  font-weight: 700;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2.5px;
  background: #D96C2C;
  border-radius: 9999px;
  transform: translateX(-50%);
  transition: width 200ms ease;
}

.nav-link:hover::after,
.nav-link.is-active::after {
  width: 100%;
}

.login-button {
  display: inline-flex;
  align-items: center;
  border: 2px solid #E8D9C9;
  border-radius: 0.75rem;
  padding: 0.55rem 1.1rem;
  background: white;
  color: #332820;
  font-size: 1rem;
  font-weight: 600;
  transition: all 200ms ease;
}

.login-button:hover {
  border-color: #D96C2C;
  color: #D96C2C;
  background: #F7F0E6;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  border-radius: 0.8rem;
  padding: 0.85rem 1.1rem;
  color: #332820;
  font-size: 1.05rem;
  font-weight: 600;
  transition: all 150ms ease;
}

.mobile-nav-link:hover,
.mobile-nav-link.router-link-active {
  background: #F7F0E6;
  color: #D96C2C;
}
</style>
