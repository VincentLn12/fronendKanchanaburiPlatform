import http from '@/shared/api/http'
import type { PagedResult } from '@/shared/interface/PagedResult'

export interface Tag {
  tagId: string
  tagName: string
  status: 'Active' | 'Inactive'
}

export async function getTags(params: { status?: string | null; page: number; pageSize: number }) {
  const { data } = await http.get<PagedResult<Tag>>('/tags/admin', { params })
  return data
}

export async function getTag(id: string) {
  const { data } = await http.get<Tag>(`/tags/admin/${id}`)
  return data
}

export async function createTag(data: { tagName: string }) {
  const { data: result } = await http.post<Tag>('/tags', data)
  return result
}

export async function updateTag(id: string, data: { tagName: string; status: 'Active' | 'Inactive' }) {
  await http.put(`/tags/${id}`, data)
}

export async function deleteTag(id: string) {
  await http.delete(`/tags/${id}`)
}
