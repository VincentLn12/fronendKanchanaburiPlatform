import http from '@/shared/api/http'
import type { District, Shop, ShopCategory, ShopFormData, SubDistrict } from '../../shared/types/shop'

export async function getShopCategories() {
  const { data } = await http.get<ShopCategory[]>('/shop-categories')
  return data.filter((item) => item.status === 'Active')
}

export async function getDistricts() {
  const { data } = await http.get<District[]>('/locations/districts')
  return data
}

export async function getSubDistricts(districtId: string) {
  const { data } = await http.get<SubDistrict[]>(`/locations/districts/${districtId}/sub-districts`)
  return data
}

export async function getMyShop() {
  const { data } = await http.get<Shop>('/shops/mine')
  return data
}

export async function createShop(data: ShopFormData) {
  const response = await http.post<Shop>('/shops', data)
  return response.data
}

export async function updateShop(id: string, data: ShopFormData) {
  await http.put(`/shops/${id}`, data)
}

export async function closeShop(id: string) {
  await http.delete(`/shops/${id}`)
}

export async function updateShopStatus(id: string, status: string) {
  await http.patch(`/shops/${id}/status`, { status })
}
