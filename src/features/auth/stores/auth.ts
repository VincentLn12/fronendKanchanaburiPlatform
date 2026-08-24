import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { getCurrentUser, login } from '../api/authApi'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
}

function readUser(token: string | null): AuthUser | null {
  if (!token) return null
  try {
    const encodedPayload = token.split('.')[1]
    if (!encodedPayload) return null
    const payload = JSON.parse(atob(encodedPayload.replace(/-/g, '+').replace(/_/g, '/')))
    return {
      id: payload.sub ?? payload.nameid ?? payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ?? '',
      name: payload.name ?? payload.unique_name ?? payload.email ?? '',
      email: payload.email ?? '',
      role: payload.role ?? payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? '',
    }
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('accessToken'))
  const savedUser = localStorage.getItem('authUser')
  const user = ref<AuthUser | null>(readUser(token.value) ?? (savedUser ? JSON.parse(savedUser) as AuthUser : null))
  const isLoggedIn = computed(() => Boolean(token.value))

  async function signIn(email: string, password: string) {
    const data = await login(email, password)
    token.value = data.accessToken
    user.value = readUser(data.accessToken)
    localStorage.setItem('accessToken', data.accessToken)
    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken)
    user.value = await getCurrentUser(data.accessToken)
    localStorage.setItem('authUser', JSON.stringify(user.value))
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('authUser')
  }

  return { token, user, isLoggedIn, signIn, logout }
})
