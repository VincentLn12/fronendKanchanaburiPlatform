<script setup lang="ts">
// Public storefront - Emerald Nature Shopping Cart View
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { checkout } from '../api/cartApi'
import { useCartStore } from '@/stores/cart'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useSwal } from '@/plugins/sweetalert'
import AppTextField from '@/components/common/input/AppTextField.vue'
import AppTextarea from '@/components/common/input/AppTextarea.vue'
import { getUserAddresses, type UserAddress } from '../api/userAddressApi'

const cartStore = useCartStore()
const cart = computed(() => cartStore.cart)
const loading = computed(() => cartStore.loading)
const updating = ref<string | null>(null)
const swal = useSwal()
const router = useRouter()
const checkingOut = ref(false)
const shippingMethod = ref<'Delivery' | 'Pickup'>('Delivery')
const receiverName = ref('')
const receiverPhone = ref('')
const shippingAddress = ref('')
const addresses = ref<UserAddress[]>([])
const selectedAddressId = ref<string | null>(null)

const apiOrigin = (import.meta.env.VITE_API_URL ?? 'https://localhost:7289/api').replace(
  /\/api$/,
  '',
)
const total = computed(() => cartStore.total)
const itemCount = computed(() => cartStore.itemCount)
const shippingFee = computed(() => (shippingMethod.value === 'Delivery' ? 50 : 0))
const grandTotal = computed(() => total.value + shippingFee.value)

function imageUrl(url?: string) {
  return url?.startsWith('/') ? `${apiOrigin}${url}` : url
}

async function load() {
  try {
    const [_, savedAddresses] = await Promise.all([cartStore.load(), getUserAddresses()])
    addresses.value = savedAddresses
    const defaultAddress = savedAddresses.find((address) => address.isDefault) ?? savedAddresses[0]
    if (defaultAddress) selectAddress(defaultAddress)
  } catch (error) {
    await swal.error('โหลดตะกร้าไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  }
}

function selectAddress(address: UserAddress) {
  selectedAddressId.value = address.userAddressId
  receiverName.value = address.recipientName
  receiverPhone.value = address.recipientPhone
  shippingAddress.value = [
    address.addressLine,
    address.subDistrict,
    address.district,
    address.province,
    address.postalCode,
  ]
    .filter(Boolean)
    .join(' ')
}

async function setQuantity(id: string, quantity: number) {
  updating.value = id
  try {
    await cartStore.setQuantity(id, quantity)
  } catch (error) {
    await swal.error('แก้ไขจำนวนไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    updating.value = null
  }
}

async function remove(id: string) {
  const result = await swal.confirm('ยืนยันลบสินค้า?', 'ต้องการลบสินค้านี้ออกจากตะกร้าใช่หรือไม่')
  if (!result.isConfirmed) return

  try {
    await cartStore.remove(id)
    await swal.success('ลบสินค้าออกจากตะกร้าแล้ว')
  } catch (error) {
    await swal.error('ลบสินค้าไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  }
}

async function placeOrder() {
  const shopId = cart.value.items[0]?.shopId
  if (!shopId) return
  if (
    shippingMethod.value === 'Delivery' &&
    (!receiverName.value || !receiverPhone.value || !shippingAddress.value)
  ) {
    await swal.warning('กรอกข้อมูลจัดส่งไม่ครบ', 'กรุณาระบุชื่อผู้รับ เบอร์โทร และที่อยู่จัดส่ง')
    return
  }

  checkingOut.value = true
  try {
    const order = await checkout({
      shopId,
      shippingMethod: shippingMethod.value,
      shippingFee: shippingFee.value,
      receiverName: receiverName.value || undefined,
      receiverPhone: receiverPhone.value || undefined,
      shippingAddress: shippingAddress.value || undefined,
    })
    cartStore.clear()
    await swal.success('สั่งซื้อสินค้าสำเร็จ!', `หมายเลขคำสั่งซื้อของคุณคือ #${order.orderNumber}`)
    await router.push('/orders')
  } catch (error) {
    await swal.error(
      'สร้างคำสั่งซื้อไม่สำเร็จ',
      getApiErrorMessage(error, 'กรุณาตรวจสอบสินค้าและจำนวนคงเหลืออีกครั้ง'),
    )
  } finally {
    checkingOut.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="min-h-screen bg-slate-50/60 pb-24">
    <!-- Header Banner Section -->
    <section
      class="bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900 py-12 text-white shadow-sm"
    >
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div
              class="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3.5 py-1 text-xs font-semibold text-emerald-200 backdrop-blur-md mb-2"
            >
              <i class="mdi mdi-cart-outline text-emerald-300"></i>
              <span>ตระกร้าสินค้าเมืองกาญจน์</span>
            </div>
            <h1 class="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              ตะกร้าสินค้าของคุณ
            </h1>
          </div>

          <div class="flex items-center gap-3">
            <RouterLink
              to="/shops"
              class="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/20"
            >
              <i class="mdi mdi-storefront-outline text-base"></i>
              <span>เลือกซื้อสินค้าเพิ่ม</span>
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Cart Content -->
    <main class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 -mt-6">
      <!-- Loading Skeleton -->
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="h-28 animate-pulse rounded-3xl bg-slate-200"></div>
      </div>

      <!-- Empty Cart State -->
      <div
        v-else-if="!cart.items.length"
        class="my-8 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white py-20 px-6 text-center shadow-sm"
      >
        <div
          class="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-4"
        >
          <i class="mdi mdi-cart-off text-4xl"></i>
        </div>
        <h2 class="text-2xl font-bold text-slate-800">ตะกร้าสินค้าของคุณยังว่างอยู่</h2>
        <p class="mt-2 max-w-md text-sm text-slate-500">
          คุณยังไม่มีสินค้าในตะกร้า สามารถเลือกดูสินค้าขึ้นชื่อและของฝากจากร้านค้าต่างๆ
          ในกาญจนบุรีได้ทันที
        </p>
        <RouterLink
          to="/shops"
          class="mt-6 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 active:scale-95"
        >
          <i class="mdi mdi-storefront"></i>
          <span>สำรวจร้านค้าเมืองกาญจน์</span>
        </RouterLink>
      </div>

      <!-- Cart Items & Order Summary Grid -->
      <div v-else class="grid gap-8 lg:grid-cols-12">
        <!-- Cart Items List (Left Column) -->
        <section class="lg:col-span-8 space-y-4">
          <!-- Item Count Header -->
          <div
            class="flex items-center justify-between rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs"
          >
            <span class="text-sm font-bold text-slate-800">
              รายการสินค้าทั้งหมด ({{ itemCount }} ชิ้น)
            </span>
            <span class="text-xs text-slate-500"> สินค้าจากร้านค้าชุมชนกาญจนบุรี </span>
          </div>

          <!-- Item Card -->
          <article
            v-for="item in cart.items"
            :key="item.cartItemId"
            class="group relative flex flex-col sm:flex-row items-start sm:items-center gap-5 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md hover:border-emerald-300"
          >
            <!-- Product Thumbnail Image -->
            <div
              class="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-slate-100 border border-slate-100"
            >
              <img
                v-if="item.imageUrl"
                :src="imageUrl(item.imageUrl)"
                :alt="item.productName"
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div v-else class="flex h-full w-full items-center justify-center text-slate-400">
                <i class="mdi mdi-image-off-outline text-3xl"></i>
              </div>
            </div>

            <!-- Product Details -->
            <div class="min-w-0 flex-1 space-y-1">
              <h2 class="text-lg font-bold text-slate-900 line-clamp-1">
                {{ item.productName }}
              </h2>
              <div class="flex items-center gap-2 text-xs text-slate-500">
                <span class="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  ฿ {{ Number(item.unitPrice).toLocaleString('th-TH') }} / ชิ้น
                </span>
              </div>

              <!-- Item Total Price & Controls -->
              <div
                class="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 mt-2"
              >
                <!-- Quantity Counter -->
                <div class="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                  <button
                    class="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-700 shadow-xs transition hover:bg-slate-100 disabled:opacity-40"
                    :disabled="updating === item.cartItemId || item.quantity <= 1"
                    @click="setQuantity(item.cartItemId, item.quantity - 1)"
                  >
                    <i class="mdi mdi-minus text-xs"></i>
                  </button>

                  <span class="min-w-[40px] text-center font-bold text-slate-900 text-sm">
                    <i
                      v-if="updating === item.cartItemId"
                      class="mdi mdi-loading animate-spin text-emerald-600"
                    ></i>
                    <template v-else>{{ item.quantity }}</template>
                  </span>

                  <button
                    class="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-700 shadow-xs transition hover:bg-slate-100 disabled:opacity-40"
                    :disabled="updating === item.cartItemId || item.quantity >= item.availableQuantity"
                    @click="setQuantity(item.cartItemId, item.quantity + 1)"
                  >
                    <i class="mdi mdi-plus text-xs"></i>
                  </button>
                  <span class="ml-2 text-xs text-slate-400">เหลือ {{ item.availableQuantity }} ชิ้น</span>
                </div>

                <!-- Price Subtotal & Remove Button -->
                <div class="flex items-center gap-4">
                  <div class="text-right">
                    <span class="block text-[10px] text-slate-400 font-semibold uppercase"
                      >รวมชิ้นนี้</span
                    >
                    <span class="text-base font-extrabold text-emerald-700">
                      ฿ {{ (Number(item.unitPrice) * item.quantity).toLocaleString('th-TH') }}
                    </span>
                  </div>

                  <button
                    class="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-600 transition hover:bg-rose-600 hover:text-white"
                    title="ลบรายการนี้"
                    @click="remove(item.cartItemId)"
                  >
                    <i class="mdi mdi-trash-can-outline text-base"></i>
                  </button>
                </div>
              </div>
            </div>
          </article>
        </section>

        <!-- Order Summary Sidebar (Right Column) -->
        <aside class="lg:col-span-4">
          <div
            class="sticky top-24 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-6"
          >
            <h2
              class="flex items-center gap-2 text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-4"
            >
              <i class="mdi mdi-receipt-text-outline text-emerald-600 text-xl"></i>
              สรุปคำสั่งซื้อ
            </h2>

            <!-- Cost Breakdown -->
            <div class="space-y-3 border-b border-slate-100 pb-5">
              <p class="text-sm font-bold text-slate-900">วิธีรับสินค้า</p>
              <label
                class="flex cursor-pointer items-center gap-3 rounded-xl border p-3"
                :class="
                  shippingMethod === 'Delivery'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200'
                "
              >
                <input
                  v-model="shippingMethod"
                  value="Delivery"
                  type="radio"
                  class="accent-emerald-600"
                />
                <span class="text-sm font-semibold text-slate-800"
                  >จัดส่งถึงที่อยู่ <span class="font-normal text-slate-500">(+50 บาท)</span></span
                >
              </label>
              <label
                class="flex cursor-pointer items-center gap-3 rounded-xl border p-3"
                :class="
                  shippingMethod === 'Pickup'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200'
                "
              >
                <input
                  v-model="shippingMethod"
                  value="Pickup"
                  type="radio"
                  class="accent-emerald-600"
                />
                <span class="text-sm font-semibold text-slate-800"
                  >รับสินค้าที่ร้าน <span class="font-normal text-slate-500">(ฟรี)</span></span
                >
              </label>
              <div v-if="shippingMethod === 'Delivery'" class="space-y-3 pt-1">
                <div v-if="addresses.length" class="space-y-2">
                  <p class="text-sm font-bold text-slate-900">เลือกที่อยู่ที่บันทึกไว้</p>
                  <button
                    v-for="address in addresses"
                    :key="address.userAddressId"
                    type="button"
                    class="w-full rounded-xl border p-3 text-left text-sm"
                    :class="
                      selectedAddressId === address.userAddressId
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200'
                    "
                    @click="selectAddress(address)"
                  >
                    <span class="font-bold"
                      >{{ address.recipientName }} · {{ address.recipientPhone }}</span
                    >
                    <span class="mt-1 block text-slate-600">{{
                      [
                        address.addressLine,
                        address.subDistrict,
                        address.district,
                        address.province,
                        address.postalCode,
                      ]
                        .filter(Boolean)
                        .join(' ')
                    }}</span>
                  </button>
                </div>
                <AppTextField
                  v-model="receiverName"
                  label="ชื่อผู้รับ *"
                  placeholder="ชื่อ-นามสกุล"
                />
                <AppTextField
                  v-model="receiverPhone"
                  label="เบอร์โทรศัพท์ *"
                  placeholder="เช่น 0812345678"
                />
                <AppTextarea
                  v-model="shippingAddress"
                  label="ที่อยู่จัดส่ง *"
                  placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
                />
              </div>
            </div>
            <div class="space-y-3 text-sm text-slate-600">
              <div class="flex justify-between">
                <span>จำนวนสินค้าทั้งหมด</span>
                <span class="font-bold text-slate-900">{{ itemCount }} ชิ้น</span>
              </div>
              <div class="flex justify-between">
                <span>ยอดรวมสินค้า</span>
                <span class="font-bold text-slate-900">฿ {{ total.toLocaleString('th-TH') }}</span>
              </div>
              <div class="flex justify-between text-emerald-700 font-medium">
                <span>ค่าจัดส่ง</span>
                <span
                  class="inline-flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md text-xs font-bold"
                >
                  <i class="mdi mdi-truck-check-outline"></i> ฿
                  {{ shippingFee.toLocaleString('th-TH') }}
                </span>
              </div>
            </div>

            <!-- Grand Total -->
            <div class="border-t border-slate-100 pt-4">
              <div class="flex items-baseline justify-between">
                <div>
                  <span class="block text-sm font-bold text-slate-900">ยอดรวมสุทธิ</span>
                  <span class="text-[11px] text-slate-400">ราคารวมภาษีมูลค่าเพิ่มแล้ว</span>
                </div>
                <div class="text-2xl font-black text-emerald-700">
                  ฿ {{ grandTotal.toLocaleString('th-TH') }}
                </div>
              </div>
            </div>

            <!-- Checkout Button -->
            <button
              class="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700 active:scale-95 disabled:opacity-60"
              :disabled="checkingOut || !cart.items.length"
              @click="placeOrder"
            >
              <i
                class="mdi mdi-credit-card-outline text-xl"
                :class="{ 'animate-spin mdi-loading': checkingOut }"
              ></i>
              <span>{{ checkingOut ? 'กำลังดำเนินการ...' : 'ยืนยันสั่งซื้อสินค้า' }}</span>
            </button>

            <!-- Trust / Security badges -->
            <div
              class="rounded-2xl bg-slate-50 p-4 text-xs text-slate-500 space-y-2 border border-slate-100"
            >
              <div class="flex items-center gap-2">
                <i class="mdi mdi-shield-check-outline text-emerald-600 text-base"></i>
                <span>สั่งซื้อง่าย ปลอดภัย ผ่านระบบชำระเงินมาตรฐาน</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="mdi mdi-store-check-outline text-emerald-600 text-base"></i>
                <span>รับประกันสินค้าส่งตรงจากร้านค้าในจังหวัดกาญจนบุรี</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  </div>
</template>
