<script setup lang="ts">
import type { Shop } from '@/features/shops/api'

export type ProfileTab =
  | 'profile'
  | 'addresses'
  | 'contents'
  | 'favorites'
  | 'history'
  | 'orders'
  | 'shop'

interface Props {
  currentTab: ProfileTab
  profile: {
    firstName: string
    lastName: string
    email: string
    role: string
  }
  contentCount: number
  favoriteCount: number
  historyCount: number
  orderCount: number
  shop: Shop | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:currentTab': [tab: ProfileTab]
  logout: []
}>()

function initials() {
  const f = props.profile.firstName?.slice(0, 1) || ''
  const l = props.profile.lastName?.slice(0, 1) || ''
  return `${f}${l}`.toUpperCase() || 'U'
}
</script>

<template>
  <aside class="space-y-4">
    <!-- User Mini Profile Card (Like Reference Image) -->
    <div
      class="flex items-center gap-3.5 rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-4 sm:p-5 shadow-xs"
    >
      <!-- Avatar with Initial -->
      <div
        class="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#D96C2C] via-[#BF5720] to-[#171412] text-white text-xl font-black shadow-md border-2 border-white ring-2 ring-[#D96C2C]/30"
      >
        {{ initials() }}
        <span
          class="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-[9px]"
        >
          <i class="mdi mdi-check"></i>
        </span>
      </div>

      <!-- User Information -->
      <div class="min-w-0 flex-1">
        <h3 class="font-black text-[#332820] text-sm sm:text-base truncate leading-tight">
          {{ `${props.profile.firstName} ${props.profile.lastName}`.trim() || 'สมาชิก' }}
        </h3>
        <div class="flex items-center gap-1.5 mt-1">
          <span
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-[#D96C2C]/15 text-[#D96C2C] border border-[#D96C2C]/30"
          >
            <i class="mdi mdi-shield-star text-[11px]"></i>
            {{ props.profile.role === 'Admin' ? 'ผู้ดูแลระบบ' : 'สมาชิกกาญจนบุรี' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Navigation Menu Accordion / Tree (Style Matched to Reference Image) -->
    <div
      class="overflow-hidden rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] shadow-xs p-3 space-y-4"
    >
      <!-- SECTION 1: บัญชีของฉัน -->
      <div class="space-y-1">
        <div
          class="flex items-center gap-2 px-3 py-1.5 text-xs font-black text-[#786B62] uppercase tracking-wider"
        >
          <i class="mdi mdi-account-circle-outline text-[#D96C2C] text-base"></i>
          <span>บัญชีของฉัน</span>
        </div>

        <button
          type="button"
          class="w-full flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-black transition-all cursor-pointer text-left"
          :class="
            props.currentTab === 'profile'
              ? 'bg-[#D96C2C] text-white shadow-md'
              : 'text-[#332820] hover:bg-[#F7F0E6]'
          "
          @click="emit('update:currentTab', 'profile')"
        >
          <div class="flex items-center gap-2.5">
            <i class="mdi mdi-card-account-details-outline text-base"></i>
            <span>ข้อมูลส่วนตัว (แก้ไข)</span>
          </div>
          <i class="mdi mdi-chevron-right text-xs opacity-60"></i>
        </button>

        <button
          type="button"
          class="w-full flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-black transition-all cursor-pointer text-left"
          :class="
            props.currentTab === 'addresses'
              ? 'bg-[#D96C2C] text-white shadow-md'
              : 'text-[#332820] hover:bg-[#F7F0E6]'
          "
          @click="emit('update:currentTab', 'addresses')"
        >
          <div class="flex items-center gap-2.5">
            <i class="mdi mdi-map-marker-radius-outline text-base"></i>
            <span>ที่อยู่จัดส่งของฉัน</span>
          </div>
          <i class="mdi mdi-chevron-right text-xs opacity-60"></i>
        </button>
      </div>

      <!-- SECTION 2: กิจกรรมและคอนเทนต์ -->
      <div class="space-y-1 border-t-2 border-[#E8D9C9] pt-3">
        <div
          class="flex items-center gap-2 px-3 py-1.5 text-xs font-black text-[#786B62] uppercase tracking-wider"
        >
          <i class="mdi mdi-newspaper-variant-outline text-[#D96C2C] text-base"></i>
          <span>กิจกรรมและคอนเทนต์</span>
        </div>

        <button
          type="button"
          class="w-full flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-black transition-all cursor-pointer text-left"
          :class="
            props.currentTab === 'contents'
              ? 'bg-[#D96C2C] text-white shadow-md'
              : 'text-[#332820] hover:bg-[#F7F0E6]'
          "
          @click="emit('update:currentTab', 'contents')"
        >
          <div class="flex items-center gap-2.5">
            <i class="mdi mdi-text-box-edit-outline text-base"></i>
            <span>คอนเทนต์ของคุณ</span>
          </div>
          <span
            class="rounded-full px-2 py-0.5 text-[11px] font-black"
            :class="
              props.currentTab === 'contents'
                ? 'bg-white/30 text-white'
                : 'bg-[#E8D9C9] text-[#332820]'
            "
          >
            {{ props.contentCount }}
          </span>
        </button>

        <button
          type="button"
          class="w-full flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-black transition-all cursor-pointer text-left"
          :class="
            props.currentTab === 'favorites'
              ? 'bg-[#D96C2C] text-white shadow-md'
              : 'text-[#332820] hover:bg-[#F7F0E6]'
          "
          @click="emit('update:currentTab', 'favorites')"
        >
          <div class="flex items-center gap-2.5">
            <i class="mdi mdi-heart-outline text-base"></i>
            <span>รายการโปรดที่บันทึกไว้</span>
          </div>
          <span
            class="rounded-full px-2 py-0.5 text-[11px] font-black"
            :class="
              props.currentTab === 'favorites'
                ? 'bg-white/30 text-white'
                : 'bg-[#E8D9C9] text-[#332820]'
            "
          >
            {{ props.favoriteCount }}
          </span>
        </button>
      </div>

      <!-- SECTION 3: ประวัติการเข้าชม -->
      <div class="space-y-1 border-t-2 border-[#E8D9C9] pt-3">
        <div
          class="flex items-center gap-2 px-3 py-1.5 text-xs font-black text-[#786B62] uppercase tracking-wider"
        >
          <i class="mdi mdi-history text-[#D96C2C] text-base"></i>
          <span>ประวัติการเข้าชม</span>
        </div>

        <button
          type="button"
          class="w-full flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-black transition-all cursor-pointer text-left"
          :class="
            props.currentTab === 'history'
              ? 'bg-[#D96C2C] text-white shadow-md'
              : 'text-[#332820] hover:bg-[#F7F0E6]'
          "
          @click="emit('update:currentTab', 'history')"
        >
          <div class="flex items-center gap-2.5">
            <i class="mdi mdi-clock-check-outline text-base"></i>
            <span>ประวัติการดู</span>
          </div>
          <span
            class="rounded-full px-2 py-0.5 text-[11px] font-black"
            :class="
              props.currentTab === 'history'
                ? 'bg-white/30 text-white'
                : 'bg-[#E8D9C9] text-[#332820]'
            "
          >
            {{ props.historyCount }}
          </span>
        </button>
      </div>

      <!-- SECTION 4: การซื้อของฉัน -->
      <div class="space-y-1 border-t-2 border-[#E8D9C9] pt-3">
        <div
          class="flex items-center gap-2 px-3 py-1.5 text-xs font-black text-[#786B62] uppercase tracking-wider"
        >
          <i class="mdi mdi-shopping-outline text-[#D96C2C] text-base"></i>
          <span>การซื้อของฉัน</span>
        </div>

        <button
          type="button"
          class="w-full flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-black transition-all cursor-pointer text-left"
          :class="
            props.currentTab === 'orders'
              ? 'bg-[#D96C2C] text-white shadow-md'
              : 'text-[#332820] hover:bg-[#F7F0E6]'
          "
          @click="emit('update:currentTab', 'orders')"
        >
          <div class="flex items-center gap-2.5">
            <i class="mdi mdi-package-variant-closed text-base"></i>
            <span>คำสั่งซื้อของฉัน</span>
          </div>
          <span
            class="rounded-full px-2 py-0.5 text-[11px] font-black"
            :class="
              props.currentTab === 'orders'
                ? 'bg-white/30 text-white'
                : 'bg-[#E8D9C9] text-[#332820]'
            "
          >
            {{ props.orderCount }}
          </span>
        </button>
      </div>

      <!-- SECTION 5: ร้านค้าของฉัน (My Shop) -->
      <div class="space-y-1 border-t-2 border-[#E8D9C9] pt-3">
        <div
          class="flex items-center justify-between px-3 py-1.5 text-xs font-black text-[#786B62] uppercase tracking-wider"
        >
          <span class="flex items-center gap-2">
            <i class="mdi mdi-store-cog-outline text-[#D96C2C] text-base"></i>
            <span>ร้านค้าของฉัน</span>
          </span>
          <span
            v-if="props.shop"
            class="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800"
          >
            ผู้ขาย
          </span>
        </div>

        <!-- If user has shop: Show shop tab -->
        <button
          type="button"
          class="w-full flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-black transition-all cursor-pointer text-left"
          :class="
            props.currentTab === 'shop'
              ? 'bg-[#D96C2C] text-white shadow-md'
              : 'text-[#332820] hover:bg-[#F7F0E6]'
          "
          @click="emit('update:currentTab', 'shop')"
        >
          <div class="flex items-center gap-2.5 min-w-0 flex-1">
            <i class="mdi mdi-storefront-outline text-base shrink-0"></i>
            <span class="truncate">{{ props.shop ? props.shop.shopName : 'เปิดร้านค้าของคุณ' }}</span>
          </div>
          <span
            class="rounded-full px-2 py-0.5 text-[10px] font-black shrink-0 ml-1.5"
            :class="
              props.currentTab === 'shop'
                ? 'bg-white/30 text-white'
                : props.shop
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
            "
          >
            {{ props.shop ? 'เปิดร้าน' : '+ สร้างรายได้' }}
          </span>
        </button>
      </div>
    </div>

    <!-- Help Card Box (Like Reference Image) -->
    <div
      class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-4 text-xs font-semibold text-[#786B62] space-y-2 shadow-2xs"
    >
      <div class="flex items-center gap-2 font-black text-[#332820]">
        <i class="mdi mdi-help-circle-outline text-[#D96C2C] text-base"></i>
        <span>ต้องการความช่วยเหลือ?</span>
      </div>
      <p class="text-[11px] leading-relaxed">
        มีข้อสงสัยเกี่ยวกับการใช้งาน แจ้งปัญหา หรือสอบถามข้อมูลเพิ่มเติมได้ตลอด 24 ชม.
      </p>
      <a
        href="#"
        class="inline-flex items-center gap-1 font-black text-[#D96C2C] hover:underline pt-1 text-xs"
      >
        <span>ศูนย์ช่วยเหลือ Kanchanaburi Platform</span>
        <i class="mdi mdi-arrow-right text-xs"></i>
      </a>
    </div>

    <!-- Logout Action Button -->
    <button
      type="button"
      class="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-rose-200 bg-rose-50/70 p-3 text-xs sm:text-sm font-black text-rose-600 transition hover:bg-rose-100 active:scale-95 cursor-pointer shadow-2xs"
      @click="emit('logout')"
    >
      <i class="mdi mdi-logout text-base"></i>
      <span>ออกจากระบบ</span>
    </button>
  </aside>
</template>
