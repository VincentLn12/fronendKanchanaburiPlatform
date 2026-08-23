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
