export interface Lesson { id: string | number; courseId: string | number; title: string; duration: string; videoId?: string; isFree: boolean }
export interface LessonPayload extends Omit<Lesson, 'id'> {}
export interface CourseOption { id: string | number; title: string }
