export interface AdminUser {
  id: string | number
  name: string
  email: string
  password?: string
  role: 'admin' | 'user'
}

export type UserPayload = Omit<AdminUser, 'id'>

