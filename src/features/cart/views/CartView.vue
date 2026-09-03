<script setup lang="ts">
// Public storefront - Orange + Cream Shopping Cart View
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
  <div class="min-h-screen bg-[#F7F0E6] text-[#332820] pb-24">
    <!-- Header Banner Section -->
    <section
      class="bg-[#171412] py-12 text-white shadow-sm relative overflow-hidden"
    >
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div
              class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#D96C2C]/30 px-3.5 py-1 text-xs font-black text-[#F2A65A] backdrop-blur-md mb-2"
            >
              <i class="mdi mdi-cart-outline text-[#F2A65A]"></i>
              <span>ตระกร้าสินค้าเมืองกาญจน์</span>
            </div>
            <h1 class="text-3xl font-black tracking-tight text-white sm:text-4xl">
              ตะกร้าสินค้าของคุณ
            </h1>
          </div>

          <div class="flex items-center gap-3">
            <RouterLink
              to="/shops"
              class="inline-flex items-center gap-2 rounded-2xl border-2 border-white/20 bg-white/10 px-4 py-2.5 text-xs font-black text-white backdrop-blur-md transition hover:bg-white/20"
            >
              <i class="mdi mdi-storefront-outline text-base text-[#F2A65A]"></i>
              <span class="text-white font-black">เลือกซื้อสินค้าเพิ่ม</span>
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Cart Content -->
    <main class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 -mt-6">
      <!-- Loading Skeleton -->
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="h-28 animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9]"></div>
      </div>

      <!-- Empty Cart State -->
      <div
        v-else-if="!cart.items.length"
        class="my-8 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#E8D9C9] bg-[#FFF9F2] py-20 px-6 text-center shadow-sm"
      >
        <div
          class="flex h-20 w-20 items-center justify-center rounded-full bg-[#D96C2C]/15 text-[#D96C2C] mb-4 border border-[#D96C2C]/30"
        >
          <i class="mdi mdi-cart-off text-4xl"></i>
        </div>
        <h2 class="text-2xl font-black text-[#332820]">ตะกร้าสินค้าของคุณยังว่างอยู่</h2>
        <p class="mt-2 max-w-md text-xs sm:text-sm text-[#786B62] font-semibold">
          คุณยังไม่มีสินค้าในตะกร้า สามารถเลือกดูสินค้าขึ้นชื่อและของฝากจากร้านค้าต่างๆ
          ในกาญจนบุรีได้ทันที
        </p>
        <RouterLink
          to="/shops"
          class="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] px-6 py-3 text-xs sm:text-sm font-black text-white shadow-lg transition active:scale-95 border border-[#D96C2C]"
        >
          <i class="mdi mdi-storefront text-white"></i>
          <span class="!text-white font-black">สำรวจร้านค้าเมืองกาญจน์</span>
        </RouterLink>
      </div>

      <!-- Cart Items & Order Summary Grid -->
      <div v-else class="grid gap-8 lg:grid-cols-12">
        <!-- Cart Items List (Left Column) -->
        <section class="lg:col-span-8 space-y-4">
          <!-- Item Count Header -->
          <div
            class="flex items-center justify-between rounded-2xl bg-[#FFF9F2] p-4 border-2 border-[#E8D9C9] shadow-xs"
          >
            <span class="text-sm font-black text-[#332820]">
              รายการสินค้าทั้งหมด (<span class="text-[#D96C2C]">{{ itemCount }}</span> ชิ้น)
            </span>
            <span class="text-xs font-semibold text-[#786B62]"> สินค้าจากร้านค้าชุมชนกาญจนบุรี </span>
          </div>

          <!-- Item Card -->
          <article
            v-for="item in cart.items"
            :key="item.cartItemId"
            class="group relative flex flex-col sm:flex-row items-start sm:items-center gap-5 rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-5 shadow-xs transition hover:shadow-md hover:border-[#D96C2C]"
          >
            <!-- Product Thumbnail Image -->
            <div
              class="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-[#171412] border border-[#E8D9C9]"
            >
              <img
                v-if="item.imageUrl"
                :src="imageUrl(item.imageUrl)"
                :alt="item.productName"
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div v-else class="flex h-full w-full items-center justify-center text-[#786B62]">
                <i class="mdi mdi-image-off-outline text-3xl"></i>
              </div>
            </div>

            <!-- Product Details -->
            <div class="min-w-0 flex-1 space-y-1">
              <h2 class="text-lg font-black text-[#332820] line-clamp-1">
                {{ item.productName }}
              </h2>
              <div class="flex items-center gap-2 text-xs text-[#786B62]">
                <span class="font-black text-[#D96C2C] bg-[#D96C2C]/10 px-2.5 py-0.5 rounded-md border border-[#D96C2C]/20">
                  ฿ {{ Number(item.unitPrice).toLocaleString('th-TH') }} / ชิ้น
                </span>
              </div>

              <!-- Item Total Price & Controls -->
              <div
                class="pt-3 flex flex-wrap items-center justify-between gap-3 border-t-2 border-[#E8D9C9] mt-2"
              >
                <!-- Quantity Counter -->
                <div class="flex items-center rounded-xl border-2 border-[#E8D9C9] bg-[#F7F0E6] p-1">
                  <button
                    class="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#332820] font-black shadow-xs transition hover:bg-[#E8D9C9]/50 disabled:opacity-40"
                    :disabled="updating === item.cartItemId || item.quantity <= 1"
                    @click="setQuantity(item.cartItemId, item.quantity - 1)"
                  >
                    <i class="mdi mdi-minus text-xs"></i>
                  </button>

                  <span class="min-w-[40px] text-center font-black text-[#332820] text-sm">
                    <i
                      v-if="updating === item.cartItemId"
                      class="mdi mdi-loading animate-spin text-[#D96C2C]"
                    ></i>
                    <template v-else>{{ item.quantity }}</template>
                  </span>

                  <button
                    class="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#332820] font-black shadow-xs transition hover:bg-[#E8D9C9]/50 disabled:opacity-40"
                    :disabled="updating === item.cartItemId || item.quantity >= item.availableQuantity"
                    @click="setQuantity(item.cartItemId, item.quantity + 1)"
                  >
                    <i class="mdi mdi-plus text-xs"></i>
                  </button>
                  <span class="ml-2 text-xs text-[#786B62] font-semibold">เหลือ {{ item.availableQuantity }} ชิ้น</span>
                </div>

                <!-- Price Subtotal & Remove Button -->
                <div class="flex items-center gap-4">
                  <div class="text-right">
                    <span class="block text-[10px] text-[#786B62] font-black uppercase"
                      >รวมชิ้นนี้</span
                    >
                    <span class="text-base font-black text-[#D96C2C]">
                      ฿ {{ (Number(item.unitPrice) * item.quantity).toLocaleString('th-TH') }}
                    </span>
                  </div>

                  <button
                    class="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-600 hover:text-white cursor-pointer"
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
            class="sticky top-24 rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-6 shadow-sm space-y-6"
          >
            <h2
              class="flex items-center gap-2 text-lg font-black text-[#332820] border-b-2 border-[#E8D9C9] pb-4"
            >
              <i class="mdi mdi-receipt-text-outline text-[#D96C2C] text-xl"></i>
              สรุปคำสั่งซื้อ
            </h2>

            <!-- Cost Breakdown -->
            <div class="space-y-3 border-b-2 border-[#E8D9C9] pb-5">
              <p class="text-sm font-black text-[#332820]">วิธีรับสินค้า</p>
              <label
                class="flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition"
                :class="
                  shippingMethod === 'Delivery'
                    ? 'border-[#D96C2C] bg-[#D96C2C]/10 font-black'
                    : 'border-[#E8D9C9] bg-white'
                "
              >
                <input
                  v-model="shippingMethod"
                  value="Delivery"
                  type="radio"
                  class="accent-[#D96C2C]"
                />
                <span class="text-sm font-extrabold text-[#332820]"
                  >จัดส่งถึงที่อยู่ <span class="font-semibold text-[#786B62]">(+50 บาท)</span></span
                >
              </label>
              <label
                class="flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition"
                :class="
                  shippingMethod === 'Pickup'
                    ? 'border-[#D96C2C] bg-[#D96C2C]/10 font-black'
                    : 'border-[#E8D9C9] bg-white'
                "
              >
                <input
                  v-model="shippingMethod"
                  value="Pickup"
                  type="radio"
                  class="accent-[#D96C2C]"
                />
                <span class="text-sm font-extrabold text-[#332820]"
                  >รับสินค้าที่ร้าน <span class="font-semibold text-[#786B62]">(ฟรี)</span></span
                >
              </label>
              <div v-if="shippingMethod === 'Delivery'" class="space-y-3 pt-1">
                <div v-if="addresses.length" class="space-y-2">
                  <p class="text-sm font-black text-[#332820]">เลือกที่อยู่ที่บันทึกไว้</p>
                  <button
                    v-for="address in addresses"
                    :key="address.userAddressId"
                    type="button"
                    class="w-full rounded-xl border-2 p-3 text-left text-sm cursor-pointer transition"
                    :class="
                      selectedAddressId === address.userAddressId
                        ? 'border-[#D96C2C] bg-[#D96C2C]/10'
                        : 'border-[#E8D9C9] bg-white'
                    "
                    @click="selectAddress(address)"
                  >
                    <span class="font-black text-[#332820]"
                      >{{ address.recipientName }} · {{ address.recipientPhone }}</span
                    >
                    <span class="mt-1 block text-xs text-[#786B62] font-semibold">{{
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
            <div class="space-y-3 text-sm text-[#786B62] font-bold">
              <div class="flex justify-between">
                <span>จำนวนสินค้าทั้งหมด</span>
                <span class="font-black text-[#332820]">{{ itemCount }} ชิ้น</span>
              </div>
              <div class="flex justify-between">
                <span>ยอดรวมสินค้า</span>
                <span class="font-black text-[#332820]">฿ {{ total.toLocaleString('th-TH') }}</span>
              </div>
              <div class="flex justify-between text-[#D96C2C] font-black">
                <span>ค่าจัดส่ง</span>
                <span
                  class="inline-flex items-center gap-1 bg-[#D96C2C]/10 px-2.5 py-0.5 rounded-md text-xs font-black border border-[#D96C2C]/20"
                >
                  <i class="mdi mdi-truck-check-outline"></i> ฿
                  {{ shippingFee.toLocaleString('th-TH') }}
                </span>
              </div>
            </div>

            <!-- Grand Total -->
            <div class="border-t-2 border-[#E8D9C9] pt-4">
              <div class="flex items-baseline justify-between">
                <div>
                  <span class="block text-sm font-black text-[#332820]">ยอดรวมสุทธิ</span>
                  <span class="text-[11px] text-[#786B62] font-semibold">ราคารวมภาษีมูลค่าเพิ่มแล้ว</span>
                </div>
                <div class="text-2xl font-black text-[#D96C2C]">
                  ฿ {{ grandTotal.toLocaleString('th-TH') }}
                </div>
              </div>
            </div>

            <!-- Checkout Button (SOLID VIBRANT ORANGE WITH CRISP WHITE BOLD TEXT) -->
            <button
              class="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] font-black text-white shadow-lg transition active:scale-95 disabled:opacity-60 cursor-pointer border border-[#D96C2C]"
              :disabled="checkingOut || !cart.items.length"
              @click="placeOrder"
            >
              <i
                class="mdi mdi-credit-card-outline text-xl text-white"
                :class="{ 'animate-spin mdi-loading': checkingOut }"
              ></i>
              <span class="!text-white font-black text-base">{{ checkingOut ? 'กำลังดำเนินการ...' : 'ยืนยันสั่งซื้อสินค้า' }}</span>
            </button>

            <!-- Trust / Security badges -->
            <div
              class="rounded-2xl bg-[#F7F0E6] p-4 text-xs text-[#786B62] space-y-2 border-2 border-[#E8D9C9] font-semibold"
            >
              <div class="flex items-center gap-2">
                <i class="mdi mdi-shield-check-outline text-[#D96C2C] text-base"></i>
                <span>สั่งซื้อง่าย ปลอดภัย ผ่านระบบชำระเงินมาตรฐาน</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="mdi mdi-store-check-outline text-[#D96C2C] text-base"></i>
                <span>รับประกันสินค้าส่งตรงจากร้านค้าในจังหวัดกาญจนบุรี</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  </div>
</template>
