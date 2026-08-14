export interface Teacher {
  id: string | number
  name: string
  email: string
  specialty: string
  bio: string
  image: string
}

export type TeacherPayload = Omit<Teacher, 'id'>
