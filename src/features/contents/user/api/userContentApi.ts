import http from '@/shared/api/http'
import type { PagedResult } from '@/shared/interface/PagedResult'

export type SubmissionStatus = 'Draft' | 'Pending' | 'Published' | 'Archived'

export interface UserContent {
  contentId: string
  shopId?: string | null
  contentCategoryId: string
  contentCategoryName?: string
  districtId?: string | null
  districtName?: string
  subDistrictId?: string | null
  subDistrictName?: string
  title: string
  summary?: string | null
  latitude?: number | null
  longitude?: number | null
  youtubeUrl?: string | null
  status: SubmissionStatus
  createdAt: string
  updatedAt: string
}

export interface UserContentFormData {
  title: string
  summary: string
  contentCategoryId: string | null
  shopId?: string | null
  districtId: string | null
  subDistrictId: string | null
  latitude: number | null
  longitude: number | null
  youtubeUrl: string
  status?: SubmissionStatus
}

export interface ContentCategory {
  contentCategoryId: string
  categoryName: string
}
export interface District {
  districtId: string
  districtName: string
}
export interface SubDistrict {
  subDistrictId: string
  subDistrictName: string
}

export async function getMyContents(params: { page: number; pageSize: number }) {
  const { data } = await http.get<PagedResult<UserContent>>('/contents/mine', { params })
  return data
}

export async function getMyContent(id: string) {
  const { data } = await http.get<UserContent>(`/contents/mine/${id}`)
  return data
}

export async function createMyContent(data: UserContentFormData) {
  const payload = {
    ...data,
    status: data.status || 'Published',
  }
  const { data: result } = await http.post<UserContent>('/contents', payload)
  return result
}

export async function updateMyContent(id: string, data: UserContentFormData) {
  const payload = {
    ...data,
    status: data.status || 'Published',
  }
  await http.put(`/contents/${id}`, payload)
}

export async function archiveMyContent(id: string) {
  await http.delete(`/contents/${id}`)
}

export async function getContentCategories() {
  const { data } = await http.get<PagedResult<ContentCategory>>('/content-categories', {
    params: { page: 1, pageSize: 100 },
  })
  return data.items
}

export async function getDistricts() {
  const { data } = await http.get<District[]>('/locations/districts')
  return data
}

export async function getSubDistricts(districtId: string) {
  const { data } = await http.get<SubDistrict[]>(`/locations/districts/${districtId}/sub-districts`)
  return data
}

export async function getShops() {
  const { data } = await http.get<PagedResult<{ shopId: string; shopName: string }> | { shopId: string; shopName: string }[]>('/shops', { params: { page: 1, pageSize: 200 } })
  if (data && typeof data === 'object' && 'items' in data) {
    return data.items || []
  }
  return (data as { shopId: string; shopName: string }[]) || []
}
