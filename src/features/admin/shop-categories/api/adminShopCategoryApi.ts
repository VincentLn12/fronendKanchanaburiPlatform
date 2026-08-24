import http from '@/shared/api/http'
import type { PagedResult } from '@/shared/interface/PagedResult'
export interface ShopCategory {
  shopCategoryId: string
  categoryName: string
  description?: string
  status: string
}
export interface PagedCategories {
  items: ShopCategory[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}
export async function getCategories(params: { page: number; pageSize: number }) {
  const { data } = await http.get<PagedResult<ShopCategory>>('/shop-categories', { params })
  return data
}
export async function getCategory(id: string) {
  const { data } = await http.get<ShopCategory>(`/shop-categories/${id}`)
  return data
}
export async function createCategory(data: { categoryName: string; description: string }) {
  const { data: result } = await http.post<ShopCategory>('/shop-categories', data)
  return result
}
export async function updateCategory(
  id: string,
  data: { categoryName: string; description: string; status: string },
) {
  await http.put(`/shop-categories/${id}`, data)
}
export async function deleteCategory(id: string) {
  await http.delete(`/shop-categories/${id}`)
}
