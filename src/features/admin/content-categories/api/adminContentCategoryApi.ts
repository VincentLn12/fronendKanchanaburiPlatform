import http from '@/shared/api/http'
import type { PagedResult } from '@/shared/interface/PagedResult'

export interface ContentCategory {
  contentCategoryId: string
  categoryName: string
  description?: string
  status: 'Active' | 'Inactive'
}

export interface ContentCategoryFormData {
  categoryName: string
  description: string
  status: 'Active' | 'Inactive'
}

export async function getContentCategories(params: {
  status?: string | null
  page: number
  pageSize: number
}) {
  const { data } = await http.get<PagedResult<ContentCategory>>('/content-categories/admin', {
    params,
  })
  return data
}

export async function getContentCategory(id: string) {
  const { data } = await http.get<ContentCategory>(`/content-categories/admin/${id}`)
  return data
}

export async function createContentCategory(
  data: Pick<ContentCategoryFormData, 'categoryName' | 'description'>,
) {
  const { data: result } = await http.post<ContentCategory>('/content-categories', data)
  return result
}

export async function updateContentCategory(id: string, data: ContentCategoryFormData) {
  await http.put(`/content-categories/${id}`, data)
}

export async function deleteContentCategory(id: string) {
  await http.delete(`/content-categories/${id}`)
}
