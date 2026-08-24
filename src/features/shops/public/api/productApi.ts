import http from '@/shared/api/http'
import type { Product } from '../../shared/types/product'

export async function getShopProducts(shopId: string) {
  const { data } = await http.get<Product[]>('/products')
  return data.filter((product) => product.shopId === shopId)
}

export async function getPublicProduct(id: string) {
  const { data } = await http.get<Product>(`/products/${id}`)
  return data
}
