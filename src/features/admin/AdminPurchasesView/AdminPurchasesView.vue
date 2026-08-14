<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm"
    >
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span
            class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 inline-flex items-center gap-1"
          >
            <v-icon icon="mdi-cash-register" size="14" />
            <span>ระบบการเงิน & คำสั่งซื้อ</span>
          </span>
        </div>
        <h1 class="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          ประวัติการชำระเงินและการสั่งซื้อ
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">
          ติดตามและตรวจสอบรายการสั่งซื้อคอร์สเรียนทั้งหมดในระบบแบบ Real-time
        </p>
      </div>

      <AppButton
        type="button"
        variant="tonal"
        color="indigo"
        size="default"
        class="!rounded-xl !px-4 font-bold normal-case shadow-sm hover:shadow transition-all"
        :loading="isLoading"
        title="รีเฟรชข้อมูลคำสั่งซื้อ"
        @click="fetchPurchases"
      >
        <div class="flex items-center gap-2">
          <v-icon icon="mdi-refresh" size="18" :class="{ 'animate-spin': isLoading }" />
          <span>รีเฟรชข้อมูล</span>
        </div>
      </AppButton>
    </div>

    <!-- Summary Metrics Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Card 1: Total Revenue -->
      <div
        class="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white p-5 rounded-2xl shadow-md shadow-indigo-600/15 flex flex-col justify-between"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-indigo-200"
            >ยอดขายรวมทั้งหมด</span
          >
          <div
            class="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white"
          >
            <v-icon icon="mdi-currency-usd" size="22" />
          </div>
        </div>
        <div class="mt-4">
          <p class="text-2xl sm:text-3xl font-black tracking-tight">
            ฿{{ formatPrice(totalRevenue) }}
          </p>
          <p class="text-xs text-indigo-200 mt-1 font-medium flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>คำนวณจากยอดชำระสำเร็จ</span>
          </p>
        </div>
        <!-- Decorative Glow -->
        <div
          class="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none"
        />
      </div>

      <!-- Card 2: Total Purchases -->
      <div
        class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500"
            >คำสั่งซื้อทั้งหมด</span
          >
          <div
            class="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100"
          >
            <v-icon icon="mdi-cart-outline" size="20" />
          </div>
        </div>
        <div class="mt-4">
          <p class="text-2xl sm:text-3xl font-black text-slate-900">
            {{ purchases.length }} <span class="text-sm font-semibold text-slate-500">รายการ</span>
          </p>
          <p class="text-xs text-slate-500 mt-1 font-medium">รายการทั้งหมดในระบบ</p>
        </div>
      </div>

      <!-- Card 3: Average Order Value -->
      <div
        class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500"
            >เฉลี่ยต่อคำสั่งซื้อ</span
          >
          <div
            class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100"
          >
            <v-icon icon="mdi-chart-line" size="20" />
          </div>
        </div>
        <div class="mt-4">
          <p class="text-2xl sm:text-3xl font-black text-slate-900">
            ฿{{ formatPrice(averageOrderValue) }}
          </p>
          <p class="text-xs text-slate-500 mt-1 font-medium">ยอดเฉลี่ยต่อรายการ</p>
        </div>
      </div>

      <!-- Card 4: Successful Payments -->
      <div
        class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500"
            >ชำระสำเร็จแล้ว</span
          >
          <div
            class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100"
          >
            <v-icon icon="mdi-check-decagram" size="20" />
          </div>
        </div>
        <div class="mt-4">
          <p class="text-2xl sm:text-3xl font-black text-emerald-600">
            {{ completedPurchases.length }}
            <span class="text-sm font-semibold text-slate-500">รายการ</span>
          </p>
          <p class="text-xs text-emerald-700 font-medium">สถานะชำระเงินเรียบร้อย</p>
        </div>
      </div>
    </div>

    <!-- Search Bar -->
    <AppSearch
      v-model="searchQuery"
      placeholder="ค้นหาชื่อผู้สั่งซื้อ, อีเมล หรือชื่อคอร์สเรียน..."
      :count="filteredPurchases.length"
      count-label="รายการ"
    />

    <!-- Reusable Central Data Table -->
    <AppDataTable
      :headers="headers"
      :items="filteredPurchases"
      :search="searchQuery"
      :loading="isLoading"
    >
      <!-- Order ID -->
      <template #item.id="{ item }">
        <span
          class="font-mono font-bold text-xs text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100/80 inline-block"
        >
          #{{ item.id }}
        </span>
      </template>

      <!-- User Info -->
      <template #item.user="{ item }">
        <div class="flex items-center gap-3 py-1">
          <div
            class="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-sm flex-shrink-0"
          >
            {{ item.userName?.charAt(0).toUpperCase() || 'U' }}
          </div>
          <div>
            <p class="font-bold text-slate-900 text-sm">
              {{ item.userName || 'ผู้ใช้งานทั่วไป' }}
            </p>
            <p class="text-xs text-slate-500 font-mono">
              {{ item.userEmail || '-' }}
            </p>
          </div>
        </div>
      </template>

      <!-- Course Title -->
      <template #item.courseTitle="{ item }">
        <div class="flex items-center gap-2">
          <v-icon icon="mdi-book-open-page-variant" size="16" class="text-indigo-500" />
          <span class="font-bold text-slate-800 text-sm">
            {{ item.courseTitle || 'คอร์สเรียนออนไลน์' }}
          </span>
        </div>
      </template>

      <!-- Price Badge -->
      <template #item.price="{ item }">
        <span
          class="bg-indigo-50/90 text-indigo-700 px-3 py-1 rounded-xl border border-indigo-100 font-extrabold text-sm inline-block shadow-2xs"
        >
          ฿{{ formatPrice(item.price || 0) }}
        </span>
      </template>

      <!-- Payment Method -->
      <template #item.paymentMethod="{ item }">
        <div class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <v-icon icon="mdi-credit-card-outline" size="16" class="text-slate-400" />
          <span>{{ item.paymentMethod || 'บัตรเครดิต / เดบิต' }}</span>
        </div>
      </template>

      <!-- Created Date -->
      <template #item.createdAt="{ item }">
        <span class="text-slate-500 font-mono text-xs">
          {{ formatDate(item.createdAt) }}
        </span>
      </template>

      <!-- Status Badge -->
      <template #item.status="{ item }">
        <div class="flex justify-center">
          <span
            class="px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 border"
            :class="[
              item.status === 'ยกเลิก' || item.status === 'ล้มเหลว'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200',
            ]"
          >
            <span
              class="w-1.5 h-1.5 rounded-full"
              :class="[
                item.status === 'ยกเลิก' || item.status === 'ล้มเหลว'
                  ? 'bg-rose-500'
                  : 'bg-emerald-500',
              ]"
            />
            <span>{{ item.status || 'ชำระเงินสำเร็จ' }}</span>
          </span>
        </div>
      </template>
    </AppDataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AppDataTable, { type DataTableHeader } from '@/components/common/AppDataTable.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppSearch from '@/components/common/AppSearch.vue'
import { purchaseService } from './services/purchase.service'
import type { PurchaseRecord } from './type/purchase'

const purchases = ref<PurchaseRecord[]>([])
const isLoading = ref(false)
const searchQuery = ref('')

const headers: DataTableHeader[] = [
  { title: 'รหัสรายการ', key: 'id', align: 'start' },
  { title: 'ผู้สั่งซื้อ', key: 'user', align: 'start' },
  { title: 'คอร์สเรียน', key: 'courseTitle', align: 'start' },
  { title: 'ราคาที่ชำระ', key: 'price', align: 'start' },
  { title: 'ช่องทางชำระเงิน', key: 'paymentMethod', align: 'start' },
  { title: 'วันที่ชำระเงิน', key: 'createdAt', align: 'start' },
  { title: 'สถานะ', key: 'status', align: 'center', sortable: false },
]

const totalRevenue = computed(() => {
  return purchases.value.reduce((sum, item) => sum + (item.price || 0), 0)
})

const completedPurchases = computed(() => {
  return purchases.value.filter((p) => p.status !== 'ยกเลิก' && p.status !== 'ล้มเหลว')
})

const averageOrderValue = computed(() => {
  if (purchases.value.length === 0) return 0
  return Math.round(totalRevenue.value / purchases.value.length)
})

const filteredPurchases = computed(() => {
  if (!searchQuery.value.trim()) return purchases.value
  const q = searchQuery.value.trim().toLowerCase()
  return purchases.value.filter(
    (p) =>
      p.userName?.toLowerCase().includes(q) ||
      p.userEmail?.toLowerCase().includes(q) ||
      p.courseTitle?.toLowerCase().includes(q) ||
      p.id?.toLowerCase().includes(q),
  )
})

function formatPrice(price: number) {
  return price.toLocaleString('th-TH')
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function fetchPurchases() {
  isLoading.value = true
  try {
    purchases.value = [...(await purchaseService.getAll())].reverse()
  } catch (err) {
    console.error('Failed to fetch purchases:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchPurchases)
</script>

