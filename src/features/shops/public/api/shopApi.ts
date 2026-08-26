import http from '@/shared/api/http'
import type { District, Shop, ShopCategory } from '../../shared/types/shop'

export async function getShops(params: { search?: string; categoryId?: string; districtId?: string } = {}) {
  const { data } = await http.get<Shop[]>('/shops', { params })
  return data
}

export async function getShop(id: string) {
  const { data } = await http.get<Shop>(`/shops/${id}`)
  return data
}

export async function getShopCategories() {
  const { data } = await http.get<{ items: ShopCategory[] }>('/shop-categories', { params: { page: 1, pageSize: 100 } })
  return data.items.filter((item) => item.status === 'Active')
}

export async function getDistricts() {
  const { data } = await http.get<District[]>('/locations/districts')
  return data
}
