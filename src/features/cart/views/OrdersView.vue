<script setup lang="ts">
// Public storefront - Emerald Nature Buyer Orders List View ("การซื้อของฉัน")
import { computed, onMounted, ref } from 'vue'
import http from '@/shared/api/http'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useSwal } from '@/plugins/sweetalert'

interface Order {
  orderId: string
  orderNumber: string
  totalAmount: number
  orderStatus: string
  paymentStatus: string
  createdAt: string
}

const orders = ref<Order[]>([])
const loading = ref(true)
const selectedFilter = ref<string>('all')
const swal = useSwal()

async function load() {
  loading.value = true
  try {
    const { data } = await http.get<Order[]>('/orders/mine')
    orders.value = data
  } catch (error) {
    await swal.error('โหลดคำสั่งซื้อไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    loading.value = false
  }
}

// Counts for each tab
const counts = computed(() => {
  return {
    all: orders.value.length,
    to_pay: orders.value.filter((o) => o.paymentStatus !== 'Paid' && o.orderStatus !== 'Cancelled').length,
    to_receive: orders.value.filter((o) => o.paymentStatus === 'Paid' && o.orderStatus !== 'Completed' && o.orderStatus !== 'Cancelled').length,
    completed: orders.value.filter((o) => o.orderStatus === 'Completed').length,
    cancelled: orders.value.filter((o) => o.orderStatus === 'Cancelled').length,
  }
})

const filteredOrders = computed(() => {
  if (selectedFilter.value === 'all') return orders.value
  if (selectedFilter.value === 'to_pay') {
    return orders.value.filter((o) => o.paymentStatus !== 'Paid' && o.orderStatus !== 'Cancelled')
  }
  if (selectedFilter.value === 'to_receive') {
    return orders.value.filter((o) => o.paymentStatus === 'Paid' && o.orderStatus !== 'Completed' && o.orderStatus !== 'Cancelled')
  }
  if (selectedFilter.value === 'completed') {
    return orders.value.filter((o) => o.orderStatus === 'Completed')
  }
  if (selectedFilter.value === 'cancelled') {
    return orders.value.filter((o) => o.orderStatus === 'Cancelled')
  }
  return orders.value
})

function getStatusTitle(status: string) {
  if (status === 'Pending') return 'รอยืนยันคำสั่งซื้อ'
  if (status === 'Confirmed') return 'ร้านกำลังเตรียมสินค้า'
  if (status === 'Shipped') return 'จัดส่งสินค้าแล้ว'
  if (status === 'Completed') return 'สำเร็จสมบูรณ์'
  if (status === 'Cancelled') return 'ยกเลิกคำสั่งซื้อ'
  return status
}

function getStatusBadgeClass(status: string) {
  if (status === 'Pending') return 'bg-amber-50 text-amber-700 border-amber-200/80'
  if (status === 'Confirmed') return 'bg-sky-50 text-sky-700 border-sky-200/80'
  if (status === 'Shipped') return 'bg-indigo-50 text-indigo-700 border-indigo-200/80'
  if (status === 'Completed') return 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
  if (status === 'Cancelled') return 'bg-rose-50 text-rose-700 border-rose-200/80'
  return 'bg-slate-50 text-slate-700 border-slate-200'
}

function getStatusIcon(status: string) {
  if (status === 'Pending') return 'mdi-clock-outline'
  if (status === 'Confirmed') return 'mdi-store-check-outline'
  if (status === 'Shipped') return 'mdi-truck-fast-outline'
  if (status === 'Completed') return 'mdi-check-decagram-outline'
  if (status === 'Cancelled') return 'mdi-close-circle-outline'
  return 'mdi-tag-outline'
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

onMounted(load)
</script>

<template>
  <div class="min-h-screen bg-slate-50/70 pb-24">
    <!-- Header Hero Banner Section -->
    <section class="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900 pt-12 pb-16 text-white shadow-md">
      <!-- Ambient Decorative Glows -->
      <div class="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none"></div>

      <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div class="space-y-2">
            <div class="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3.5 py-1 text-xs font-semibold text-emerald-200 backdrop-blur-md">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span>ศูนย์รวมการสั่งซื้อสินค้ากาญจนบุรี</span>
            </div>
            <h1 class="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              การซื้อของฉัน
            </h1>
            <p class="text-xs sm:text-sm text-emerald-100/70 max-w-lg">
              ติดตามสถานะ ตรวจสอบประวัติ และจัดการคำสั่งซื้อสินค้าเมืองกาญจน์ได้ครบในที่เดียว
            </p>
          </div>

          <RouterLink
            to="/shops"
            class="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-xs font-bold text-white backdrop-blur-md shadow-lg transition duration-200 hover:bg-white/20 hover:scale-105 active:scale-95"
          >
            <i class="mdi mdi-storefront-outline text-base text-emerald-300"></i>
            <span>เลือกซื้อสินค้าเพิ่ม</span>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Main Content Container -->
    <main class="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 -mt-8">
      <!-- Loading Skeleton -->
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="h-36 animate-pulse rounded-3xl bg-white border border-slate-200/60 p-6 shadow-sm">
          <div class="h-4 w-1/3 bg-slate-200 rounded mb-4"></div>
          <div class="h-4 w-1/4 bg-slate-200 rounded mb-2"></div>
          <div class="h-8 w-24 bg-slate-200 rounded float-right"></div>
        </div>
      </div>

      <template v-else>
        <!-- Navigation Tabs Container (High Contrast & Clear) -->
        <div class="mb-6 rounded-3xl border border-slate-300/80 bg-white p-2 shadow-md">
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            <!-- 1. ทั้งหมด -->
            <button
              class="flex items-center justify-center gap-2 rounded-2xl px-3.5 py-3 text-xs sm:text-sm font-extrabold transition-all duration-200 cursor-pointer text-center"
              :class="
                selectedFilter === 'all'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-[1.02]'
                  : 'bg-slate-100/80 border border-slate-200 text-slate-800 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300'
              "
              @click="selectedFilter = 'all'"
            >
              <i class="mdi mdi-format-list-bulleted text-base"></i>
              <span>ทั้งหมด</span>
              <span
                class="rounded-full px-2 py-0.5 text-xs font-black"
                :class="selectedFilter === 'all' ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-900'"
              >
                {{ counts.all }}
              </span>
            </button>

            <!-- 2. ที่ต้องชำระ -->
            <button
              class="flex items-center justify-center gap-2 rounded-2xl px-3.5 py-3 text-xs sm:text-sm font-extrabold transition-all duration-200 cursor-pointer text-center"
              :class="
                selectedFilter === 'to_pay'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 scale-[1.02]'
                  : 'bg-amber-50/80 border border-amber-200 text-amber-900 hover:bg-amber-100 hover:border-amber-400'
              "
              @click="selectedFilter = 'to_pay'"
            >
              <i class="mdi mdi-wallet-outline text-base"></i>
              <span>ที่ต้องชำระ</span>
              <span
                class="rounded-full px-2 py-0.5 text-xs font-black"
                :class="selectedFilter === 'to_pay' ? 'bg-white/25 text-white' : 'bg-amber-200 text-amber-950'"
              >
                {{ counts.to_pay }}
              </span>
            </button>

            <!-- 3. ที่ต้องได้รับ -->
            <button
              class="flex items-center justify-center gap-2 rounded-2xl px-3.5 py-3 text-xs sm:text-sm font-extrabold transition-all duration-200 cursor-pointer text-center"
              :class="
                selectedFilter === 'to_receive'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-[1.02]'
                  : 'bg-blue-50/80 border border-blue-200 text-blue-900 hover:bg-blue-100 hover:border-blue-400'
              "
              @click="selectedFilter = 'to_receive'"
            >
              <i class="mdi mdi-truck-delivery-outline text-base"></i>
              <span>ที่ต้องได้รับ</span>
              <span
                class="rounded-full px-2 py-0.5 text-xs font-black"
                :class="selectedFilter === 'to_receive' ? 'bg-white/25 text-white' : 'bg-blue-200 text-blue-950'"
              >
                {{ counts.to_receive }}
              </span>
            </button>

            <!-- 4. สำเร็จ -->
            <button
              class="flex items-center justify-center gap-2 rounded-2xl px-3.5 py-3 text-xs sm:text-sm font-extrabold transition-all duration-200 cursor-pointer text-center"
              :class="
                selectedFilter === 'completed'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-[1.02]'
                  : 'bg-emerald-50/80 border border-emerald-200 text-emerald-900 hover:bg-emerald-100 hover:border-emerald-400'
              "
              @click="selectedFilter = 'completed'"
            >
              <i class="mdi mdi-check-circle-outline text-base"></i>
              <span>สำเร็จ</span>
              <span
                class="rounded-full px-2 py-0.5 text-xs font-black"
                :class="selectedFilter === 'completed' ? 'bg-white/25 text-white' : 'bg-emerald-200 text-emerald-950'"
              >
                {{ counts.completed }}
              </span>
            </button>

            <!-- 5. ยกเลิกแล้ว -->
            <button
              class="flex items-center justify-center gap-2 rounded-2xl px-3.5 py-3 text-xs sm:text-sm font-extrabold transition-all duration-200 cursor-pointer text-center col-span-2 sm:col-span-1"
              :class="
                selectedFilter === 'cancelled'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 scale-[1.02]'
                  : 'bg-rose-50/80 border border-rose-200 text-rose-900 hover:bg-rose-100 hover:border-rose-400'
              "
              @click="selectedFilter = 'cancelled'"
            >
              <i class="mdi mdi-close-circle-outline text-base"></i>
              <span>ยกเลิกแล้ว</span>
              <span
                class="rounded-full px-2 py-0.5 text-xs font-black"
                :class="selectedFilter === 'cancelled' ? 'bg-white/25 text-white' : 'bg-rose-200 text-rose-950'"
              >
                {{ counts.cancelled }}
              </span>
            </button>
          </div>
        </div>

        <!-- Global Empty State -->
        <div
          v-if="!orders.length"
          class="my-8 flex flex-col items-center justify-center rounded-3xl border border-slate-200/80 bg-white py-20 px-6 text-center shadow-sm"
        >
          <div class="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-100 to-teal-50 text-emerald-600 mb-5 shadow-inner">
            <i class="mdi mdi-cart-remove text-5xl"></i>
          </div>
          <h2 class="text-2xl font-black text-slate-800 tracking-tight">คุณยังไม่มีรายการสั่งซื้อ</h2>
          <p class="mt-2 max-w-md text-sm text-slate-500 leading-relaxed">
            เริ่มต้นค้นหาสินค้าดี สินค้าเด็ด ชุมชนเมืองกาญจน์ แล้วสั่งซื้อผ่านระบบได้อย่างรวดเร็ว
          </p>
          <RouterLink
            to="/shops"
            class="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-7 py-3.5 text-xs font-extrabold text-white shadow-lg shadow-emerald-600/25 transition duration-200 hover:shadow-xl hover:shadow-emerald-600/35 hover:scale-105 active:scale-95"
          >
            <i class="mdi mdi-storefront text-base"></i>
            <span>สำรวจร้านค้ากาญจนบุรี</span>
          </RouterLink>
        </div>

        <!-- No Filter Matches Empty State -->
        <div
          v-else-if="filteredOrders.length === 0"
          class="rounded-3xl border border-slate-200/80 bg-white p-16 text-center shadow-sm"
        >
          <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
            <i class="mdi mdi-text-box-search-outline text-3xl"></i>
          </div>
          <p class="text-base font-bold text-slate-700">ไม่พบรายการคำสั่งซื้อในหมวดหมู่นี้</p>
          <p class="text-xs text-slate-400 mt-1">ลองเลือกสลับไปยังแท็บอื่นเพื่อดูรายการสั่งซื้อของคุณ</p>
        </div>

        <!-- Orders List Grid -->
        <div v-else class="space-y-4">
          <article
            v-for="order in filteredOrders"
            :key="order.orderId"
            class="group rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-emerald-900/5 hover:-translate-y-0.5 hover:border-emerald-300"
          >
            <!-- Card Header -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div class="space-y-1">
                <div class="flex items-center gap-2.5">
                  <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">คำสั่งซื้อ:</span>
                  <span class="inline-flex items-center rounded-xl bg-slate-100 px-2.5 py-1 text-sm font-black text-slate-900 font-mono tracking-tight">
                    #{{ order.orderNumber }}
                  </span>
                </div>
                <div class="text-xs text-slate-500 flex items-center gap-1.5">
                  <i class="mdi mdi-clock-time-four-outline text-slate-400"></i>
                  <span>วันที่สั่งซื้อ: {{ formatDate(order.createdAt) }}</span>
                </div>
              </div>

              <!-- Price Tag -->
              <div class="text-left sm:text-right">
                <span class="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">ยอดเงินสุทธิ</span>
                <span class="text-2xl font-black text-emerald-700 tracking-tight">
                  ฿ {{ Number(order.totalAmount).toLocaleString('th-TH') }}
                </span>
              </div>
            </div>

            <!-- Status Badges & Actions Footer -->
            <div class="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <!-- Badges Container -->
              <div class="flex flex-wrap items-center gap-2">
                <!-- Payment Status Badge -->
                <span
                  class="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold border transition"
                  :class="
                    order.paymentStatus === 'Paid'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                      : 'bg-amber-50 text-amber-700 border-amber-200/80'
                  "
                >
                  <i :class="['mdi', order.paymentStatus === 'Paid' ? 'mdi-check-circle' : 'mdi-clock-outline']"></i>
                  <span>{{ order.paymentStatus === 'Paid' ? 'ชำระเงินเรียบร้อย' : 'รอชำระเงิน' }}</span>
                </span>

                <!-- Order Status Badge -->
                <span
                  class="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold border transition"
                  :class="getStatusBadgeClass(order.orderStatus)"
                >
                  <i :class="['mdi', getStatusIcon(order.orderStatus)]"></i>
                  <span>{{ getStatusTitle(order.orderStatus) }}</span>
                </span>
              </div>

              <!-- Action Buttons -->
              <div class="flex items-center gap-2.5">
                <!-- View Detail Button -->
                <RouterLink
                  :to="`/orders/${order.orderId}`"
                  class="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 hover:border-slate-300 hover:text-slate-900 active:scale-95"
                >
                  <i class="mdi mdi-file-document-outline text-sm text-slate-500"></i>
                  <span>ดูรายละเอียด</span>
                </RouterLink>

                <!-- Pay Button (If unpaid & not cancelled) -->
                <RouterLink
                  v-if="order.paymentStatus !== 'Paid' && order.orderStatus !== 'Cancelled'"
                  :to="`/orders/${order.orderId}/pay`"
                  class="inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/25 transition duration-200 hover:shadow-lg hover:shadow-emerald-600/35 hover:scale-105 active:scale-95"
                >
                  <i class="mdi mdi-credit-card-outline text-sm"></i>
                  <span>ชำระเงิน</span>
                </RouterLink>
              </div>
            </div>
          </article>
        </div>
      </template>
    </main>
  </div>
</template>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>


