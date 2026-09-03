<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import http from '@/shared/api/http'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useSwal } from '@/plugins/sweetalert'
import AppSelect from '@/components/common/input/AppSelect.vue'
import AppTextField from '@/components/common/input/AppTextField.vue'

interface Order {
  orderId: string
  orderNumber: string
  totalAmount: number
  orderStatus: string
  paymentStatus: string
  shippingMethod: string
  createdAt: string
}

const orderStatusOptions = [
  { title: 'ยืนยันออเดอร์', value: 'Confirmed' },
  { title: 'สำเร็จ', value: 'Completed' },
  { title: 'ยกเลิก', value: 'Cancelled' },
]

const shippingPresetProviders = [
  'Flash Express',
  'Kerry Express',
  'ไปรษณีย์ไทย (EMS)',
  'J&T Express',
  'Ninja Van',
]

const orders = ref<Order[]>([])
const allOrdersForStats = ref<Order[]>([])
const loading = ref(true)
const fetching = ref(false)
const updatingId = ref<string | null>(null)
const selectedFilter = ref<string>('all')
const searchNumber = ref<string>('')

// Date Filter States
const datePreset = ref<'all' | 'today' | '7days' | '30days' | 'custom'>('all')
const startDate = ref<string>('')
const endDate = ref<string>('')

const shipmentForms = ref<Record<string, { provider: string; trackingNumber: string }>>({})
const swal = useSwal()

// Load API with Backend Filtering (No flickering!)
async function load(isInitial = false) {
  if (isInitial) {
    loading.value = true
  } else {
    fetching.value = true
  }
  try {
    const params: Record<string, any> = {}
    
    if (selectedFilter.value !== 'all') {
      params.status = selectedFilter.value
    }
    if (searchNumber.value.trim()) {
      params.search = searchNumber.value.trim()
    }
    
    // Date filter params passed directly to Backend C# API
    if (datePreset.value === 'today') {
      const todayStr = new Date().toISOString().slice(0, 10)
      params.startDate = todayStr
      params.endDate = todayStr
    } else if (datePreset.value === '7days') {
      const past7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      params.startDate = past7
    } else if (datePreset.value === '30days') {
      const past30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      params.startDate = past30
    } else if (datePreset.value === 'custom') {
      if (startDate.value) params.startDate = startDate.value
      if (endDate.value) params.endDate = endDate.value
    }

    const { data } = await http.get<Order[]>('/orders/shop/mine', { params })
    orders.value = data
    if (isInitial || !allOrdersForStats.value.length) {
      allOrdersForStats.value = data
    }
  } catch (error) {
    await swal.error('โหลดออเดอร์ไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    loading.value = false
    fetching.value = false
  }
}

// Refetch from Backend API smoothly without skeleton flickering
watch([selectedFilter, searchNumber, datePreset, startDate, endDate], () => {
  void load(false)
})

const totalPaidCount = computed(() => allOrdersForStats.value.filter((o) => o.paymentStatus === 'Paid').length)
const totalPendingCount = computed(() => allOrdersForStats.value.filter((o) => o.paymentStatus !== 'Paid').length)
const totalShippedCount = computed(() => allOrdersForStats.value.filter((o) => o.orderStatus === 'Shipped' || o.orderStatus === 'Completed').length)

function clearDateFilter() {
  datePreset.value = 'all'
  startDate.value = ''
  endDate.value = ''
}

async function updateStatus(order: Order, status: string) {
  updatingId.value = order.orderId
  try {
    await http.patch(`/orders/${order.orderId}/status`, { status })
    order.orderStatus = status
    await swal.success('อัปเดตสถานะออเดอร์แล้ว', `เปลี่ยนสถานะเป็น "${getStatusTitle(status)}" เรียบร้อยแล้ว`)
  } catch (error) {
    await swal.error('อัปเดตไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    updatingId.value = null
  }
}

function shipmentForm(orderId: string) {
  shipmentForms.value[orderId] ??= { provider: 'Flash Express', trackingNumber: '' }
  return shipmentForms.value[orderId]
}

function selectPresetProvider(orderId: string, providerName: string) {
  shipmentForm(orderId).provider = providerName
}

async function shipOrder(order: Order) {
  const form = shipmentForm(order.orderId)
  if (!form.provider.trim() || !form.trackingNumber.trim()) {
    await swal.warning('กรอกข้อมูลไม่ครบ', 'กรุณาระบุบริษัทขนส่งและเลขพัสดุ')
    return
  }

  updatingId.value = order.orderId
  try {
    await http.put(`/orders/${order.orderId}/shipment`, {
      shippingProvider: form.provider.trim(),
      trackingNumber: form.trackingNumber.trim(),
    })
    order.orderStatus = 'Shipped'
    await swal.success('บันทึกการจัดส่งแล้ว', 'ระบบอัปเดตเลขพัสดุและแจ้งลูกค้าเรียบร้อยแล้ว')
  } catch (error) {
    await swal.error('บันทึกการจัดส่งไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    updatingId.value = null
  }
}

function getStatusTitle(status: string) {
  const match = orderStatusOptions.find((opt) => opt.value === status)
  if (match) return match.title
  if (status === 'Pending') return 'รอยืนยัน'
  if (status === 'Shipped') return 'จัดส่งแล้ว'
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

onMounted(() => void load(true))
</script>

<template>
  <div class="mx-auto w-full max-w-7xl space-y-6 py-4 text-[#332820] font-sans">
    <!-- Skeleton Loading -->
    <div v-if="loading" class="space-y-6">
      <div class="h-28 w-full animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9]"></div>
      <div v-for="i in 3" :key="i" class="h-44 w-full animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9]"></div>
    </div>

    <template v-else>
      <!-- HEADER BANNER CARD -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-6 shadow-xs">
        <div class="flex items-center gap-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D96C2C] text-white shadow-md shrink-0">
            <i class="mdi mdi-clipboard-text-clock-outline text-2xl text-white"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-2xl font-black text-[#332820]">จัดการออเดอร์ลูกค้า (Backend API Filtered)</h1>
              <span class="rounded-full bg-[#D96C2C]/10 px-3 py-0.5 text-xs font-black text-[#D96C2C] border border-[#D96C2C]/20">
                {{ orders.length }} ออเดอร์
              </span>
            </div>
            <p class="text-xs text-[#786B62] font-semibold mt-0.5">ระบบคำนวณและกรองข้อมูลจาก Backend API โดยตรง ช่วยให้ประมวลผลรวดเร็ว</p>
          </div>
        </div>

        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] px-5 py-2.5 text-xs font-black text-white shadow-md transition active:scale-95 cursor-pointer border border-[#D96C2C]"
          @click="() => void load(true)"
        >
          <i class="mdi mdi-refresh text-base text-white"></i>
          <span class="!text-white font-black">รีเฟรชออเดอร์</span>
        </button>
      </div>

      <!-- MERCHANT SUMMARY STAT CARDS -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Stat 1: Total Orders -->
        <div
          class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-4 shadow-2xs hover:border-[#D96C2C] transition cursor-pointer"
          @click="selectedFilter = 'all'"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-[#786B62]">ออเดอร์ทั้งหมด</span>
            <div class="flex h-8 w-8 items-center justify-center rounded-xl bg-[#332820]/10 text-[#332820]">
              <i class="mdi mdi-package-variant text-base"></i>
            </div>
          </div>
          <p class="text-2xl font-black text-[#332820] mt-2">{{ allOrdersForStats.length }}</p>
        </div>

        <!-- Stat 2: Paid Ready to Ship -->
        <div
          class="rounded-3xl border-2 border-emerald-300 bg-emerald-50/60 p-4 shadow-2xs hover:border-emerald-500 transition cursor-pointer"
          @click="selectedFilter = 'paid'"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-emerald-800">ชำระแล้ว (พร้อมจัดส่ง)</span>
            <div class="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <i class="mdi mdi-check-circle-outline text-base text-white"></i>
            </div>
          </div>
          <p class="text-2xl font-black text-emerald-700 mt-2">{{ totalPaidCount }}</p>
        </div>

        <!-- Stat 3: Pending Payment -->
        <div
          class="rounded-3xl border-2 border-amber-300 bg-amber-50/60 p-4 shadow-2xs hover:border-amber-500 transition cursor-pointer"
          @click="selectedFilter = 'pending_payment'"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-amber-800">รอชำระเงิน</span>
            <div class="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
              <i class="mdi mdi-clock-outline text-base text-white"></i>
            </div>
          </div>
          <p class="text-2xl font-black text-amber-700 mt-2">{{ totalPendingCount }}</p>
        </div>

        <!-- Stat 4: Shipped -->
        <div
          class="rounded-3xl border-2 border-sky-300 bg-sky-50/60 p-4 shadow-2xs hover:border-sky-500 transition cursor-pointer"
          @click="selectedFilter = 'Shipped'"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-sky-800">จัดส่งแล้ว</span>
            <div class="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-600 text-white shadow-xs">
              <i class="mdi mdi-truck-delivery-outline text-base text-white"></i>
            </div>
          </div>
          <p class="text-2xl font-black text-sky-700 mt-2">{{ totalShippedCount }}</p>
        </div>
      </div>

      <!-- FILTER TOOLBAR: STATUS TABS, DATE PICKER & SEARCH -->
      <div class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-5 shadow-xs space-y-4">
        
        <!-- ROW 1: STATUS TABS & SEARCH BAR -->
        <div class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <!-- Filter Tabs -->
          <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-1">
            <button
              type="button"
              class="px-4 py-2 rounded-2xl text-xs font-black transition shrink-0 flex items-center gap-1.5 cursor-pointer border-2"
              :class="selectedFilter === 'all' ? 'border-[#D96C2C] bg-[#D96C2C] text-white shadow-md' : 'border-[#E8D9C9] bg-white text-[#332820] hover:border-[#D96C2C]'"
              @click="selectedFilter = 'all'"
            >
              <span>ทั้งหมด</span>
            </button>

            <button
              type="button"
              class="px-4 py-2 rounded-2xl text-xs font-black transition shrink-0 flex items-center gap-1.5 cursor-pointer border-2"
              :class="selectedFilter === 'paid' ? 'border-emerald-600 bg-emerald-600 text-white shadow-md' : 'border-[#E8D9C9] bg-white text-[#332820] hover:border-emerald-500'"
              @click="selectedFilter = 'paid'"
            >
              <i class="mdi mdi-check-circle-outline"></i>
              <span>ชำระเงินแล้ว</span>
            </button>

            <button
              type="button"
              class="px-4 py-2 rounded-2xl text-xs font-black transition shrink-0 flex items-center gap-1.5 cursor-pointer border-2"
              :class="selectedFilter === 'pending_payment' ? 'border-amber-500 bg-amber-500 text-white shadow-md' : 'border-[#E8D9C9] bg-white text-[#332820] hover:border-amber-500'"
              @click="selectedFilter = 'pending_payment'"
            >
              <i class="mdi mdi-clock-outline"></i>
              <span>รอชำระเงิน</span>
            </button>

            <button
              type="button"
              class="px-4 py-2 rounded-2xl text-xs font-black transition shrink-0 flex items-center gap-1.5 cursor-pointer border-2"
              :class="selectedFilter === 'Shipped' ? 'border-sky-600 bg-sky-600 text-white shadow-md' : 'border-[#E8D9C9] bg-white text-[#332820] hover:border-sky-500'"
              @click="selectedFilter = 'Shipped'"
            >
              <i class="mdi mdi-truck-delivery-outline"></i>
              <span>จัดส่งแล้ว</span>
            </button>
          </div>

          <!-- Order Number Search Input -->
          <div class="relative min-w-[220px]">
            <input
              v-model="searchNumber"
              type="text"
              placeholder="ค้นหาเลขคำสั่งซื้อ..."
              class="w-full rounded-2xl border-2 border-[#E8D9C9] bg-white pl-9 pr-8 py-2 text-xs font-black text-[#332820] outline-none focus:border-[#D96C2C] transition"
            />
            <i class="mdi mdi-magnify absolute left-3 top-1/2 -translate-y-1/2 text-[#D96C2C] text-base"></i>
            <button
              v-if="searchNumber"
              type="button"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#786B62] hover:text-[#332820]"
              @click="searchNumber = ''"
            >
              <i class="mdi mdi-close-circle text-base"></i>
            </button>
          </div>
        </div>

        <!-- ROW 2: DATE RANGE PICKER FILTER BAR (PASSED TO BACKEND) -->
        <div class="pt-3 border-t-2 border-[#E8D9C9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-black text-[#332820] flex items-center gap-1.5 mr-1">
              <i class="mdi mdi-calendar-range text-[#D96C2C] text-base"></i>
              <span>ช่วงเวลา (Backend Filtered):</span>
            </span>

            <!-- Date Preset Quick Buttons -->
            <button
              type="button"
              class="px-3 py-1.5 rounded-xl font-black transition border-2 cursor-pointer"
              :class="datePreset === 'all' ? 'bg-[#D96C2C] text-white border-[#D96C2C]' : 'bg-white text-[#332820] border-[#E8D9C9] hover:border-[#D96C2C]'"
              @click="clearDateFilter"
            >
              ทุกช่วงเวลา
            </button>

            <button
              type="button"
              class="px-3 py-1.5 rounded-xl font-black transition border-2 cursor-pointer"
              :class="datePreset === 'today' ? 'bg-[#D96C2C] text-white border-[#D96C2C]' : 'bg-white text-[#332820] border-[#E8D9C9] hover:border-[#D96C2C]'"
              @click="datePreset = 'today'"
            >
              วันนี้
            </button>

            <button
              type="button"
              class="px-3 py-1.5 rounded-xl font-black transition border-2 cursor-pointer"
              :class="datePreset === '7days' ? 'bg-[#D96C2C] text-white border-[#D96C2C]' : 'bg-white text-[#332820] border-[#E8D9C9] hover:border-[#D96C2C]'"
              @click="datePreset = '7days'"
            >
              7 วันล่าสุด
            </button>

            <button
              type="button"
              class="px-3 py-1.5 rounded-xl font-black transition border-2 cursor-pointer"
              :class="datePreset === '30days' ? 'bg-[#D96C2C] text-white border-[#D96C2C]' : 'bg-white text-[#332820] border-[#E8D9C9] hover:border-[#D96C2C]'"
              @click="datePreset = '30days'"
            >
              30 วันล่าสุด
            </button>

            <button
              type="button"
              class="px-3 py-1.5 rounded-xl font-black transition border-2 cursor-pointer"
              :class="datePreset === 'custom' ? 'bg-[#D96C2C] text-white border-[#D96C2C]' : 'bg-white text-[#332820] border-[#E8D9C9] hover:border-[#D96C2C]'"
              @click="datePreset = 'custom'"
            >
              ระบุช่วงวันที่...
            </button>
          </div>

          <!-- Custom Date Input Controls -->
          <div v-if="datePreset === 'custom'" class="flex items-center gap-2 bg-white p-2 rounded-2xl border-2 border-[#E8D9C9] shadow-2xs">
            <input
              v-model="startDate"
              type="date"
              class="rounded-xl border border-[#E8D9C9] px-2.5 py-1 text-xs font-black outline-none focus:border-[#D96C2C]"
            />
            <span class="font-bold text-[#786B62]">ถึง</span>
            <input
              v-model="endDate"
              type="date"
              class="rounded-xl border border-[#E8D9C9] px-2.5 py-1 text-xs font-black outline-none focus:border-[#D96C2C]"
            />
            <button
              type="button"
              class="text-xs font-black text-rose-600 hover:underline px-1"
              @click="clearDateFilter"
            >
              ล้าง
            </button>
          </div>
        </div>

      </div>

      <!-- Empty State -->
      <div
        v-if="allOrdersForStats.length === 0"
        class="my-8 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#E8D9C9] bg-[#FFF9F2] py-16 px-6 text-center shadow-xs"
      >
        <div class="flex h-20 w-20 items-center justify-center rounded-full bg-[#D96C2C]/15 text-[#D96C2C] mb-4 border border-[#D96C2C]/30">
          <i class="mdi mdi-clipboard-text-off-outline text-4xl"></i>
        </div>
        <h2 class="text-xl font-black text-[#332820]">ยังไม่มีรายการคำสั่งซื้อเข้ามาในร้าน</h2>
        <p class="mt-2 max-w-md text-xs sm:text-sm text-[#786B62] font-semibold leading-relaxed">
          เมื่อมีลูกค้าสั่งซื้อสินค้าจากร้านค้าของคุณ รายการคำสั่งซื้อจะปรากฏที่หน้านี้โดยอัตโนมัติ
        </p>
      </div>

      <!-- Empty Search/Filter Match -->
      <div
        v-else-if="orders.length === 0"
        class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-12 text-center text-[#786B62] font-semibold shadow-xs"
      >
        <i class="mdi mdi-text-box-search-outline text-4xl text-[#D96C2C] mb-2 block"></i>
        <p class="font-black text-[#332820]">ไม่พบรายการออเดอร์ในเงื่อนไขและช่วงเวลานี้</p>
        <button
          type="button"
          class="mt-3 text-xs font-black text-[#D96C2C] hover:underline"
          @click="() => { selectedFilter = 'all'; searchNumber = ''; clearDateFilter(); }"
        >
          ล้างตัวกรองและค้นหาใหม่
        </button>
      </div>

      <!-- ORDERS LIST CARDS -->
      <div v-else class="space-y-5">
        <article
          v-for="order in orders"
          :key="order.orderId"
          class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-5 sm:p-6 shadow-xs transition hover:shadow-xl hover:border-[#D96C2C] space-y-4"
        >
          <!-- Order Header Row -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#E8D9C9] pb-4">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="text-xs font-black text-[#786B62]">ออเดอร์:</span>
                <span class="text-base font-black text-[#332820] font-mono">
                  #{{ order.orderNumber }}
                </span>
              </div>
              <div class="text-xs text-[#786B62] font-semibold flex items-center gap-1">
                <i class="mdi mdi-clock-time-four-outline text-[#D96C2C]"></i>
                <span>สั่งซื้อเมื่อ: {{ formatDate(order.createdAt) }}</span>
              </div>
            </div>

            <div class="text-left sm:text-right">
              <span class="block text-[10px] text-[#786B62] font-black uppercase">ยอดรวมคำสั่งซื้อ</span>
              <span class="text-xl sm:text-2xl font-black text-[#D96C2C]">
                ฿ {{ Number(order.totalAmount).toLocaleString('th-TH') }}
              </span>
            </div>
          </div>

          <!-- Order Status & Badges -->
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex flex-wrap items-center gap-2">
              <!-- Payment Status Badge -->
              <span
                class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black border-2"
                :class="
                  order.paymentStatus === 'Paid'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                "
              >
                <i :class="['mdi', order.paymentStatus === 'Paid' ? 'mdi-check-circle' : 'mdi-clock-outline']"></i>
                {{ order.paymentStatus === 'Paid' ? 'ชำระเงินเรียบร้อย' : 'รอการชำระเงิน' }}
              </span>

              <!-- Current Order Status Badge -->
              <span class="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-black text-[#332820] border-2 border-[#E8D9C9]">
                <i class="mdi mdi-tag-outline text-[#D96C2C]"></i>
                สถานะ: {{ getStatusTitle(order.orderStatus) }}
              </span>

              <span class="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 text-xs font-black text-sky-800 border-2 border-sky-200">
                <i :class="['mdi', order.shippingMethod === 'Pickup' ? 'mdi-store-check-outline' : 'mdi-truck-outline']"></i>
                {{ order.shippingMethod === 'Pickup' ? 'รับที่ร้านค้า' : 'จัดส่งสินค้าทางพัสดุ' }}
              </span>
            </div>

            <!-- Update Order Status Dropdown -->
            <div class="flex items-center gap-3">
              <div class="w-full sm:w-56">
                <label class="block text-[10px] font-black uppercase tracking-wider text-[#786B62] mb-1">
                  เปลี่ยนสถานะออเดอร์
                </label>
                <AppSelect
                  :model-value="order.orderStatus"
                  :items="orderStatusOptions"
                  item-title="title"
                  item-value="value"
                  :disabled="order.paymentStatus !== 'Paid' || updatingId === order.orderId"
                  @update:model-value="updateStatus(order, String($event))"
                />
              </div>
            </div>
          </div>

          <!-- FULFILLMENT & SHIPPING FULFILL SECTION (FOR PAID & UNFULLFILLED ORDERS) -->
          <div
            v-if="order.paymentStatus === 'Paid' && order.shippingMethod !== 'Pickup' && order.orderStatus !== 'Shipped' && order.orderStatus !== 'Completed' && order.orderStatus !== 'Cancelled'"
            class="rounded-3xl border-2 border-[#D96C2C]/30 bg-white p-4 shadow-2xs space-y-3"
          >
            <div class="flex items-center justify-between border-b border-[#E8D9C9] pb-2">
              <div class="flex items-center gap-2">
                <i class="mdi mdi-truck-fast-outline text-xl text-[#D96C2C]"></i>
                <span class="font-black text-sm text-[#332820]">กรอกข้อมูลจัดส่งพัสดุ</span>
              </div>
              <span class="text-[11px] font-extrabold text-[#786B62]">เลือกขนส่งที่ใช้ส่งสินค้า</span>
            </div>

            <!-- Preset Delivery Company Chips -->
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-xs font-bold text-[#786B62] mr-1">ขนส่งยอดฮิต:</span>
              <button
                v-for="provider in shippingPresetProviders"
                :key="provider"
                type="button"
                class="px-2.5 py-1 rounded-xl text-xs font-black transition border cursor-pointer"
                :class="
                  shipmentForm(order.orderId).provider === provider
                    ? 'bg-[#D96C2C] text-white border-[#D96C2C] shadow-xs'
                    : 'bg-[#F7F0E6] text-[#332820] border-[#E8D9C9] hover:border-[#D96C2C]'
                "
                @click="selectPresetProvider(order.orderId, provider)"
              >
                {{ provider }}
              </button>
            </div>

            <!-- Provider & Tracking Input Fields -->
            <div class="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end pt-1">
              <AppTextField
                v-model="shipmentForm(order.orderId).provider"
                label="บริษัทขนส่ง *"
                placeholder="เช่น Flash Express, Kerry"
              />
              <AppTextField
                v-model="shipmentForm(order.orderId).trackingNumber"
                label="เลขพัสดุ (Tracking Number) *"
                placeholder="เช่น TH123456789"
              />
              <button
                type="button"
                class="rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] px-6 py-3 font-black text-xs sm:text-sm text-white shadow-md transition active:scale-95 disabled:opacity-60 cursor-pointer border border-[#D96C2C]"
                :disabled="updatingId === order.orderId"
                @click="shipOrder(order)"
              >
                <i class="mdi mdi-truck-check mr-1 text-white"></i>
                <span class="!text-white font-black">{{ updatingId === order.orderId ? 'กำลังบันทึก...' : 'ยืนยันการจัดส่ง' }}</span>
              </button>
            </div>
          </div>

          <!-- Unpaid Warning Banner -->
          <div v-if="order.paymentStatus !== 'Paid'" class="rounded-2xl bg-amber-100/80 px-4 py-2.5 text-xs text-amber-900 border border-amber-300 flex items-center gap-2 font-bold">
            <i class="mdi mdi-alert-circle-outline text-amber-700 text-lg shrink-0"></i>
            <span>ลูกค้ายังไม่ได้ชำระเงินในระบบ กรุณารอการชำระเงินสำเร็จก่อนจัดส่งสินค้า</span>
          </div>
        </article>
      </div>
    </template>
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
