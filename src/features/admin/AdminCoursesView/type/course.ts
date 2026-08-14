export interface Course {
  id: string | number
  title: string
  description?: string
  level?: string
  price?: number
  image?: string
  instructor?: {
    id?: string | number
    name?: string
    role?: string
    bio?: string
    image?: string
  }
}

export interface CoursePayload {
  title: string
  description: string
  level: string
  price: number
  image: string
  instructor: {
    id?: string | number
    name: string
    role: string
    bio: string
    image: string
  }
}
