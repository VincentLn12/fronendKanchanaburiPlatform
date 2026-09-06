<script setup lang="ts">
import { ref } from 'vue'
import AppSelect from '@/components/common/input/AppSelect.vue'
import ShipmentFulfillmentForm from './ShipmentFulfillmentForm.vue'
import { useSwal } from '@/plugins/sweetalert'

export interface OrderItem {
  orderId: string
  orderNumber: string
  totalAmount: number
  orderStatus: string
  paymentStatus: string
  shippingMethod: string
  createdAt: string
  slipImageUrl?: string
  slipUploadedAt?: string
}

const props = defineProps<{
  order: OrderItem
  orderStatusOptions: { title: string; value: string }[]
  updatingId?: string | null
}>()

const emit = defineEmits<{
  (e: 'update-status', payload: { order: OrderItem; status: string }): void
  (e: 'ship-order', payload: { order: OrderItem; provider: string; trackingNumber: string }): void
  (e: 'update-payment', payload: { order: OrderItem; paymentStatus: string }): void
}>()

const swal = useSwal()
const showSlipModal = ref(false)

function getStatusTitle(status: string) {
  const match = props.orderStatusOptions.find((opt) => opt.value === status)
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

async function handleApproveSlip() {
  const confirm = await swal.confirm(
    'ยืนยันอนุมัติสลิปชำระเงิน?',
    `ออเดอร์ #${props.order.orderNumber} ยอดเงิน ฿${props.order.totalAmount.toLocaleString('th-TH')}`,
  )
  if (confirm.isConfirmed) {
    showSlipModal.value = false
    emit('update-payment', { order: props.order, paymentStatus: 'Paid' })
  }
}

async function handleRejectSlip() {
  const confirm = await swal.confirm(
    'ปฏิเสธสลิปการโอนเงิน?',
    'ลูกค้าจะได้รับการแจ้งเตือนให้แนบสลิปใหม่',
  )
  if (confirm.isConfirmed) {
    showSlipModal.value = false
    emit('update-payment', { order: props.order, paymentStatus: 'Failed' })
  }
}
</script>

<template>
  <article
    class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-5 sm:p-6 shadow-xs transition hover:shadow-xl hover:border-[#D96C2C] space-y-4"
  >
    <!-- Order Header Row -->
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#E8D9C9] pb-4"
    >
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
          :class="{
            'bg-emerald-100 text-emerald-800 border-emerald-300': order.paymentStatus === 'Paid',
            'bg-orange-100 text-orange-900 border-orange-300 animate-pulse': order.paymentStatus === 'PendingVerification',
            'bg-amber-100 text-amber-800 border-amber-300': order.paymentStatus !== 'Paid' && order.paymentStatus !== 'PendingVerification',
          }"
        >
          <i
            :class="[
              'mdi',
              order.paymentStatus === 'Paid'
                ? 'mdi-check-circle'
                : order.paymentStatus === 'PendingVerification'
                  ? 'mdi-file-document-outline'
                  : 'mdi-clock-outline',
            ]"
          ></i>
          {{
            order.paymentStatus === 'Paid'
              ? 'ชำระเงินเรียบร้อย'
              : order.paymentStatus === 'PendingVerification'
                ? 'รอตรวจสอบสลิปโอนเงิน'
                : 'รอการชำระเงิน'
          }}
        </span>

        <!-- Current Order Status Badge -->
        <span
          class="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-black text-[#332820] border-2 border-[#E8D9C9]"
        >
          <i class="mdi mdi-tag-outline text-[#D96C2C]"></i>
          สถานะ: {{ getStatusTitle(order.orderStatus) }}
        </span>

        <span
          class="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 text-xs font-black text-sky-800 border-2 border-sky-200"
        >
          <i
            :class="[
              'mdi',
              order.shippingMethod === 'Pickup' ? 'mdi-store-check-outline' : 'mdi-truck-outline',
            ]"
          ></i>
          {{ order.shippingMethod === 'Pickup' ? 'รับที่ร้านค้า' : 'จัดส่งสินค้าทางพัสดุ' }}
        </span>

        <!-- Inspect Payment Slip Button -->
        <button
          v-if="order.paymentStatus === 'PendingVerification' || order.slipImageUrl"
          type="button"
          class="inline-flex items-center gap-1 rounded-full bg-[#D96C2C] hover:bg-[#BF5720] px-3.5 py-1 text-xs font-black text-white shadow-xs transition active:scale-95 cursor-pointer border border-[#D96C2C]"
          @click="showSlipModal = true"
        >
          <i class="mdi mdi-eye-outline text-sm text-white"></i>
          <span class="!text-white font-black">ตรวจสอบสลิปโอนเงิน</span>
        </button>
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
            @update:model-value="emit('update-status', { order, status: String($event) })"
          />
        </div>
      </div>
    </div>

    <!-- FULFILLMENT & SHIPPING FULFILL SECTION -->
    <ShipmentFulfillmentForm
      v-if="
        order.paymentStatus === 'Paid' &&
        order.shippingMethod !== 'Pickup' &&
        order.orderStatus !== 'Shipped' &&
        order.orderStatus !== 'Completed' &&
        order.orderStatus !== 'Cancelled'
      "
      :updating="updatingId === order.orderId"
      @submit="emit('ship-order', { order, ...$event })"
    />

    <!-- Pending Slip Notice -->
    <div
      v-if="order.paymentStatus === 'PendingVerification'"
      class="rounded-2xl bg-orange-100/90 p-4 text-xs text-orange-950 border-2 border-orange-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-bold shadow-xs"
    >
      <div class="flex items-center gap-2">
        <i class="mdi mdi-alert-decagram-outline text-orange-700 text-xl shrink-0"></i>
        <span>ลูกค้าได้แนบสลิปโอนเงินแล้ว กรุณาตรวจสอบหลักฐานและอนุมัติก่อนจัดส่งสินค้า</span>
      </div>
      <button
        type="button"
        class="shrink-0 px-4 py-2 rounded-xl bg-[#D96C2C] hover:bg-[#BF5720] text-white text-xs font-black transition cursor-pointer shadow-xs border border-[#D96C2C] flex items-center justify-center gap-1.5"
        @click="showSlipModal = true"
      >
        <i class="mdi mdi-file-find-outline text-white text-base"></i>
        <span class="!text-white font-black">เปิดดูสลิปการโอน</span>
      </button>
    </div>

    <!-- Unpaid Warning Banner -->
    <div
      v-else-if="order.paymentStatus !== 'Paid'"
      class="rounded-2xl bg-amber-100/80 px-4 py-2.5 text-xs text-amber-900 border border-amber-300 flex items-center gap-2 font-bold"
    >
      <i class="mdi mdi-alert-circle-outline text-amber-700 text-lg shrink-0"></i>
      <span>ลูกค้ายังไม่ได้ชำระเงินในระบบ กรุณารอการชำระเงินสำเร็จก่อนจัดส่งสินค้า</span>
    </div>

    <!-- Payment Slip Inspection Modal -->
    <div
      v-if="showSlipModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
      @click.self="showSlipModal = false"
    >
      <div class="relative w-full max-w-md rounded-3xl bg-[#FFF9F2] p-6 shadow-2xl border-2 border-[#E8D9C9] space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-[#E8D9C9] pb-3">
          <div>
            <h3 class="font-black text-[#332820] text-base sm:text-lg">สลิปการโอนเงิน</h3>
            <p class="text-xs text-[#786B62] font-semibold">ออเดอร์ #{{ order.orderNumber }} (฿{{ order.totalAmount.toLocaleString('th-TH') }})</p>
          </div>
          <button
            type="button"
            class="h-8 w-8 rounded-full bg-black/10 hover:bg-black/20 text-[#332820] flex items-center justify-center text-lg font-bold transition cursor-pointer"
            @click="showSlipModal = false"
          >
            <i class="mdi mdi-close"></i>
          </button>
        </div>

        <div v-if="order.slipImageUrl" class="rounded-2xl border-2 border-[#E8D9C9] overflow-hidden bg-black/5 p-2">
          <img :src="order.slipImageUrl" alt="หลักฐานสลิปการโอนเงิน" class="w-full max-h-96 object-contain rounded-xl" />
        </div>
        <div v-else class="rounded-2xl bg-amber-50 p-6 text-center text-amber-800 border border-amber-200 font-bold text-xs">
          ยังไม่มีรูปสลิปในระบบ
        </div>

        <div v-if="order.slipUploadedAt" class="text-xs text-[#786B62] font-semibold flex items-center justify-between bg-[#F7F0E6] p-3 rounded-xl">
          <span>เวลาที่แจ้งโอน:</span>
          <span class="font-black text-[#332820]">{{ formatDate(order.slipUploadedAt) }}</span>
        </div>

        <div class="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            class="py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition cursor-pointer shadow-md flex items-center justify-center gap-1"
            @click="handleRejectSlip"
          >
            <i class="mdi mdi-close-circle text-base"></i>
            <span>ปฏิเสธสลิป</span>
          </button>
          <button
            type="button"
            class="py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs transition cursor-pointer shadow-md flex items-center justify-center gap-1"
            @click="handleApproveSlip"
          >
            <i class="mdi mdi-check-circle text-base"></i>
            <span>อนุมัติการชำระเงิน</span>
          </button>
        </div>
      </div>
    </div>
  </article>
</template>
