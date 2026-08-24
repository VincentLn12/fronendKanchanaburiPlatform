<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { loadStripe, type Stripe, type StripeCardCvcElement, type StripeCardExpiryElement, type StripeCardNumberElement } from '@stripe/stripe-js'
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
let cardNumber: StripeCardNumberElement | null = null
let cardExpiry: StripeCardExpiryElement | null = null
let cardCvc: StripeCardCvcElement | null = null
onMounted(async () => {
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  if (!publishableKey) {
    errorMessage.value = 'ยังไม่ได้ตั้งค่า VITE_STRIPE_PUBLISHABLE_KEY'
    loading.value = false
    return
  }
  stripe = await loadStripe(publishableKey)
  if (!stripe) {
    errorMessage.value = 'ไม่สามารถโหลด Stripe ได้'
    loading.value = false
    return
  }
  const elements = stripe.elements()
  const style = { base: { fontSize: '16px', color: '#0f172a' } }
  cardNumber = elements.create('cardNumber', { style })
  cardExpiry = elements.create('cardExpiry', { style })
  cardCvc = elements.create('cardCvc', { style })
  loading.value = false
  await nextTick()
  cardNumber.mount('#stripe-card-number')
  cardExpiry.mount('#stripe-card-expiry')
  cardCvc.mount('#stripe-card-cvc')
})
onBeforeUnmount(() => { cardNumber?.destroy(); cardExpiry?.destroy(); cardCvc?.destroy() })
async function pay() {
  if (!stripe || !cardNumber) return
  paying.value = true
  errorMessage.value = ''
  try {
    const { data } = await http.post<{ clientSecret: string }>(
      `/payments/orders/${route.params.id}/intent`,
    )
    const result = await stripe.confirmCardPayment(data.clientSecret, { payment_method: { card: cardNumber } })
    if (result.error) {
      errorMessage.value = result.error.message ?? 'ชำระเงินไม่สำเร็จ'
      return
    }
    await http.post(`/payments/orders/${route.params.id}/sync`)
    await swal.success('ชำระเงินสำเร็จ')
    await router.push('/orders')
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
      <div v-if="loading" class="mt-8 h-1 animate-pulse rounded bg-indigo-600" />
      <template v-else
        ><p v-if="errorMessage" class="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {{ errorMessage }}
        </p>
        <div v-else class="mt-7">
          <label class="mb-2 block text-sm font-semibold text-slate-700">ข้อมูลบัตร</label>
          <div id="stripe-card-number" class="rounded-xl border border-slate-300 px-4 py-4" />
          <div class="mt-4 grid gap-4 sm:grid-cols-2"><div><label class="mb-2 block text-sm font-semibold text-slate-700">วันหมดอายุ</label><div id="stripe-card-expiry" class="rounded-xl border border-slate-300 px-4 py-4" /></div><div><label class="mb-2 block text-sm font-semibold text-slate-700">รหัส CVC</label><div id="stripe-card-cvc" class="rounded-xl border border-slate-300 px-4 py-4" /></div></div>
          <button
            class="mt-6 w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white disabled:opacity-60"
            :disabled="paying"
            @click="pay"
          >
            {{ paying ? 'กำลังชำระเงิน...' : 'ชำระเงิน' }}
          </button>
          <p class="mt-3 text-center text-xs text-slate-400">
            ใช้บัตรทดสอบ Stripe: 4242 4242 4242 4242
          </p>
        </div></template
      >
    </section>
  </main>
</template>
