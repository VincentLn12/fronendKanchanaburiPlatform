import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import api from '@/shared/services/api'

export interface User {
  id?: number | string
  name: string
  email: string
  password: string
  role: 'user' | 'admin'
}

const SESSION_KEY = 'online-course-user'

export const useAuthStore = defineStore('auth', () => {
  const savedUser = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') as User | null
  const user = ref<User | null>(savedUser ? { ...savedUser, role: savedUser.role || 'user' } : null)
  const isAuthenticated = computed(() => user.value !== null)

  async function register(name: string, email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase()
    const existing = await api.get<User[]>('/users', { params: { email: normalizedEmail } })
    if (existing.data.length > 0) throw new Error('อีเมลนี้ถูกใช้งานแล้ว')

    const response = await api.post<User>('/users', {
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: 'user',
    })
    setUser(response.data)
  }

  async function login(email: string, password: string) {
    const response = await api.get<User[]>('/users', {
      params: { email: email.trim().toLowerCase(), password },
    })
    const loggedInUser = response.data[0]
    if (!loggedInUser) throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
    setUser(loggedInUser)
  }

  function setUser(value: User) {
    const normalizedUser = { ...value, role: value.role || 'user' }
    user.value = normalizedUser
    localStorage.setItem(SESSION_KEY, JSON.stringify(normalizedUser))
  }

  function logout() {
    user.value = null
    localStorage.removeItem(SESSION_KEY)
  }

  function hasRole(role: User['role']) {
    return user.value?.role === role
  }

  return { user, isAuthenticated, register, login, logout, hasRole }
})
