<script setup lang="ts">
// Public storefront - Orange + Cream Buyer Orders List View ("การซื้อของฉัน")
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
  if (status === 'Pending') return 'bg-amber-100 text-amber-900 border-amber-300'
  if (status === 'Confirmed') return 'bg-[#D96C2C]/15 text-[#D96C2C] border-[#D96C2C]/30'
  if (status === 'Shipped') return 'bg-sky-100 text-sky-900 border-sky-300'
  if (status === 'Completed') return 'bg-emerald-100 text-emerald-900 border-emerald-300'
  if (status === 'Cancelled') return 'bg-rose-100 text-rose-900 border-rose-300'
  return 'bg-[#F7F0E6] text-[#786B62] border-[#E8D9C9]'
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
  <div class="min-h-screen bg-[#F7F0E6] text-[#332820] pb-24">
    <!-- Header Hero Banner Section -->
    <section class="relative overflow-hidden bg-[#171412] pt-12 pb-16 text-white shadow-md">
      <!-- Ambient Decorative Glows -->
      <div class="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#D96C2C]/20 blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-[#F2A65A]/15 blur-3xl pointer-events-none"></div>

      <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div class="space-y-2">
            <div class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#D96C2C]/30 px-3.5 py-1 text-xs font-black text-[#F2A65A] backdrop-blur-md">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F2A65A] opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-[#F2A65A]"></span>
              </span>
              <span>ศูนย์รวมการสั่งซื้อสินค้ากาญจนบุรี</span>
            </div>
            <h1 class="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              การซื้อของฉัน
            </h1>
            <p class="text-xs sm:text-sm text-[#F7F0E6]/80 max-w-lg font-semibold">
              ติดตามสถานะ ตรวจสอบประวัติ และจัดการคำสั่งซื้อสินค้าเมืองกาญจน์ได้ครบในที่เดียว
            </p>
          </div>

          <RouterLink
            to="/shops"
            class="inline-flex items-center gap-2 rounded-2xl border-2 border-white/20 bg-white/10 px-5 py-3 text-xs font-black text-white backdrop-blur-md shadow-lg transition duration-200 hover:bg-white/20 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <i class="mdi mdi-storefront-outline text-base text-[#F2A65A]"></i>
            <span class="text-white font-black">เลือกซื้อสินค้าเพิ่ม</span>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Main Content Container -->
    <main class="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 -mt-8">
      <!-- Loading Skeleton -->
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="h-36 animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] p-6 shadow-sm">
          <div class="h-4 w-1/3 bg-[#E8D9C9]/60 rounded mb-4"></div>
          <div class="h-4 w-1/4 bg-[#E8D9C9]/40 rounded mb-2"></div>
          <div class="h-8 w-24 bg-[#D96C2C]/30 rounded float-right"></div>
        </div>
      </div>

      <template v-else>
        <!-- Navigation Tabs Container (High Contrast & Clear) -->
        <div class="mb-6 rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-2 shadow-md">
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            <!-- 1. ทั้งหมด -->
            <button
              class="flex items-center justify-center gap-2 rounded-2xl px-3.5 py-3 text-xs sm:text-sm font-black transition-all duration-200 cursor-pointer text-center"
              :class="
                selectedFilter === 'all'
                  ? 'bg-[#D96C2C] text-white shadow-md shadow-[#D96C2C]/30 scale-[1.02] border border-[#D96C2C]'
                  : 'bg-[#F7F0E6] border border-[#E8D9C9] text-[#332820] hover:border-[#D96C2C] hover:text-[#D96C2C]'
              "
              @click="selectedFilter = 'all'"
            >
              <i class="mdi mdi-format-list-bulleted text-base"></i>
              <span>ทั้งหมด</span>
              <span
                class="rounded-full px-2 py-0.5 text-xs font-black"
                :class="selectedFilter === 'all' ? 'bg-white/25 text-white' : 'bg-[#E8D9C9] text-[#332820]'"
              >
                {{ counts.all }}
              </span>
            </button>

            <!-- 2. ที่ต้องชำระ -->
            <button
              class="flex items-center justify-center gap-2 rounded-2xl px-3.5 py-3 text-xs sm:text-sm font-black transition-all duration-200 cursor-pointer text-center"
              :class="
                selectedFilter === 'to_pay'
                  ? 'bg-[#D96C2C] text-white shadow-md shadow-[#D96C2C]/30 scale-[1.02] border border-[#D96C2C]'
                  : 'bg-[#F7F0E6] border border-[#E8D9C9] text-[#332820] hover:border-[#D96C2C] hover:text-[#D96C2C]'
              "
              @click="selectedFilter = 'to_pay'"
            >
              <i class="mdi mdi-wallet-outline text-base"></i>
              <span>ที่ต้องชำระ</span>
              <span
                class="rounded-full px-2 py-0.5 text-xs font-black"
                :class="selectedFilter === 'to_pay' ? 'bg-white/25 text-white' : 'bg-[#E8D9C9] text-[#332820]'"
              >
                {{ counts.to_pay }}
              </span>
            </button>

            <!-- 3. ที่ต้องได้รับ -->
            <button
              class="flex items-center justify-center gap-2 rounded-2xl px-3.5 py-3 text-xs sm:text-sm font-black transition-all duration-200 cursor-pointer text-center"
              :class="
                selectedFilter === 'to_receive'
                  ? 'bg-[#D96C2C] text-white shadow-md shadow-[#D96C2C]/30 scale-[1.02] border border-[#D96C2C]'
                  : 'bg-[#F7F0E6] border border-[#E8D9C9] text-[#332820] hover:border-[#D96C2C] hover:text-[#D96C2C]'
              "
              @click="selectedFilter = 'to_receive'"
            >
              <i class="mdi mdi-truck-delivery-outline text-base"></i>
              <span>ที่ต้องได้รับ</span>
              <span
                class="rounded-full px-2 py-0.5 text-xs font-black"
                :class="selectedFilter === 'to_receive' ? 'bg-white/25 text-white' : 'bg-[#E8D9C9] text-[#332820]'"
              >
                {{ counts.to_receive }}
              </span>
            </button>

            <!-- 4. สำเร็จ -->
            <button
              class="flex items-center justify-center gap-2 rounded-2xl px-3.5 py-3 text-xs sm:text-sm font-black transition-all duration-200 cursor-pointer text-center"
              :class="
                selectedFilter === 'completed'
                  ? 'bg-[#D96C2C] text-white shadow-md shadow-[#D96C2C]/30 scale-[1.02] border border-[#D96C2C]'
                  : 'bg-[#F7F0E6] border border-[#E8D9C9] text-[#332820] hover:border-[#D96C2C] hover:text-[#D96C2C]'
              "
              @click="selectedFilter = 'completed'"
            >
              <i class="mdi mdi-check-circle-outline text-base"></i>
              <span>สำเร็จ</span>
              <span
                class="rounded-full px-2 py-0.5 text-xs font-black"
                :class="selectedFilter === 'completed' ? 'bg-white/25 text-white' : 'bg-[#E8D9C9] text-[#332820]'"
              >
                {{ counts.completed }}
              </span>
            </button>

            <!-- 5. ยกเลิกแล้ว -->
            <button
              class="flex items-center justify-center gap-2 rounded-2xl px-3.5 py-3 text-xs sm:text-sm font-black transition-all duration-200 cursor-pointer text-center col-span-2 sm:col-span-1"
              :class="
                selectedFilter === 'cancelled'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 scale-[1.02] border border-rose-600'
                  : 'bg-[#F7F0E6] border border-[#E8D9C9] text-[#332820] hover:border-rose-500 hover:text-rose-600'
              "
              @click="selectedFilter = 'cancelled'"
            >
              <i class="mdi mdi-close-circle-outline text-base"></i>
              <span>ยกเลิกแล้ว</span>
              <span
                class="rounded-full px-2 py-0.5 text-xs font-black"
                :class="selectedFilter === 'cancelled' ? 'bg-white/25 text-white' : 'bg-[#E8D9C9] text-[#332820]'"
              >
                {{ counts.cancelled }}
              </span>
            </button>
          </div>
        </div>

        <!-- Global Empty State -->
        <div
          v-if="!orders.length"
          class="my-8 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#E8D9C9] bg-[#FFF9F2] py-20 px-6 text-center shadow-sm space-y-3"
        >
          <div class="flex h-24 w-24 items-center justify-center rounded-full bg-[#D96C2C]/15 text-[#D96C2C] border border-[#D96C2C]/30 shadow-inner">
            <i class="mdi mdi-cart-remove text-5xl"></i>
          </div>
          <h2 class="text-2xl font-black text-[#332820] tracking-tight">คุณยังไม่มีรายการสั่งซื้อ</h2>
          <p class="mt-2 max-w-md text-xs sm:text-sm text-[#786B62] leading-relaxed font-semibold">
            เริ่มต้นค้นหาสินค้าดี สินค้าเด็ด ชุมชนเมืองกาญจน์ แล้วสั่งซื้อผ่านระบบได้อย่างรวดเร็ว
          </p>
          <RouterLink
            to="/shops"
            class="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] px-7 py-3.5 text-xs sm:text-sm font-black text-white shadow-lg transition duration-200 border border-[#D96C2C] active:scale-95 cursor-pointer"
          >
            <i class="mdi mdi-storefront text-base text-white"></i>
            <span class="!text-white font-black">สำรวจร้านค้ากาญจนบุรี</span>
          </RouterLink>
        </div>

        <!-- No Filter Matches Empty State -->
        <div
          v-else-if="filteredOrders.length === 0"
          class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-16 text-center shadow-sm space-y-2"
        >
          <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F7F0E6] text-[#786B62] border border-[#E8D9C9]">
            <i class="mdi mdi-text-box-search-outline text-3xl text-[#D96C2C]"></i>
          </div>
          <p class="text-base font-black text-[#332820]">ไม่พบรายการคำสั่งซื้อในหมวดหมู่นี้</p>
          <p class="text-xs text-[#786B62] font-semibold">ลองเลือกสลับไปยังแท็บอื่นเพื่อดูรายการสั่งซื้อของคุณ</p>
        </div>

        <!-- Orders List Grid -->
        <div v-else class="space-y-4">
          <article
            v-for="order in filteredOrders"
            :key="order.orderId"
            class="group rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 hover:border-[#D96C2C]"
          >
            <!-- Card Header -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#E8D9C9] pb-4">
              <div class="space-y-1">
                <div class="flex items-center gap-2.5">
                  <span class="text-xs font-extrabold text-[#786B62] uppercase tracking-wider">คำสั่งซื้อ:</span>
                  <span class="inline-flex items-center rounded-xl bg-[#F7F0E6] px-3 py-1 text-sm font-black text-[#332820] font-mono tracking-tight border border-[#E8D9C9]">
                    #{{ order.orderNumber }}
                  </span>
                </div>
                <div class="text-xs text-[#786B62] font-semibold flex items-center gap-1.5">
                  <i class="mdi mdi-clock-time-four-outline text-[#D96C2C]"></i>
                  <span>วันที่สั่งซื้อ: {{ formatDate(order.createdAt) }}</span>
                </div>
              </div>

              <!-- Price Tag -->
              <div class="text-left sm:text-right">
                <span class="block text-[10px] text-[#786B62] font-black uppercase tracking-wider">ยอดเงินสุทธิ</span>
                <span class="text-2xl font-black text-[#D96C2C] tracking-tight">
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
                  class="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-black border transition"
                  :class="
                    order.paymentStatus === 'Paid'
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                  "
                >
                  <i :class="['mdi', order.paymentStatus === 'Paid' ? 'mdi-check-circle' : 'mdi-clock-outline']"></i>
                  <span>{{ order.paymentStatus === 'Paid' ? 'ชำระเงินเรียบร้อย' : 'รอชำระเงิน' }}</span>
                </span>

                <!-- Order Status Badge -->
                <span
                  class="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-black border transition"
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
                  class="inline-flex items-center gap-1.5 rounded-2xl border-2 border-[#E8D9C9] bg-white px-4 py-2.5 text-xs font-black text-[#332820] transition hover:border-[#D96C2C] hover:text-[#D96C2C] active:scale-95 shadow-2xs"
                >
                  <i class="mdi mdi-file-document-outline text-sm text-[#D96C2C]"></i>
                  <span>ดูรายละเอียด</span>
                </RouterLink>

                <!-- Pay Button (SOLID VIBRANT ORANGE WITH CRISP WHITE BOLD TEXT) -->
                <RouterLink
                  v-if="order.paymentStatus !== 'Paid' && order.orderStatus !== 'Cancelled'"
                  :to="`/orders/${order.orderId}/pay`"
                  class="inline-flex items-center gap-1.5 rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] px-5 py-2.5 text-xs font-black text-white shadow-md transition duration-200 border border-[#D96C2C] active:scale-95 cursor-pointer"
                >
                  <i class="mdi mdi-credit-card-outline text-sm text-white"></i>
                  <span class="!text-white font-black">ชำระเงิน</span>
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
