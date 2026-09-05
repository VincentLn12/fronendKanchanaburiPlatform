<script setup lang="ts">
export interface OrderSummary {
  orderId: string
  orderNumber: string
  totalAmount: number
  orderStatus: string
  paymentStatus: string
  createdAt: string
}

interface Props {
  order: OrderSummary
}

const props = defineProps<Props>()

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
</script>

<template>
  <div
    class="overflow-hidden rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-5 sm:p-7 shadow-sm transition-all duration-200 hover:border-[#D96C2C] hover:shadow-md space-y-4"
  >
    <!-- Top Row: Order ID & Status Badges -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#E8D9C9] pb-4">
      <div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-[#786B62]">คำสั่งซื้อ:</span>
          <span class="font-mono text-base sm:text-lg font-black text-[#332820]">
            #{{ props.order.orderNumber }}
          </span>
        </div>
        <p class="mt-0.5 text-xs text-[#786B62] font-semibold flex items-center gap-1">
          <i class="mdi mdi-clock-outline text-[#D96C2C]"></i>
          <span>{{ formatDate(props.order.createdAt) }}</span>
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <!-- Payment Status Badge -->
        <span
          class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black border"
          :class="
            props.order.paymentStatus === 'Paid'
              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
              : 'bg-amber-100 text-amber-900 border-amber-300'
          "
        >
          <i
            :class="[
              'mdi',
              props.order.paymentStatus === 'Paid' ? 'mdi-check-circle' : 'mdi-clock-outline',
            ]"
          ></i>
          <span>{{ props.order.paymentStatus === 'Paid' ? 'ชำระเงินแล้ว' : 'รอชำระเงิน' }}</span>
        </span>

        <!-- Order Fulfillment Status Badge -->
        <span
          class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black border"
          :class="getStatusBadgeClass(props.order.orderStatus)"
        >
          <i :class="['mdi', getStatusIcon(props.order.orderStatus)]"></i>
          <span>{{ getStatusTitle(props.order.orderStatus) }}</span>
        </span>
      </div>
    </div>

    <!-- Bottom Row: Price & Actions -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
      <div>
        <span class="text-xs text-[#786B62] font-bold block">ยอดรวมคำสั่งซื้อ:</span>
        <span class="text-xl sm:text-2xl font-black text-[#D96C2C]">
          ฿ {{ Number(props.order.totalAmount).toLocaleString('th-TH') }}
        </span>
      </div>

      <div class="flex items-center gap-2.5 flex-wrap">
        <!-- View Detail Button -->
        <RouterLink
          :to="`/orders/${props.order.orderId}`"
          class="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#E8D9C9] bg-[#F7F0E6] px-4 py-2.5 text-xs sm:text-sm font-black text-[#332820] transition-all hover:border-[#D96C2C] hover:text-[#D96C2C] hover:bg-white shadow-xs cursor-pointer active:scale-95"
        >
          <span>ดูรายละเอียด</span>
          <i class="mdi mdi-arrow-right text-xs"></i>
        </RouterLink>

        <!-- Pay CTA Button (if not paid and not cancelled) -->
        <RouterLink
          v-if="props.order.paymentStatus !== 'Paid' && props.order.orderStatus !== 'Cancelled'"
          :to="`/orders/${props.order.orderId}/pay`"
          class="inline-flex items-center gap-1.5 rounded-xl bg-[#D96C2C] hover:bg-[#BF5720] px-5 py-2.5 text-xs sm:text-sm font-black text-white shadow-md transition-all border border-[#D96C2C] active:scale-95 cursor-pointer"
        >
          <i class="mdi mdi-credit-card-outline text-white"></i>
          <span class="!text-white">ชำระเงิน</span>
        </RouterLink>
      </div>
    </div>
  </div>
</template>
