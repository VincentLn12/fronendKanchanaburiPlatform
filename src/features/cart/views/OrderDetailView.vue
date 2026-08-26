<script setup lang="ts">
// Public storefront - Emerald Nature Order Detail View
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import http from '@/shared/api/http'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useSwal } from '@/plugins/sweetalert'

interface Item {
  orderItemId: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface Order {
  orderNumber: string
  subtotal: number
  shippingFee: number
  totalAmount: number
  orderStatus: string
  paymentStatus: string
  createdAt: string
  items: Item[]
  shippingMethod: string
  receiverName?: string
  receiverPhone?: string
  shippingAddress?: string
  shipment?: { shippingProvider?: string; trackingNumber?: string; shippingStatus: string; shippedAt?: string; deliveredAt?: string }
}

const route = useRoute()
const order = ref<Order | null>(null)
const loading = ref(true)
const swal = useSwal()

const totalItems = computed(() => order.value?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0)

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

onMounted(async () => {
  try {
    const { data } = await http.get<Order>(`/orders/${route.params.id}`)
    order.value = data
  } catch (error) {
    await swal.error('ไม่พบออเดอร์', getApiErrorMessage(error, 'คำสั่งซื้อนี้อาจไม่มีอยู่ในระบบ'))
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-slate-50/60 pb-24">
    <!-- Top Navigation Bar -->
    <div class="border-b border-slate-200/80 bg-white shadow-xs">
      <div class="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
        <RouterLink
          to="/orders"
          class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
        >
          <i class="mdi mdi-arrow-left text-sm"></i>
          <span>กลับไปรายการคำสั่งซื้อทั้งหมด</span>
        </RouterLink>
      </div>
    </div>

    <!-- Main Container -->
    <main class="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <!-- Loading Skeleton -->
      <div v-if="loading" class="space-y-4">
        <div class="h-64 animate-pulse rounded-3xl bg-slate-200"></div>
      </div>

      <template v-else-if="order">
        <section class="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
          <!-- Header Banner -->
          <div class="border-b border-slate-100 bg-slate-50/60 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-slate-400">คำสั่งซื้อหมายเลข:</span>
                <h1 class="text-xl font-black text-slate-900 font-mono">#{{ order.orderNumber }}</h1>
              </div>
              <p class="mt-1 text-xs text-slate-500 flex items-center gap-1">
                <i class="mdi mdi-clock-outline text-slate-400"></i>
                <span>สั่งซื้อเมื่อ: {{ formatDate(order.createdAt) }}</span>
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <span
                class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold border"
                :class="
                  order.paymentStatus === 'Paid'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                "
              >
                <i :class="['mdi', order.paymentStatus === 'Paid' ? 'mdi-check-circle' : 'mdi-clock-outline']"></i>
                {{ order.paymentStatus === 'Paid' ? 'ชำระเงินแล้ว' : 'รอการชำระเงิน' }}
              </span>

              <span class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 border border-slate-200">
                {{ getStatusTitle(order.orderStatus) }}
              </span>
            </div>
          </div>

          <!-- Items List -->
          <div class="p-6 sm:p-8 space-y-6">
            <h2 class="flex items-center gap-2 text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              <i class="mdi mdi-package-variant-closed text-emerald-600 text-xl"></i>
              รายการสินค้า ({{ totalItems }} ชิ้น)
            </h2>

            <div class="space-y-3">
              <div
                v-for="item in order.items"
                :key="item.orderItemId"
                class="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4 border border-slate-100"
              >
                <div>
                  <h3 class="font-bold text-slate-900 text-sm">{{ item.productName }}</h3>
                  <p class="mt-1 text-xs text-slate-500 font-medium">
                    ฿ {{ Number(item.unitPrice).toLocaleString('th-TH') }} × {{ item.quantity }} ชิ้น
                  </p>
                </div>
                <div class="text-right font-extrabold text-slate-900 text-sm">
                  ฿ {{ Number(item.totalPrice).toLocaleString('th-TH') }}
                </div>
              </div>
            </div>

            <!-- Summary Cost -->
            <div class="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
              <p class="font-bold text-slate-900">{{ order.shippingMethod === 'Pickup' ? 'รับสินค้าที่ร้าน' : 'ที่อยู่จัดส่ง' }}</p>
              <template v-if="order.shippingMethod !== 'Pickup'">
                <p class="mt-2">{{ order.receiverName }} · {{ order.receiverPhone }}</p>
                <p class="mt-1 whitespace-pre-line text-slate-600">{{ order.shippingAddress }}</p>
              </template>
            </div>
            <div v-if="order.shipment" class="rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm text-sky-900">
              <p class="font-bold">ข้อมูลการจัดส่ง</p>
              <p class="mt-2">{{ order.shipment.shippingProvider }}</p>
              <p class="mt-1 font-mono font-bold">{{ order.shipment.trackingNumber }}</p>
              <p class="mt-1 text-xs text-sky-700">สถานะ: {{ order.shipment.shippingStatus === 'Delivered' ? 'ส่งถึงแล้ว' : 'จัดส่งแล้ว' }}</p>
            </div>
            <div class="border-t border-slate-100 pt-6 space-y-3 text-sm">
              <div class="flex justify-between text-slate-600">
                <span>ราคาสินค้ารวม</span>
                <span class="font-medium text-slate-900">฿ {{ Number(order.subtotal).toLocaleString('th-TH') }}</span>
              </div>
              <div class="flex justify-between text-slate-600">
                <span>ค่าจัดส่ง</span>
                <span class="font-medium text-slate-900">฿ {{ Number(order.shippingFee).toLocaleString('th-TH') }}</span>
              </div>
              <div class="flex justify-between border-t border-slate-100 pt-4 text-base font-black">
                <span>ยอดรวมสุทธิ</span>
                <span class="text-xl text-emerald-700">฿ {{ Number(order.totalAmount).toLocaleString('th-TH') }}</span>
              </div>
            </div>

            <!-- Pay CTA if not paid -->
            <div v-if="order.paymentStatus !== 'Paid'" class="pt-4 flex justify-end">
              <RouterLink
                :to="`/orders/${$route.params.id}/pay`"
                class="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-700 transition"
              >
                <i class="mdi mdi-credit-card-outline text-lg"></i>
                <span>ไปที่หน้าชำระเงิน</span>
              </RouterLink>
            </div>
          </div>
        </section>
      </template>

      <div v-else class="py-20 text-center text-slate-500">
        <i class="mdi mdi-text-box-remove-outline text-4xl text-slate-300 mb-2 block"></i>
        ไม่พบข้อมูลคำสั่งซื้อนี้
      </div>
    </main>
  </div>
</template>
