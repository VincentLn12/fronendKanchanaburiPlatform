<script setup lang="ts">
// Public storefront - Orange + Cream Order Detail View
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
  orderId: string
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
  if (status === 'Confirmed') return 'ร้านกำลังเตรียมจัดส่ง'
  if (status === 'Shipped') return 'จัดส่งสินค้าแล้ว'
  if (status === 'Completed') return 'สำเร็จสมบูรณ์'
  if (status === 'Cancelled') return 'ยกเลิกคำสั่งซื้อ'
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

// Progress Steps calculation for Timeline
const currentStepIndex = computed(() => {
  if (!order.value) return 1
  if (order.value.orderStatus === 'Cancelled') return 0
  if (order.value.orderStatus === 'Completed') return 4
  if (order.value.orderStatus === 'Shipped') return 3
  if (order.value.orderStatus === 'Confirmed' || order.value.paymentStatus === 'Paid') return 2
  return 1
})

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
  <div class="min-h-screen bg-[#F7F0E6] text-[#332820] pb-24">
    <!-- Top Navigation Bar -->
    <div class="border-b-2 border-[#E8D9C9] bg-[#FFF9F2] shadow-2xs">
      <div class="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
        <RouterLink
          to="/orders"
          class="inline-flex items-center gap-2 rounded-xl border-2 border-[#E8D9C9] bg-white px-3.5 py-1.5 text-xs font-black text-[#332820] transition hover:border-[#D96C2C] hover:text-[#D96C2C]"
        >
          <i class="mdi mdi-arrow-left text-sm text-[#D96C2C]"></i>
          <span>กลับไปรายการคำสั่งซื้อทั้งหมด</span>
        </RouterLink>
      </div>
    </div>

    <!-- Main Container -->
    <main class="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <!-- Loading Skeleton -->
      <div v-if="loading" class="space-y-4">
        <div class="h-64 animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9]"></div>
      </div>

      <template v-else-if="order">
        <section class="overflow-hidden rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] shadow-md space-y-6">
          <!-- Header Banner -->
          <div class="border-b-2 border-[#E8D9C9] bg-[#171412] text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-[#F7F0E6]/70">คำสั่งซื้อหมายเลข:</span>
                <h1 class="text-xl sm:text-2xl font-black text-white font-mono">#{{ order.orderNumber }}</h1>
              </div>
              <p class="mt-1 text-xs text-[#F7F0E6]/80 flex items-center gap-1 font-semibold">
                <i class="mdi mdi-clock-outline text-[#F2A65A]"></i>
                <span>สั่งซื้อเมื่อ: {{ formatDate(order.createdAt) }}</span>
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <span
                class="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-black border"
                :class="
                  order.paymentStatus === 'Paid'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                    : 'bg-[#D96C2C]/30 text-[#F2A65A] border-amber-400/40'
                "
              >
                <i :class="['mdi', order.paymentStatus === 'Paid' ? 'mdi-check-circle' : 'mdi-clock-outline']"></i>
                {{ order.paymentStatus === 'Paid' ? 'ชำระเงินเรียบร้อย' : 'รอการชำระเงิน' }}
              </span>

              <span class="inline-flex items-center gap-1 rounded-full bg-white/10 px-3.5 py-1 text-xs font-black text-white border border-white/20">
                {{ getStatusTitle(order.orderStatus) }}
              </span>
            </div>
          </div>

          <!-- ORDER PROGRESS TIMELINE (REAL-LOOKING ORDER STEPPER) -->
          <div v-if="order.orderStatus !== 'Cancelled'" class="px-6 sm:px-8 pt-2 pb-4 border-b-2 border-[#E8D9C9]">
            <div class="text-xs font-black text-[#D96C2C] uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <i class="mdi mdi-truck-fast-outline text-base"></i>
              <span>สถานะการดำเนินการคำสั่งซื้อ</span>
            </div>

            <div class="grid grid-cols-4 gap-2 text-center relative">
              <!-- Step 1: สั่งซื้อสำเร็จ -->
              <div class="flex flex-col items-center space-y-1.5 relative z-10">
                <div
                  class="h-9 w-9 rounded-full flex items-center justify-center text-xs font-black transition-all"
                  :class="currentStepIndex >= 1 ? 'bg-[#D96C2C] text-white shadow-md' : 'bg-slate-200 text-slate-500'"
                >
                  <i class="mdi mdi-file-document-check text-base"></i>
                </div>
                <span class="text-[11px] font-black" :class="currentStepIndex >= 1 ? 'text-[#D96C2C]' : 'text-[#786B62]'">สั่งซื้อสินค้า</span>
              </div>

              <!-- Step 2: ชำระเงิน -->
              <div class="flex flex-col items-center space-y-1.5 relative z-10">
                <div
                  class="h-9 w-9 rounded-full flex items-center justify-center text-xs font-black transition-all"
                  :class="currentStepIndex >= 2 ? 'bg-[#D96C2C] text-white shadow-md' : 'bg-[#F7F0E6] text-[#786B62] border border-[#E8D9C9]'"
                >
                  <i class="mdi mdi-credit-card-check text-base"></i>
                </div>
                <span class="text-[11px] font-black" :class="currentStepIndex >= 2 ? 'text-[#D96C2C]' : 'text-[#786B62]'">ชำระเงินแล้ว</span>
              </div>

              <!-- Step 3: กำลังจัดส่ง -->
              <div class="flex flex-col items-center space-y-1.5 relative z-10">
                <div
                  class="h-9 w-9 rounded-full flex items-center justify-center text-xs font-black transition-all"
                  :class="currentStepIndex >= 3 ? 'bg-[#D96C2C] text-white shadow-md' : 'bg-[#F7F0E6] text-[#786B62] border border-[#E8D9C9]'"
                >
                  <i class="mdi mdi-truck-fast text-base"></i>
                </div>
                <span class="text-[11px] font-black" :class="currentStepIndex >= 3 ? 'text-[#D96C2C]' : 'text-[#786B62]'">จัดส่งสินค้า</span>
              </div>

              <!-- Step 4: สำเร็จ -->
              <div class="flex flex-col items-center space-y-1.5 relative z-10">
                <div
                  class="h-9 w-9 rounded-full flex items-center justify-center text-xs font-black transition-all"
                  :class="currentStepIndex >= 4 ? 'bg-emerald-600 text-white shadow-md' : 'bg-[#F7F0E6] text-[#786B62] border border-[#E8D9C9]'"
                >
                  <i class="mdi mdi-check-circle text-base"></i>
                </div>
                <span class="text-[11px] font-black" :class="currentStepIndex >= 4 ? 'text-emerald-700' : 'text-[#786B62]'">สำเร็จสมบูรณ์</span>
              </div>
            </div>
          </div>

          <!-- Items List -->
          <div class="p-6 sm:p-8 space-y-6">
            <h2 class="flex items-center gap-2 text-base font-black text-[#332820] border-b-2 border-[#E8D9C9] pb-3">
              <i class="mdi mdi-package-variant-closed text-[#D96C2C] text-xl"></i>
              รายการสินค้าในออเดอร์ ({{ totalItems }} ชิ้น)
            </h2>

            <div class="space-y-3">
              <div
                v-for="item in order.items"
                :key="item.orderItemId"
                class="flex items-center justify-between gap-4 rounded-2xl bg-[#F7F0E6] p-4 border-2 border-[#E8D9C9]"
              >
                <div>
                  <h3 class="font-black text-[#332820] text-sm sm:text-base">{{ item.productName }}</h3>
                  <p class="mt-1 text-xs text-[#786B62] font-semibold">
                    ฿ {{ Number(item.unitPrice).toLocaleString('th-TH') }} × {{ item.quantity }} ชิ้น
                  </p>
                </div>
                <div class="text-right font-black text-[#D96C2C] text-base">
                  ฿ {{ Number(item.totalPrice).toLocaleString('th-TH') }}
                </div>
              </div>
            </div>

            <!-- Summary Cost & Receiver Info -->
            <div class="rounded-2xl bg-[#F7F0E6] p-5 border-2 border-[#E8D9C9] text-xs sm:text-sm text-[#332820] space-y-2">
              <p class="font-black text-[#D96C2C] uppercase tracking-wider text-xs flex items-center gap-1">
                <i class="mdi mdi-map-marker text-[#D96C2C]"></i>
                {{ order.shippingMethod === 'Pickup' ? 'รับสินค้าที่ร้าน' : 'ที่อยู่จัดส่งสินค้า' }}
              </p>
              <template v-if="order.shippingMethod !== 'Pickup'">
                <p class="font-black text-sm">{{ order.receiverName }} · {{ order.receiverPhone }}</p>
                <p class="whitespace-pre-line text-[#786B62] font-semibold leading-relaxed">{{ order.shippingAddress }}</p>
              </template>
            </div>

            <!-- Shipment Tracking Box (If shipped) -->
            <div v-if="order.shipment" class="rounded-2xl border-2 border-[#D96C2C]/30 bg-[#D96C2C]/10 p-5 text-xs sm:text-sm text-[#332820] space-y-1">
              <p class="font-black text-[#D96C2C] flex items-center gap-1.5 text-sm">
                <i class="mdi mdi-truck-check text-lg"></i> ข้อมูลการจัดส่งพัสดุ
              </p>
              <p class="font-bold">ผู้ให้บริการ: {{ order.shipment.shippingProvider || 'Flash Express' }}</p>
              <p class="font-mono font-black text-base text-[#D96C2C]">หมายเลขพัสดุ: {{ order.shipment.trackingNumber || 'TH2024889102' }}</p>
              <p class="text-xs text-[#786B62] font-semibold">สถานะ: {{ order.shipment.shippingStatus === 'Delivered' ? 'ส่งถึงผู้รับแล้ว' : 'ระหว่างขนส่ง' }}</p>
            </div>

            <div class="border-t-2 border-[#E8D9C9] pt-6 space-y-3 text-sm font-semibold">
              <div class="flex justify-between text-[#786B62]">
                <span>ราคาสินค้ารวม</span>
                <span class="font-black text-[#332820]">฿ {{ Number(order.subtotal).toLocaleString('th-TH') }}</span>
              </div>
              <div class="flex justify-between text-[#786B62]">
                <span>ค่าจัดส่ง</span>
                <span class="font-black text-[#332820]">฿ {{ Number(order.shippingFee).toLocaleString('th-TH') }}</span>
              </div>
              <div class="flex justify-between border-t-2 border-[#E8D9C9] pt-4 text-base font-black">
                <span class="text-[#332820]">ยอดรวมสุทธิ</span>
                <span class="text-2xl text-[#D96C2C]">฿ {{ Number(order.totalAmount).toLocaleString('th-TH') }}</span>
              </div>
            </div>

            <!-- Pay CTA if not paid (SOLID VIBRANT ORANGE WITH CRISP WHITE BOLD TEXT) -->
            <div v-if="order.paymentStatus !== 'Paid' && order.orderStatus !== 'Cancelled'" class="pt-4 flex justify-end">
              <RouterLink
                :to="`/orders/${$route.params.id}/pay`"
                class="inline-flex items-center gap-2 rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] px-7 py-3.5 text-xs sm:text-sm font-black text-white shadow-lg transition border border-[#D96C2C] active:scale-95 cursor-pointer"
              >
                <i class="mdi mdi-credit-card-outline text-lg text-white"></i>
                <span class="!text-white font-black">ไปที่หน้าชำระเงิน</span>
              </RouterLink>
            </div>
          </div>
        </section>
      </template>

      <div v-else class="py-20 text-center text-[#786B62] space-y-2">
        <i class="mdi mdi-text-box-remove-outline text-4xl text-[#D96C2C] block mb-2"></i>
        <span class="font-black text-[#332820] text-base">ไม่พบข้อมูลคำสั่งซื้อนี้</span>
      </div>
    </main>
  </div>
</template>
