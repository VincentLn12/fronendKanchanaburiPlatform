import http from '@/shared/api/http'
import type { PagedResult } from '@/shared/interface/PagedResult'

export interface ContentOption { contentId: string; title: string; status: string }
export interface TagOption { tagId: string; tagName: string; status: string }
export interface ContentTag { contentId: string; tagId: string; tagName: string }

export async function getContents() {
  const { data } = await http.get<PagedResult<ContentOption>>('/contents/admin', { params: { page: 1, pageSize: 100 } })
  return data.items
}

export async function getTags() {
  const { data } = await http.get<TagOption[]>('/tags')
  return data
}

export async function getContentTags(contentId: string) {
  const { data } = await http.get<ContentTag[]>('/content-tags', { params: { contentId } })
  return data
}

export async function replaceContentTags(contentId: string, tagIds: string[]) {
  const { data } = await http.put<ContentTag[]>(`/content-tags/${contentId}`, { tagIds })
  return data
}
