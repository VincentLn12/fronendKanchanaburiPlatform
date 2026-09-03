import http from '@/shared/api/http'
import type { PagedResult } from '@/shared/interface/PagedResult'

export type ContentStatus = 'Draft' | 'Pending' | 'Published' | 'Archived'
export interface Content {
  contentId: string
  createdByUserId: string
  shopId?: string
  shopName?: string
  contentCategoryId: string
  contentCategoryName?: string
  districtId?: string
  districtName?: string
  subDistrictId?: string
  subDistrictName?: string
  title: string
  summary?: string
  latitude?: number
  longitude?: number
  youtubeUrl?: string
  status: ContentStatus
  publishedAt?: string
  createdAt: string
  updatedAt: string
}
export interface ContentFormData {
  title: string
  summary: string
  contentCategoryId: string | null
  shopId: string | null
  districtId: string | null
  subDistrictId: string | null
  latitude: number | null
  longitude: number | null
  youtubeUrl: string
  status: ContentStatus
}
export interface ContentCategory { contentCategoryId: string; categoryName: string }
export interface Shop { shopId: string; shopName: string }
export interface District { districtId: string; districtName: string }
export interface SubDistrict { subDistrictId: string; subDistrictName: string }

export async function getContents(params: { status?: string | null; page: number; pageSize: number }) {
  const { data } = await http.get<PagedResult<Content>>('/contents/admin', { params })
  return data
}
export async function getContent(id: string) {
  const { data } = await http.get<Content>(`/contents/admin/${id}`)
  return data
}
export async function createContent(data: Omit<ContentFormData, 'status'>) {
  const { data: result } = await http.post<Content>('/contents', data)
  return result
}
export async function updateContent(id: string, data: ContentFormData) { await http.put(`/contents/${id}`, data) }
export async function archiveContent(id: string) { await http.delete(`/contents/${id}`) }
export async function getContentCategories() {
  const { data } = await http.get<PagedResult<ContentCategory>>('/content-categories', { params: { page: 1, pageSize: 100 } })
  return data.items
}
export async function getShops() {
  const { data } = await http.get<PagedResult<Shop> | Shop[]>('/shops', { params: { page: 1, pageSize: 200 } })
  if (data && typeof data === 'object' && 'items' in data) {
    return data.items || []
  }
  return (data as Shop[]) || []
}
export async function getDistricts() { const { data } = await http.get<District[]>('/locations/districts'); return data }
export async function getSubDistricts(districtId: string) { const { data } = await http.get<SubDistrict[]>(`/locations/districts/${districtId}/sub-districts`); return data }
