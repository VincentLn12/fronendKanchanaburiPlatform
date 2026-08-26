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
  if (status === 'Confirmed') return 'ยืนยันออเดอร์แล้ว'
  if (status === 'Shipped') return 'จัดส่งแล้ว'
  if (status === 'Completed') return 'สำเร็จสมบูรณ์'
  if (status === 'Cancelled') return 'ยกเลิก'
  return status
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
  <div class="min-h-screen bg-slate-50/60 pb-24">
    <!-- Header Banner Section -->
    <section class="bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900 py-12 text-white shadow-sm">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3.5 py-1 text-xs font-semibold text-emerald-200 backdrop-blur-md mb-2">
              <i class="mdi mdi-package-variant-closed text-emerald-300"></i>
              <span>ประวัติการซื้อสินค้าเมืองกาญจน์</span>
            </div>
            <h1 class="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              การซื้อของฉัน
            </h1>
          </div>

          <RouterLink
            to="/shops"
            class="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/20"
          >
            <i class="mdi mdi-storefront-outline text-base"></i>
            <span>เลือกซื้อสินค้าเพิ่ม</span>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Main Content Container -->
    <main class="mx-auto max-w-5xl px-4 py-10 sm:px-6 -mt-6">
      <!-- Loading Skeleton -->
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="h-32 animate-pulse rounded-3xl bg-slate-200"></div>
      </div>

      <template v-else>
        <!-- Filter Tabs (5 Tabs) -->
        <div v-if="orders.length > 0" class="mb-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200/60">
          <!-- 1. ทั้งหมด -->
          <button
            class="flex items-center gap-1.5 shrink-0 rounded-2xl px-4 py-2.5 text-xs font-bold transition cursor-pointer"
            :class="selectedFilter === 'all' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'"
            @click="selectedFilter = 'all'"
          >
            <span>ทั้งหมด</span>
            <span class="rounded-full px-2 py-0.5 text-[10px]" :class="selectedFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'">
              {{ counts.all }}
            </span>
          </button>

          <!-- 2. ที่ต้องชำระ -->
          <button
            class="flex items-center gap-1.5 shrink-0 rounded-2xl px-4 py-2.5 text-xs font-bold transition cursor-pointer"
            :class="selectedFilter === 'to_pay' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'"
            @click="selectedFilter = 'to_pay'"
          >
            <i class="mdi mdi-wallet-outline text-sm"></i>
            <span>ที่ต้องชำระ</span>
            <span class="rounded-full px-2 py-0.5 text-[10px]" :class="selectedFilter === 'to_pay' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'">
              {{ counts.to_pay }}
            </span>
          </button>

          <!-- 3. ที่ต้องได้รับ -->
          <button
            class="flex items-center gap-1.5 shrink-0 rounded-2xl px-4 py-2.5 text-xs font-bold transition cursor-pointer"
            :class="selectedFilter === 'to_receive' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'"
            @click="selectedFilter = 'to_receive'"
          >
            <i class="mdi mdi-truck-delivery-outline text-sm"></i>
            <span>ที่ต้องได้รับ</span>
            <span class="rounded-full px-2 py-0.5 text-[10px]" :class="selectedFilter === 'to_receive' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'">
              {{ counts.to_receive }}
            </span>
          </button>

          <!-- 4. สำเร็จ -->
          <button
            class="flex items-center gap-1.5 shrink-0 rounded-2xl px-4 py-2.5 text-xs font-bold transition cursor-pointer"
            :class="selectedFilter === 'completed' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'"
            @click="selectedFilter = 'completed'"
          >
            <i class="mdi mdi-check-circle-outline text-sm"></i>
            <span>สำเร็จ</span>
            <span class="rounded-full px-2 py-0.5 text-[10px]" :class="selectedFilter === 'completed' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'">
              {{ counts.completed }}
            </span>
          </button>

          <!-- 5. ยกเลิกแล้ว -->
          <button
            class="flex items-center gap-1.5 shrink-0 rounded-2xl px-4 py-2.5 text-xs font-bold transition cursor-pointer"
            :class="selectedFilter === 'cancelled' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'"
            @click="selectedFilter = 'cancelled'"
          >
            <i class="mdi mdi-close-circle-outline text-sm"></i>
            <span>ยกเลิกแล้ว</span>
            <span class="rounded-full px-2 py-0.5 text-[10px]" :class="selectedFilter === 'cancelled' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'">
              {{ counts.cancelled }}
            </span>
          </button>
        </div>

        <!-- Empty State -->
        <div
          v-if="!orders.length"
          class="my-8 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white py-20 px-6 text-center shadow-sm"
        >
          <div class="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-4">
            <i class="mdi mdi-clipboard-list-outline text-4xl"></i>
          </div>
          <h2 class="text-2xl font-bold text-slate-800">คุณยังไม่มีรายการสั่งซื้อ</h2>
          <p class="mt-2 max-w-md text-sm text-slate-500">
            เลือกดูสินค้าขึ้นชื่อ และสั่งซื้อสินค้าจากร้านค้าในกาญจนบุรีได้ทันที
          </p>
          <RouterLink
            to="/shops"
            class="mt-6 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 active:scale-95"
          >
            <i class="mdi mdi-storefront"></i>
            <span>เลือกซื้อสินค้าเมืองกาญจน์</span>
          </RouterLink>
        </div>

        <!-- No Filter Matches -->
        <div
          v-else-if="filteredOrders.length === 0"
          class="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-sm"
        >
          <i class="mdi mdi-text-box-search-outline text-4xl text-slate-300 mb-2 block"></i>
          ไม่พบรายการสั่งซื้อในหมวดหมู่นี้
        </div>

        <!-- Orders List Grid -->
        <div v-else class="space-y-4">
          <article
            v-for="order in filteredOrders"
            :key="order.orderId"
            class="group rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs transition hover:shadow-md hover:border-emerald-300"
          >
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold text-slate-400">คำสั่งซื้อ:</span>
                  <span class="text-lg font-extrabold text-slate-900 font-mono">
                    #{{ order.orderNumber }}
                  </span>
                </div>
                <div class="text-xs text-slate-500 flex items-center gap-1">
                  <i class="mdi mdi-clock-time-four-outline text-slate-400"></i>
                  <span>วันที่สั่งซื้อ: {{ formatDate(order.createdAt) }}</span>
                </div>
              </div>

              <div class="text-left sm:text-right">
                <span class="block text-[11px] text-slate-400 font-semibold uppercase">ยอดเงินสุทธิ</span>
                <span class="text-2xl font-black text-emerald-700">
                  ฿ {{ Number(order.totalAmount).toLocaleString('th-TH') }}
                </span>
              </div>
            </div>

            <!-- Status & Action Footer -->
            <div class="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div class="flex flex-wrap items-center gap-2">
                <!-- Payment Status Badge -->
                <span
                  class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold border"
                  :class="
                    order.paymentStatus === 'Paid'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  "
                >
                  <i :class="['mdi', order.paymentStatus === 'Paid' ? 'mdi-check-circle' : 'mdi-clock-outline']"></i>
                  {{ order.paymentStatus === 'Paid' ? 'ชำระเงินเรียบร้อย' : 'รอชำระเงิน' }}
                </span>

                <!-- Order Status Badge -->
                <span class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 border border-slate-200">
                  <i class="mdi mdi-tag-outline"></i>
                  {{ getStatusTitle(order.orderStatus) }}
                </span>
              </div>

              <!-- Buttons -->
              <div class="flex items-center gap-2">
                <RouterLink
                  :to="`/orders/${order.orderId}`"
                  class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                >
                  <i class="mdi mdi-file-document-outline text-sm"></i>
                  <span>ดูรายละเอียด</span>
                </RouterLink>

                <RouterLink
                  v-if="order.paymentStatus !== 'Paid' && order.orderStatus !== 'Cancelled'"
                  :to="`/orders/${order.orderId}/pay`"
                  class="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition active:scale-95"
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

