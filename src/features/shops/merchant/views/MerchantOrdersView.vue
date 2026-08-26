<script setup lang="ts">
// Merchant area - Emerald Nature Customer Orders Management View
import { computed, onMounted, ref } from 'vue'
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

const orders = ref<Order[]>([])
const loading = ref(true)
const updatingId = ref<string | null>(null)
const selectedFilter = ref<string>('all')
const shipmentForms = ref<Record<string, { provider: string; trackingNumber: string }>>({})
const swal = useSwal()

async function load() {
  loading.value = true
  try {
    const { data } = await http.get<Order[]>('/orders/shop/mine')
    orders.value = data
  } catch (error) {
    await swal.error('โหลดออเดอร์ไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    loading.value = false
  }
}

const filteredOrders = computed(() => {
  if (selectedFilter.value === 'all') return orders.value
  if (selectedFilter.value === 'paid') return orders.value.filter((o) => o.paymentStatus === 'Paid')
  if (selectedFilter.value === 'pending_payment') return orders.value.filter((o) => o.paymentStatus !== 'Paid')
  return orders.value.filter((o) => o.orderStatus === selectedFilter.value)
})

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
  shipmentForms.value[orderId] ??= { provider: '', trackingNumber: '' }
  return shipmentForms.value[orderId]
}

async function shipOrder(order: Order) {
  const form = shipmentForm(order.orderId)
  if (!form.provider || !form.trackingNumber) {
    await swal.warning('กรอกข้อมูลไม่ครบ', 'กรุณาระบุบริษัทขนส่งและเลขพัสดุ')
    return
  }

  updatingId.value = order.orderId
  try {
    await http.put(`/orders/${order.orderId}/shipment`, {
      shippingProvider: form.provider,
      trackingNumber: form.trackingNumber,
    })
    order.orderStatus = 'Shipped'
    await swal.success('บันทึกการจัดส่งแล้ว', 'ลูกค้าสามารถติดตามเลขพัสดุจากรายละเอียดคำสั่งซื้อได้')
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
  <div class="mx-auto w-full max-w-7xl space-y-6 py-2">
    <!-- Skeleton Loading -->
    <div v-if="loading" class="space-y-6">
      <div class="h-24 w-full animate-pulse rounded-3xl bg-slate-200/70"></div>
      <div v-for="i in 3" :key="i" class="h-44 w-full animate-pulse rounded-3xl bg-slate-200/70"></div>
    </div>

    <template v-else>
      <!-- Header Banner Card -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div class="flex items-center gap-3.5">
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <i class="mdi mdi-clipboard-text-clock-outline text-2xl"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-xl font-extrabold text-slate-900">ออเดอร์ลูกค้า</h1>
              <span class="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                {{ orders.length }} ออเดอร์
              </span>
            </div>
            <p class="text-xs text-slate-500">ติดตามรายการคำสั่งซื้อจากลูกค้า การชำระเงิน และจัดการสถานะจัดส่ง</p>
          </div>
        </div>

        <button
          class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition"
          @click="load"
        >
          <i class="mdi mdi-refresh text-sm"></i>
          <span>รีเฟรชออเดอร์</span>
        </button>
      </div>

      <!-- Quick Filter Pills -->
      <div v-if="orders.length > 0" class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          class="flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-bold transition"
          :class="selectedFilter === 'all' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'"
          @click="selectedFilter = 'all'"
        >
          <span>ทั้งหมด</span>
          <span class="rounded-full px-1.5 py-0.2 text-[10px]" :class="selectedFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'">
            {{ orders.length }}
          </span>
        </button>

        <button
          class="flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-bold transition"
          :class="selectedFilter === 'paid' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'"
          @click="selectedFilter = 'paid'"
        >
          <i class="mdi mdi-check-circle-outline text-sm"></i>
          <span>ชำระเงินแล้ว</span>
          <span class="rounded-full px-1.5 py-0.2 text-[10px]" :class="selectedFilter === 'paid' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'">
            {{ orders.filter(o => o.paymentStatus === 'Paid').length }}
          </span>
        </button>

        <button
          class="flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-bold transition"
          :class="selectedFilter === 'pending_payment' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'"
          @click="selectedFilter = 'pending_payment'"
        >
          <i class="mdi mdi-clock-outline text-sm"></i>
          <span>รอชำระเงิน</span>
          <span class="rounded-full px-1.5 py-0.2 text-[10px]" :class="selectedFilter === 'pending_payment' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'">
            {{ orders.filter(o => o.paymentStatus !== 'Paid').length }}
          </span>
        </button>

        <button
          class="flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-bold transition"
          :class="selectedFilter === 'Shipped' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'"
          @click="selectedFilter = 'Shipped'"
        >
          <i class="mdi mdi-truck-delivery-outline text-sm"></i>
          <span>จัดส่งแล้ว</span>
          <span class="rounded-full px-1.5 py-0.2 text-[10px]" :class="selectedFilter === 'Shipped' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'">
            {{ orders.filter(o => o.orderStatus === 'Shipped').length }}
          </span>
        </button>
      </div>

      <!-- Empty State -->
      <div
        v-if="orders.length === 0"
        class="my-8 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white py-16 px-6 text-center shadow-sm"
      >
        <div class="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-4">
          <i class="mdi mdi-clipboard-text-off-outline text-4xl"></i>
        </div>
        <h2 class="text-xl font-bold text-slate-800">ยังไม่มีรายการคำสั่งซื้อเข้ามาในร้าน</h2>
        <p class="mt-2 max-w-md text-sm text-slate-500">
          เมื่อมีลูกค้าสั่งซื้อสินค้าจากร้านค้าของคุณ รายการคำสั่งซื้อจะปรากฏที่หน้านี้โดยอัตโนมัติ
        </p>
      </div>

      <!-- Empty Search/Filter Match -->
      <div
        v-else-if="filteredOrders.length === 0"
        class="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-sm"
      >
        <i class="mdi mdi-text-box-search-outline text-4xl text-slate-300 mb-2 block"></i>
        ไม่พบรายการออเดอร์ในหมวดหมู่นี้
      </div>

      <!-- Orders List -->
      <div v-else class="space-y-4">
        <article
          v-for="order in filteredOrders"
          :key="order.orderId"
          class="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs transition hover:shadow-md hover:border-emerald-300"
        >
          <!-- Order Header Row -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-slate-400">หมายเลขออเดอร์:</span>
                <span class="text-base font-extrabold text-slate-900 font-mono">
                  #{{ order.orderNumber }}
                </span>
              </div>
              <div class="text-xs text-slate-500 flex items-center gap-1">
                <i class="mdi mdi-clock-time-four-outline text-slate-400"></i>
                <span>สั่งซื้อเมื่อ: {{ formatDate(order.createdAt) }}</span>
              </div>
            </div>

            <div class="text-left sm:text-right">
              <span class="block text-[11px] text-slate-400 font-semibold uppercase">ยอดรวมคำสั่งซื้อ</span>
              <span class="text-xl font-black text-emerald-700">
                ฿ {{ Number(order.totalAmount).toLocaleString('th-TH') }}
              </span>
            </div>
          </div>

          <!-- Order Status & Actions Row -->
          <div class="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <!-- Badges -->
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
                {{ order.paymentStatus === 'Paid' ? 'ชำระเงินแล้ว' : 'รอชำระเงิน' }}
              </span>

              <!-- Current Order Status Badge -->
              <span class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 border border-slate-200">
                <i class="mdi mdi-tag-outline"></i>
                {{ getStatusTitle(order.orderStatus) }}
              </span>
              <span class="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700 border border-sky-200">
                <i :class="['mdi', order.shippingMethod === 'Pickup' ? 'mdi-store-check-outline' : 'mdi-truck-outline']"></i>
                {{ order.shippingMethod === 'Pickup' ? 'รับที่ร้าน' : 'จัดส่งถึงที่อยู่' }}
              </span>
            </div>

            <!-- Update Order Status Select -->
            <div class="flex items-center gap-3">
              <div class="w-full sm:w-56">
                <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
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

          <div
            v-if="order.paymentStatus === 'Paid' && order.shippingMethod !== 'Pickup' && order.orderStatus !== 'Shipped' && order.orderStatus !== 'Completed' && order.orderStatus !== 'Cancelled'"
            class="mt-4 grid gap-3 rounded-2xl border border-sky-100 bg-sky-50/60 p-4 md:grid-cols-[1fr_1fr_auto] md:items-end"
          >
            <AppTextField v-model="shipmentForm(order.orderId).provider" label="บริษัทขนส่ง" placeholder="เช่น Flash Express" />
            <AppTextField v-model="shipmentForm(order.orderId).trackingNumber" label="เลขพัสดุ" placeholder="ระบุ Tracking Number" />
            <button
              class="rounded-xl bg-sky-600 px-4 py-3 text-sm font-bold text-white hover:bg-sky-700 disabled:opacity-60"
              :disabled="updatingId === order.orderId"
              @click="shipOrder(order)"
            >
              {{ updatingId === order.orderId ? 'กำลังบันทึก...' : 'ยืนยันจัดส่ง' }}
            </button>
          </div>

          <div v-if="order.paymentStatus !== 'Paid'" class="mt-3 rounded-xl bg-amber-50/80 px-3.5 py-2 text-xs text-amber-700 border border-amber-100 flex items-center gap-1.5">
            <i class="mdi mdi-alert-circle-outline text-amber-600 text-sm"></i>
            <span>ลูกค้ายังไม่ได้ชำระเงินในระบบ กรุณารอการชำระเงินก่อนเปลี่ยนสถานะการจัดส่ง</span>
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
