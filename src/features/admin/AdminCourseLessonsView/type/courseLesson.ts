export interface CourseLesson {
  id: string | number
  courseId: string | number
  title: string
  duration: string
  videoId?: string
  isFree: boolean
}

export type CourseLessonPayload = Omit<CourseLesson, 'id'>

export interface CourseSummary {
  id: string | number
  title?: string
  description?: string
}

