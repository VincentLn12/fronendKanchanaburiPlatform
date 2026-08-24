import axios from 'axios'

export interface LoginResponse {
  accessToken: string
  refreshToken?: string
}

const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'https://localhost:7289/api',
})

export async function login(email: string, password: string) {
  const { data } = await authApi.post<LoginResponse>('/login', { email, password })
  return data
}

export async function refreshAccessToken(refreshToken: string) {
  const { data } = await authApi.post<LoginResponse>('/refresh', { refreshToken })
  return data
}

export async function register(email: string, password: string) {
  await authApi.post('/register', { email, password })
}

export async function getCurrentUser(token: string) {
  const { data } = await authApi.get<{ id: string; name: string; email: string; role: string }>('/account/me', { headers: { Authorization: `Bearer ${token}` } })
  return data
}
