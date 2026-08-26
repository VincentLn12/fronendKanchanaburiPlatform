import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  addCartItem,
  getCart,
  removeCartItem,
  updateCartItem,
  type Cart,
} from '@/features/cart/api/cartApi'

function emptyCart(): Cart {
  return { cartId: '', items: [], total: 0 }
}

export const useCartStore = defineStore('cart', () => {
  const cart = ref<Cart>(emptyCart())
  const loading = ref(false)
  const itemCount = computed(() =>
    cart.value.items.reduce((count, item) => count + item.quantity, 0),
  )
  const total = computed(() =>
    cart.value.items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0),
  )

  async function load() {
    loading.value = true
    try {
      cart.value = await getCart()
    } finally {
      loading.value = false
    }
  }

  async function add(productId: string, quantity = 1) {
    cart.value = await addCartItem(productId, quantity)
  }

  async function setQuantity(cartItemId: string, quantity: number) {
    if (quantity < 1) {
      await remove(cartItemId)
      return
    }

    await updateCartItem(cartItemId, quantity)
    const item = cart.value.items.find((cartItem) => cartItem.cartItemId === cartItemId)
    if (item) item.quantity = quantity
  }

  async function remove(cartItemId: string) {
    await removeCartItem(cartItemId)
    cart.value.items = cart.value.items.filter((item) => item.cartItemId !== cartItemId)
  }

  function clear() {
    cart.value = emptyCart()
  }

  return { cart, loading, itemCount, total, load, add, setQuantity, remove, clear }
})
