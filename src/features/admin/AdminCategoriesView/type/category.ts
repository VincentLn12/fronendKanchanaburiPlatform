export interface Category {
  id: string | number
  name: string
  slug: string
  description: string
}

export interface CategoryPayload {
  name: string
  slug: string
  description: string
}
