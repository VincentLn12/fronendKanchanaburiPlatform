import http from '@/shared/api/http'

export interface Profile {
  id: string
  firstName: string
  lastName: string
  name: string
  email: string
  role: string
}

export interface ContentViewHistory {
  contentId: string
  title: string
  summary?: string | null
  youtubeUrl?: string | null
  viewedAt: string
}

export interface FavoriteContent {
  contentId: string
  title: string
  summary?: string | null
  youtubeUrl?: string | null
  createdAt: string
}

export async function getProfile() {
  const { data } = await http.get<Profile>('/account/profile')
  return data
}

export async function updateProfile(payload: Pick<Profile, 'firstName' | 'lastName'>) {
  const { data } = await http.put<Profile>('/account/profile', payload)
  return data
}

export async function getContentViewHistory() {
  const { data } = await http.get<ContentViewHistory[]>('/content-views/history', { params: { take: 24 } })
  return data
}

export async function getFavoriteContents() {
  const { data } = await http.get<FavoriteContent[]>('/content-favorites')
  return data
}
