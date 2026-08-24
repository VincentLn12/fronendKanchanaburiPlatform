<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { checkout, getCart, removeCartItem, updateCartItem, type Cart } from '../api/cartApi'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useSwal } from '@/plugins/sweetalert'
const cart = ref<Cart>({ cartId: '', items: [], total: 0 })
const loading = ref(true)
const updating = ref<string | null>(null)
const swal = useSwal()
const router = useRouter()
const checkingOut = ref(false)
const apiOrigin = (import.meta.env.VITE_API_URL ?? 'https://localhost:7289/api').replace(
  /\/api$/,
  '',
)
const total = computed(() =>
  cart.value.items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0),
)
function imageUrl(url?: string) {
  return url?.startsWith('/') ? `${apiOrigin}${url}` : url
}
async function load() {
  try {
    cart.value = await getCart()
  } catch (error) {
    await swal.error('โหลดตะกร้าไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่'))
  } finally {
    loading.value = false
  }
}
async function setQuantity(id: string, quantity: number) {
  if (quantity < 1) return remove(id)
  updating.value = id
  try {
    await updateCartItem(id, quantity)
    const item = cart.value.items.find((x) => x.cartItemId === id)
    if (item) item.quantity = quantity
  } catch (error) {
    await swal.error('แก้ไขจำนวนไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่'))
  } finally {
    updating.value = null
  }
}
async function remove(id: string) {
  try {
    await removeCartItem(id)
    cart.value.items = cart.value.items.filter((x) => x.cartItemId !== id)
  } catch (error) {
    await swal.error('ลบสินค้าไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่'))
  }
}
async function placeOrder() {
  const shopId = cart.value.items[0]?.shopId
  if (!shopId) return
  checkingOut.value = true
  try {
    const order = await checkout(shopId)
    await swal.success(`สร้างคำสั่งซื้อ ${order.orderNumber} แล้ว`)
    await router.push('/orders')
  } catch (error) {
    await swal.error('สร้างคำสั่งซื้อไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาตรวจสอบสินค้าและจำนวนคงเหลือ'))
  } finally { checkingOut.value = false }
}
onMounted(load)
</script>
<template>
  <main class="mx-auto max-w-6xl px-4 py-10 sm:px-6">
    <div v-if="loading" class="h-1 animate-pulse rounded bg-indigo-600" />
    <template v-else
      ><div class="mb-8">
        <p class="font-semibold text-indigo-600">การสั่งซื้อ</p>
        <h1 class="mt-1 text-3xl font-bold text-slate-900">ตะกร้าสินค้า</h1>
      </div>
      <div
        v-if="!cart.items.length"
        class="rounded-3xl border border-dashed border-slate-300 bg-white p-16 text-center text-slate-500"
      >
        ตะกร้าของคุณยังว่าง
        <RouterLink to="/shops" class="font-semibold text-indigo-600">เลือกซื้อสินค้า</RouterLink>
      </div>
      <div v-else class="grid gap-7 lg:grid-cols-[1fr_360px]">
        <section class="space-y-4">
          <article
            v-for="item in cart.items"
            :key="item.cartItemId"
            class="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4"
          >
            <img
              v-if="item.imageUrl"
              :src="imageUrl(item.imageUrl)"
              :alt="item.productName"
              class="h-24 w-24 rounded-xl object-cover"
            />
            <div
              v-else
              class="flex h-24 w-24 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-400"
            >
              ไม่มีรูป
            </div>
            <div class="min-w-0 flex-1">
              <h2 class="truncate font-bold text-slate-900">{{ item.productName }}</h2>
              <p class="mt-1 font-semibold text-indigo-600">
                {{ Number(item.unitPrice).toLocaleString('th-TH') }} บาท
              </p>
              <div class="mt-3 flex items-center justify-between">
                <div class="flex items-center rounded-lg border border-slate-200">
                  <button
                    class="px-3 py-1.5"
                    :disabled="updating === item.cartItemId"
                    @click="setQuantity(item.cartItemId, item.quantity - 1)"
                  >
                    −</button
                  ><span class="min-w-9 text-center font-semibold">{{ item.quantity }}</span
                  ><button
                    class="px-3 py-1.5"
                    :disabled="updating === item.cartItemId"
                    @click="setQuantity(item.cartItemId, item.quantity + 1)"
                  >
                    +
                  </button>
                </div>
                <button class="text-sm font-semibold text-red-600" @click="remove(item.cartItemId)">
                  ลบ
                </button>
              </div>
            </div>
          </article>
        </section>
        <aside class="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-lg font-bold text-slate-900">สรุปคำสั่งซื้อ</h2>
          <div class="mt-5 flex justify-between border-t border-slate-100 pt-5 text-lg font-bold">
            <span>ยอดรวม</span
            ><span class="text-indigo-600">{{ total.toLocaleString('th-TH') }} บาท</span>
          </div>
          <button
            class="mt-6 w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
            :disabled="checkingOut"
            @click="placeOrder"
          >
            {{ checkingOut ? 'กำลังสร้างคำสั่งซื้อ...' : 'ดำเนินการสั่งซื้อ' }}
          </button>
        </aside>
      </div></template
    >
  </main>
</template>
