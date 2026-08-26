<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { loadStripe, type Stripe, type StripeElements, type StripePaymentElement } from '@stripe/stripe-js'
import http from '@/shared/api/http'
import { useSwal } from '@/plugins/sweetalert'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'

const route = useRoute()
const router = useRouter()
const swal = useSwal()
const loading = ref(true)
const paying = ref(false)
const errorMessage = ref('')
let stripe: Stripe | null = null
let elements: StripeElements | null = null
let paymentElement: StripePaymentElement | null = null
onMounted(async () => {
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  if (!publishableKey) {
    errorMessage.value = 'ยังไม่ได้ตั้งค่า VITE_STRIPE_PUBLISHABLE_KEY'
    loading.value = false
    return
  }
  try {
    stripe = await loadStripe(publishableKey)
    if (!stripe) throw new Error('ไม่สามารถโหลด Stripe ได้')
    const { data } = await http.post<{ clientSecret: string }>(`/payments/orders/${route.params.id}/intent`)
    elements = stripe.elements({ clientSecret: data.clientSecret })
    paymentElement = elements.create('payment', { layout: 'tabs' })
    loading.value = false
    await nextTick()
    paymentElement.mount('#stripe-payment-element')
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'ไม่สามารถเปิดช่องทางชำระเงินได้')
    loading.value = false
  }
})
onBeforeUnmount(() => paymentElement?.destroy())
async function pay() {
  if (!stripe || !elements) return
  paying.value = true
  errorMessage.value = ''
  try {
    const result = await stripe.confirmPayment({ elements, confirmParams: { return_url: `${window.location.origin}/orders/${route.params.id}` }, redirect: 'if_required' })
    if (result.error) {
      errorMessage.value = result.error.message ?? 'ชำระเงินไม่สำเร็จ'
      return
    }
    if (result.paymentIntent?.status === 'succeeded') {
      await http.post(`/payments/orders/${route.params.id}/sync`)
      await swal.success('ชำระเงินสำเร็จ')
      await router.push('/orders')
    } else await swal.success('สร้างรายการชำระเงินแล้ว', 'กรุณาสแกน QR หรือทำรายการใน Stripe ให้เสร็จ')
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'ไม่สามารถสร้างรายการชำระเงินได้')
  } finally {
    paying.value = false
  }
}
</script>
<template>
  <main class="mx-auto max-w-xl px-4 py-10 sm:px-6">
    <section class="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
      <p class="font-semibold text-indigo-600">Stripe</p>
      <h1 class="mt-1 text-3xl font-bold text-slate-900">ชำระเงิน</h1>
      <p class="mt-2 text-sm text-slate-500">เลือกบัตรหรือ PromptPay เพื่อแสดง QR Code สำหรับสแกนจ่าย</p>
      <div v-if="loading" class="mt-8 h-1 animate-pulse rounded bg-indigo-600" />
      <template v-else
        ><p v-if="errorMessage" class="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {{ errorMessage }}
        </p>
        <div v-else class="mt-7">
          <div id="stripe-payment-element" />
          <button
            class="mt-6 w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white disabled:opacity-60"
            :disabled="paying"
            @click="pay"
          >
            {{ paying ? 'กำลังดำเนินการ...' : 'ดำเนินการชำระเงิน' }}
          </button>
        </div></template
      >
    </section>
  </main>
</template>
