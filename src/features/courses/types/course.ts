export interface Instructor {
  name: string
  role: string
  bio: string
  image: string
}

export interface Course {
  id: number | string
  title: string
  description: string
  level: 'ระดับพื้นฐาน' | 'ระดับกลาง' | 'ระดับขั้นสูง'
  price: number
  image: string
  videoId?: string
  learningOutcomes?: string[]
  instructor?: Instructor
}

export interface Lesson {
  id: string | number
  courseId: string | number
  title: string
  duration: string
  videoId: string
  isFree: boolean
}
