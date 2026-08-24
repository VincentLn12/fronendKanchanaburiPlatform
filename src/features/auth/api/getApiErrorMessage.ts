import axios from 'axios'

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error)) return fallback

  const data = error.response?.data
  if (typeof data === 'string') return data
  if (!data || typeof data !== 'object') return error.message || fallback

  if (typeof data.detail === 'string') return data.detail
  if (typeof data.message === 'string') return data.message

  if (Array.isArray(data.errors)) {
    return data.errors.map((item: unknown) =>
      typeof item === 'string' ? item : (item as { description?: string }).description ?? '',
    ).filter(Boolean).join('\n') || fallback
  }

  if (data.errors && typeof data.errors === 'object') {
    return Object.values(data.errors).flat().filter((item): item is string => typeof item === 'string').join('\n') || fallback
  }

  return typeof data.title === 'string' ? data.title : fallback
}
