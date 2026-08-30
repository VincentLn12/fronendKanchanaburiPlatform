import http from '@/shared/api/http'
import type { District, Shop, ShopCategory, SubDistrict } from '../../shared/types/shop'

export interface ShopReview {
  reviewId: string
  userName: string
  rating: number
  comment: string
  reply?: string | null
  createdAt: string
}

export interface ShopReviews {
  totalCount: number
  averageRating: number
  reviews: ShopReview[]
}

export async function getShops(params: { search?: string; categoryId?: string; districtId?: string; subDistrictId?: string } = {}) {
  const { data } = await http.get<Shop[]>('/shops', { params })
  return data
}

export async function getShop(id: string) {
  const { data } = await http.get<Shop>(`/shops/${id}`)
  return data
}

export async function getShopReviews(shopId: string) {
  const { data } = await http.get<ShopReviews>(`/shop-reviews/${shopId}`)
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

export async function getSubDistricts(districtId: string) {
  const { data } = await http.get<SubDistrict[]>(`/locations/districts/${districtId}/sub-districts`)
  return data
}
